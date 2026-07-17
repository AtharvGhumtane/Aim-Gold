import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/layout/DashboardLayout';
import { clientServer, BASE_URL } from '@/config';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import styles from './index.module.css';

const TABS = ['Calendar', 'Matches', 'Bracket', 'Standings', 'Players', 'Photos'];

export default function EventDetailPage() {
  const router = useRouter();
  const { eventId } = router.query;
  const authState = useSelector((s) => s.auth);

  const [event, setEvent]       = useState(null);
  const [isHost, setIsHost]     = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('Matches');
  const [activeSport, setActiveSport] = useState(0);

  // Matches
  const [matches, setMatches] = useState([]);
  // Photos
  const [photos, setPhotos] = useState([]);

  // Host modals / forms
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [teamForm, setTeamForm] = useState({ teamName: '', color: '#667eea', players: '' });
  const [matchForm, setMatchForm] = useState({ homeTeamName: '', awayTeamName: '', round: 'Group Stage', matchDate: '', venue: '' });
  const [formMsg, setFormMsg] = useState('');

  // Score update inline
  const [scoreEdits, setScoreEdits] = useState({});

  // Photo upload
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoMsg, setPhotoMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await clientServer.get(`/events/${eventId}`, {
        headers: token ? { 'x-auth-token': token } : {},
      });
      setEvent(res.data.event);
      setIsHost(res.data.isHost);
      setIsFollower(res.data.isFollower);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  const fetchMatches = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await clientServer.get(`/events/${eventId}/matches`);
      setMatches(res.data.matches || []);
    } catch (e) { console.error(e); }
  }, [eventId]);

  const fetchPhotos = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await clientServer.get(`/events/${eventId}/photos`);
      setPhotos(res.data.photos || []);
    } catch (e) { console.error(e); }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
    fetchMatches();
    fetchPhotos();
  }, [fetchEvent, fetchMatches, fetchPhotos]);

  // Poll matches every 5 seconds while on Matches or Bracket tab
  useEffect(() => {
    if (!['Matches', 'Bracket', 'Standings'].includes(activeTab)) return;
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, [activeTab, fetchMatches]);

  // ── Add team ──────────────────────────────────────────────────────
  const handleAddTeam = async (e) => {
    e.preventDefault();
    setFormMsg('');
    const sportName = event.sports[activeSport]?.sportName;
    try {
      const players = teamForm.players
        ? teamForm.players.split(',').map(n => ({ name: n.trim() })).filter(p => p.name)
        : [];
      await clientServer.post(`/events/${eventId}/teams`, {
        token, sportName,
        teamName: teamForm.teamName,
        color: teamForm.color,
        players: JSON.stringify(players),
      });
      setFormMsg('✅ Team added!');
      setShowAddTeam(false);
      fetchEvent();
    } catch (err) {
      setFormMsg('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  // ── Add match ─────────────────────────────────────────────────────
  const handleAddMatch = async (e) => {
    e.preventDefault();
    setFormMsg('');
    const sportName = event.sports[activeSport]?.sportName;
    try {
      await clientServer.post(`/events/${eventId}/matches`, {
        token, sportName, ...matchForm,
      });
      setFormMsg('✅ Match created!');
      setShowAddMatch(false);
      fetchMatches();
    } catch (err) {
      setFormMsg('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  // ── Update score ──────────────────────────────────────────────────
  const handleScoreUpdate = async (matchId, status) => {
    const edit = scoreEdits[matchId] || {};
    try {
      await clientServer.post(`/events/${eventId}/matches/${matchId}/score`, {
        token,
        homeScore: edit.homeScore,
        awayScore: edit.awayScore,
        status: status || 'live',
      });
      fetchMatches();
      fetchEvent(); // refresh standings
      setScoreEdits(prev => { const next = { ...prev }; delete next[matchId]; return next; });
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // ── Upload photo ──────────────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    setPhotoMsg('');
    if (!photoFile) { setPhotoMsg('❌ Please select an image'); return; }
    const fd = new FormData();
    fd.append('token', token);
    fd.append('caption', photoCaption);
    fd.append('media', photoFile);
    try {
      await clientServer.post(`/events/${eventId}/photos`, fd);
      setPhotoMsg('✅ Photo uploaded!');
      setPhotoCaption('');
      setPhotoFile(null);
      fetchPhotos();
    } catch (err) {
      setPhotoMsg('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  // ── Like photo ────────────────────────────────────────────────────
  const handleLikePhoto = async (photoId) => {
    try {
      await clientServer.post(`/events/${eventId}/photos/${photoId}/like`, { token });
      fetchPhotos();
    } catch (e) { console.error(e); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBD';

  if (loading) return (
    <DashboardLayout>
      <div className={styles.center}>
        <div className={styles.spinner} />
        <p>Loading event…</p>
      </div>
    </DashboardLayout>
  );

  if (!event) return (
    <DashboardLayout>
      <div className={styles.center}><p>Event not found.</p></div>
    </DashboardLayout>
  );

  const currentSport = event.sports?.[activeSport];
  const sportMatches = matches.filter(m => m.sport === currentSport?.sportName);
  const groupMatches = sportMatches.filter(m => m.round === 'Group Stage');
  const knockoutMatches = sportMatches.filter(m => m.round !== 'Group Stage');

  // ── Calendar helpers ──────────────────────────────────────────────
  const calendarDays = (() => {
    if (!event.startDate || !event.endDate) return [];
    const days = [];
    const start = new Date(event.startDate);
    const end   = new Date(event.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayMatches = matches.filter(m => m.matchDate && m.matchDate.startsWith?.(dateStr) || (m.matchDate && new Date(m.matchDate).toISOString().split('T')[0] === dateStr));
      days.push({ date: new Date(d), matches: dayMatches });
    }
    return days;
  })();

  // ── Bracket helpers ───────────────────────────────────────────────
  const KNOCKOUT_ROUNDS = ['Quarter Final', 'Semi Final', 'Final'];
  const getKnockoutRound = (round) => knockoutMatches.filter(m => m.round === round);

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Event Header ───────────────────────────────────────── */}
        <div className={styles.header}>
          {event.coverImage && (
            <img className={styles.coverImg} src={`${BASE_URL}/uploads/${event.coverImage}`} alt={event.name} />
          )}
          <div className={styles.headerOverlay}>
            <div className={styles.headerContent}>
              <div>
                <div className={styles.sportChips}>
                  {event.sports?.map((s, i) => (
                    <span key={i} className={styles.chip}>{s.sportName}</span>
                  ))}
                </div>
                <h1 className={styles.eventTitle}>{event.name}</h1>
                {event.description && <p className={styles.eventDesc}>{event.description}</p>}
                <p className={styles.eventDates}>📅 {formatDate(event.startDate)} → {formatDate(event.endDate)}</p>
              </div>
              <div className={styles.headerMeta}>
                <img
                  className={styles.hostAvatar}
                  src={event.hostId?.profilePicture
                    ? `${BASE_URL}/uploads/${event.hostId.profilePicture}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(event.hostId?.name || 'H')}`}
                  alt={event.hostId?.name}
                />
                <div>
                  <p className={styles.hostLabel}>Hosted by</p>
                  <p className={styles.hostName}>{event.hostId?.name}</p>
                </div>
                <div className={styles.followerBadge}>
                  👥 {event.followers?.length || 0} <span>followers</span>
                </div>
                {isHost && (
                  <span className={styles.hostBadge}>👑 HOST</span>
                )}
              </div>
            </div>
            {isHost && (
              <div className={styles.keyBadge}>
                🔑 Event Key: <strong>{event.eventKey}</strong>
                <span className={styles.keyHint}>(share with participants)</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Sport selector ─────────────────────────────────────── */}
        {event.sports?.length > 1 && (
          <div className={styles.sportTabs}>
            {event.sports.map((s, i) => (
              <button
                key={i}
                className={`${styles.sportTab} ${activeSport === i ? styles.sportTabActive : ''}`}
                onClick={() => setActiveSport(i)}
              >
                {s.sportName}
              </button>
            ))}
          </div>
        )}

        {/* ── Main Tab Bar ───────────────────────────────────────── */}
        <div className={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ══════ TAB: CALENDAR ═════════════════════════════════════ */}
        {activeTab === 'Calendar' && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>📅 Event Calendar</h2>
            <div className={styles.calendarGrid}>
              {calendarDays.map((day, i) => (
                <div key={i} className={`${styles.calDay} ${day.matches.length ? styles.calDayActive : ''}`}>
                  <div className={styles.calDayHeader}>
                    <span className={styles.calDayName}>{day.date.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                    <span className={styles.calDayNum}>{day.date.getDate()}</span>
                    <span className={styles.calDayMonth}>{day.date.toLocaleDateString('en-GB', { month: 'short' })}</span>
                  </div>
                  {day.matches.length > 0 ? (
                    day.matches.map((m, j) => (
                      <div key={j} className={styles.calMatch}>
                        <span className={styles.calMatchSport}>{m.sport}</span>
                        <span className={styles.calMatchTeams}>{m.homeTeam?.name} vs {m.awayTeam?.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className={styles.calNoMatch}>No matches</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ TAB: MATCHES ══════════════════════════════════════ */}
        {activeTab === 'Matches' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>⚽ {currentSport?.sportName} Matches</h2>
              {isHost && (
                <button className={styles.actionBtn} onClick={() => { setFormMsg(''); setShowAddMatch(true); }}>
                  + Add Match
                </button>
              )}
            </div>
            {formMsg && <p className={styles.formMsg}>{formMsg}</p>}

            {sportMatches.length === 0 ? (
              <div className={styles.empty}>No matches yet{isHost ? ' — add one above!' : '.'}</div>
            ) : (
              <>
                {groupMatches.length > 0 && (
                  <>
                    <h3 className={styles.roundLabel}>Group Stage</h3>
                    {groupMatches.map(m => (
                      <MatchCard key={m._id} m={m} isHost={isHost} token={token} eventId={eventId}
                        scoreEdits={scoreEdits} setScoreEdits={setScoreEdits} handleScoreUpdate={handleScoreUpdate}
                        formatDateTime={formatDateTime} />
                    ))}
                  </>
                )}
                {knockoutMatches.length > 0 && (
                  <>
                    <h3 className={styles.roundLabel}>Knockout Rounds</h3>
                    {knockoutMatches.map(m => (
                      <MatchCard key={m._id} m={m} isHost={isHost} token={token} eventId={eventId}
                        scoreEdits={scoreEdits} setScoreEdits={setScoreEdits} handleScoreUpdate={handleScoreUpdate}
                        formatDateTime={formatDateTime} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════ TAB: BRACKET ══════════════════════════════════════ */}
        {activeTab === 'Bracket' && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>🏆 {currentSport?.sportName} Knockout Bracket</h2>
            {knockoutMatches.length === 0 ? (
              <div className={styles.empty}>
                Bracket will appear once group stage is complete and knockout matches are added.
              </div>
            ) : (
              <div className={styles.bracket}>
                {KNOCKOUT_ROUNDS.map(round => {
                  const roundMatches = getKnockoutRound(round);
                  if (!roundMatches.length) return null;
                  return (
                    <div key={round} className={styles.bracketRound}>
                      <h4 className={styles.bracketRoundTitle}>{round}</h4>
                      {roundMatches.map(m => (
                        <div key={m._id} className={`${styles.bracketMatch} ${m.status === 'completed' ? styles.bracketMatchDone : ''}`}>
                          <div className={`${styles.bracketTeam} ${m.winner === m.homeTeam?.name ? styles.bracketWinner : ''}`}>
                            <span className={styles.bracketTeamColor} style={{ background: m.homeTeam?.color }} />
                            <span>{m.homeTeam?.name}</span>
                            <span className={styles.bracketScore}>{m.homeScore}</span>
                          </div>
                          <div className={styles.bracketDivider} />
                          <div className={`${styles.bracketTeam} ${m.winner === m.awayTeam?.name ? styles.bracketWinner : ''}`}>
                            <span className={styles.bracketTeamColor} style={{ background: m.awayTeam?.color }} />
                            <span>{m.awayTeam?.name}</span>
                            <span className={styles.bracketScore}>{m.awayScore}</span>
                          </div>
                          <div className={styles.bracketStatus}>{m.status}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════ TAB: STANDINGS ════════════════════════════════════ */}
        {activeTab === 'Standings' && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>📊 {currentSport?.sportName} Standings</h2>
            <p className={styles.tieBreakNote}>
              Tie-break order: Points → Goal Difference → Goals Scored → Head-to-Head → Alphabetical
            </p>
            {!currentSport?.standings?.length ? (
              <div className={styles.empty}>Standings will appear after group matches are completed.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th>
                      <th>GF</th><th>GA</th><th>GD</th><th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSport.standings.map((row, i) => (
                      <tr key={row.teamName} className={i < currentSport.advanceCount ? styles.advanceRow : ''}>
                        <td>{i + 1}</td>
                        <td className={styles.teamCell}>
                          <span className={styles.teamDot} style={{ background: currentSport.teams?.find(t => t.name === row.teamName)?.color || '#667eea' }} />
                          {row.teamName}
                          {i < currentSport.advanceCount && <span className={styles.advanceBadge}>↑</span>}
                        </td>
                        <td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td>
                        <td>{row.goalsFor}</td><td>{row.goalsAgainst}</td>
                        <td className={(row.goalsFor - row.goalsAgainst) >= 0 ? styles.gdPos : styles.gdNeg}>
                          {row.goalsFor - row.goalsAgainst > 0 ? '+' : ''}{row.goalsFor - row.goalsAgainst}
                        </td>
                        <td className={styles.ptsCell}>{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={styles.advanceNote}>
                  ↑ Top {currentSport.advanceCount} team{currentSport.advanceCount > 1 ? 's' : ''} advance to knockout
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══════ TAB: PLAYERS ══════════════════════════════════════ */}
        {activeTab === 'Players' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>👥 {currentSport?.sportName} — Teams & Players</h2>
              {isHost && (
                <button className={styles.actionBtn} onClick={() => { setFormMsg(''); setShowAddTeam(true); }}>
                  + Add Team
                </button>
              )}
            </div>
            {formMsg && <p className={styles.formMsg}>{formMsg}</p>}
            {!currentSport?.teams?.length ? (
              <div className={styles.empty}>No teams registered yet{isHost ? ' — add one above!' : '.'}</div>
            ) : (
              <div className={styles.teamGrid}>
                {currentSport.teams.map((team, i) => (
                  <div key={i} className={styles.teamCard}>
                    <div className={styles.teamCardHeader} style={{ background: team.color }}>
                      <span className={styles.teamCardName}>{team.name}</span>
                    </div>
                    <div className={styles.teamCardBody}>
                      {team.players?.length ? (
                        <ul className={styles.playerList}>
                          {team.players.map((p, j) => (
                            <li key={j} className={styles.playerItem}>
                              <span className={styles.playerNum}>{j + 1}</span>
                              {p.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.noPlayers}>No players listed</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════ TAB: PHOTOS ═══════════════════════════════════════ */}
        {activeTab === 'Photos' && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>📸 Event Photos</h2>

            {isHost && (
              <form className={styles.photoUploadForm} onSubmit={handlePhotoUpload}>
                <label className={styles.photoFileLabel}>
                  {photoFile ? `📎 ${photoFile.name}` : '📎 Choose Photo'}
                  <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} hidden />
                </label>
                <input
                  className={styles.captionInput}
                  placeholder="Add a caption… (optional)"
                  value={photoCaption}
                  onChange={e => setPhotoCaption(e.target.value)}
                />
                <button type="submit" className={styles.actionBtn}>Upload</button>
                {photoMsg && <span className={styles.formMsg}>{photoMsg}</span>}
              </form>
            )}

            {photos.length === 0 ? (
              <div className={styles.empty}>No photos yet{isHost ? ' — upload the first one!' : '.'}</div>
            ) : (
              <div className={styles.photoGrid}>
                {photos.map(photo => (
                  <div key={photo._id} className={styles.photoCard}>
                    <img
                      className={styles.photoImg}
                      src={`${BASE_URL}/uploads/${photo.media}`}
                      alt={photo.caption || 'Event photo'}
                    />
                    {photo.caption && <p className={styles.photoCaption}>{photo.caption}</p>}
                    <div className={styles.photoMeta}>
                      <button
                        className={styles.likeBtn}
                        onClick={() => handleLikePhoto(photo._id)}
                      >
                        ❤️ {photo.likes?.length || 0}
                      </button>
                      <span className={styles.photoDate}>{formatDate(photo.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════ ADD TEAM MODAL ════════════════════════════════════ */}
        {showAddTeam && (
          <div className={styles.overlay} onClick={() => setShowAddTeam(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Add Team to {currentSport?.sportName}</h2>
                <button className={styles.closeBtn} onClick={() => setShowAddTeam(false)}>✕</button>
              </div>
              <form className={styles.form} onSubmit={handleAddTeam}>
                <label>Team Name *</label>
                <input required value={teamForm.teamName}
                  onChange={e => setTeamForm(f => ({ ...f, teamName: e.target.value }))}
                  placeholder="e.g. Thunder FC" />
                <label>Team Color</label>
                <div className={styles.colorRow}>
                  <input type="color" value={teamForm.color}
                    onChange={e => setTeamForm(f => ({ ...f, color: e.target.value }))} />
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Team jersey color</span>
                </div>
                <label>Players (comma-separated names)</label>
                <input value={teamForm.players}
                  onChange={e => setTeamForm(f => ({ ...f, players: e.target.value }))}
                  placeholder="Alice, Bob, Charlie…" />
                {formMsg && <p className={styles.formMsg}>{formMsg}</p>}
                <button type="submit" className={styles.submitBtn}>Add Team</button>
              </form>
            </div>
          </div>
        )}

        {/* ══════ ADD MATCH MODAL ═══════════════════════════════════ */}
        {showAddMatch && currentSport && (
          <div className={styles.overlay} onClick={() => setShowAddMatch(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Add Match — {currentSport.sportName}</h2>
                <button className={styles.closeBtn} onClick={() => setShowAddMatch(false)}>✕</button>
              </div>
              <form className={styles.form} onSubmit={handleAddMatch}>
                <label>Home Team *</label>
                <select required value={matchForm.homeTeamName}
                  onChange={e => setMatchForm(f => ({ ...f, homeTeamName: e.target.value }))}>
                  <option value="">— select —</option>
                  {currentSport.teams?.map(t => <option key={t.name}>{t.name}</option>)}
                </select>
                <label>Away Team *</label>
                <select required value={matchForm.awayTeamName}
                  onChange={e => setMatchForm(f => ({ ...f, awayTeamName: e.target.value }))}>
                  <option value="">— select —</option>
                  {currentSport.teams?.map(t => <option key={t.name}>{t.name}</option>)}
                </select>
                <label>Round</label>
                <select value={matchForm.round}
                  onChange={e => setMatchForm(f => ({ ...f, round: e.target.value }))}>
                  {['Group Stage', 'Round of 16', 'Quarter Final', 'Semi Final', 'Final'].map(r => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <label>Match Date</label>
                <input type="date" value={matchForm.matchDate}
                  min={event.startDate?.split('T')[0]}
                  max={event.endDate?.split('T')[0]}
                  onChange={e => setMatchForm(f => ({ ...f, matchDate: e.target.value }))} />
                <label>Venue</label>
                <input value={matchForm.venue}
                  onChange={e => setMatchForm(f => ({ ...f, venue: e.target.value }))}
                  placeholder="e.g. Main Ground" />
                {formMsg && <p className={styles.formMsg}>{formMsg}</p>}
                <button type="submit" className={styles.submitBtn}>Create Match</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Reusable MatchCard sub-component ─────────────────────────────────────────
function MatchCard({ m, isHost, token, eventId, scoreEdits, setScoreEdits, handleScoreUpdate, formatDateTime }) {
  const edit = scoreEdits[m._id] || {};

  const statusColor = { scheduled: '#64748b', live: '#22c55e', completed: '#f59e0b' };

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchTop}>
        <span className={styles.matchRound}>{m.round}</span>
        <span className={styles.matchStatus} style={{ color: statusColor[m.status] || '#64748b' }}>
          {m.status === 'live' ? '🔴 LIVE' : m.status === 'completed' ? '✅ FT' : '🕐 Scheduled'}
        </span>
        {m.matchDate && <span className={styles.matchDate}>{formatDateTime(m.matchDate)}</span>}
        {m.venue && <span className={styles.matchVenue}>📍 {m.venue}</span>}
      </div>

      <div className={styles.matchBody}>
        <div className={styles.matchTeam}>
          <span className={styles.teamDot} style={{ background: m.homeTeam?.color }} />
          <span className={`${styles.matchTeamName} ${m.winner === m.homeTeam?.name ? styles.winnerName : ''}`}>
            {m.homeTeam?.name}
          </span>
        </div>

        <div className={styles.scoreDisplay}>
          {m.status === 'scheduled' ? (
            <span className={styles.vsText}>VS</span>
          ) : (
            <span className={styles.scoreText}>{m.homeScore} — {m.awayScore}</span>
          )}
        </div>

        <div className={`${styles.matchTeam} ${styles.matchTeamRight}`}>
          <span className={`${styles.matchTeamName} ${m.winner === m.awayTeam?.name ? styles.winnerName : ''}`}>
            {m.awayTeam?.name}
          </span>
          <span className={styles.teamDot} style={{ background: m.awayTeam?.color }} />
        </div>
      </div>

      {/* Host score update panel */}
      {isHost && m.status !== 'completed' && (
        <div className={styles.scoreUpdatePanel}>
          <input
            type="number" min={0} placeholder={`${m.homeTeam?.name} score`}
            value={edit.homeScore ?? m.homeScore}
            onChange={e => setScoreEdits(prev => ({ ...prev, [m._id]: { ...prev[m._id], homeScore: e.target.value } }))}
          />
          <span className={styles.scoreSep}>:</span>
          <input
            type="number" min={0} placeholder={`${m.awayTeam?.name} score`}
            value={edit.awayScore ?? m.awayScore}
            onChange={e => setScoreEdits(prev => ({ ...prev, [m._id]: { ...prev[m._id], awayScore: e.target.value } }))}
          />
          <button className={styles.liveBtn} onClick={() => handleScoreUpdate(m._id, 'live')}>Update</button>
          <button className={styles.ftBtn} onClick={() => handleScoreUpdate(m._id, 'completed')}>FT</button>
        </div>
      )}
    </div>
  );
}
