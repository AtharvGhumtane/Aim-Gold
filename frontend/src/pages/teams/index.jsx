import React, { useEffect, useState } from 'react';
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import { clientServer, BASE_URL } from '@/config';
import { useSelector } from 'react-redux';
import styles from './styles.module.css';

export default function TeamsPage() {
  const authState = useSelector((state) => state.auth);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create Team Form States
  const [teamForm, setTeamForm] = useState({
    name: "",
    sport: "Football",
    description: "",
    maxSize: 11
  });

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await clientServer.get('/teams');
      setTeams(res.data.teams || []);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleFormChange = (e) => {
    setTeamForm({
      ...teamForm,
      [e.target.name]: e.target.value
    });
  };

  const showFeedback = (msg, type) => {
    if (type === "success") {
      setSuccessMsg(msg);
      setErrorMsg("");
    } else {
      setErrorMsg(msg);
      setSuccessMsg("");
    }
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 5000);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name.trim() || !teamForm.description.trim()) {
      showFeedback("Please fill out all fields", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await clientServer.post('/teams/create', {
        token,
        ...teamForm
      });
      showFeedback("Team created successfully!", "success");
      setIsModalOpen(false);
      setTeamForm({ name: "", sport: "Football", description: "", maxSize: 11 });
      fetchTeams();
    } catch (error) {
      showFeedback(error.response?.data?.message || "Failed to create team", "error");
    }
  };

  const handleJoinTeam = async (teamId) => {
    try {
      const token = localStorage.getItem("token");
      await clientServer.post('/teams/join', { token, teamId });
      showFeedback("Joined team successfully!", "success");
      fetchTeams();
    } catch (error) {
      showFeedback(error.response?.data?.message || "Failed to join team", "error");
    }
  };

  const handleLeaveTeam = async (teamId) => {
    try {
      const token = localStorage.getItem("token");
      await clientServer.post('/teams/leave', { token, teamId });
      showFeedback("Left team successfully!", "success");
      fetchTeams();
    } catch (error) {
      showFeedback(error.response?.data?.message || "Failed to leave team", "error");
    }
  };

  const isUserMember = (team) => {
    const currentUserId = authState.user?.userId?._id;
    if (!currentUserId || !team.members) return false;
    return team.members.some(m => m._id === currentUserId);
  };

  const getSportIcon = (sport) => {
    switch (sport) {
      case 'Football': return 'fa-futbol';
      case 'Basketball': return 'fa-basketball-ball';
      case 'Tennis': return 'fa-tennis-ball';
      case 'Cricket': return 'fa-baseball';
      case 'Fitness': return 'fa-dumbbell';
      default: return 'fa-users';
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.teamsWrapper}>
          <div className={styles.headerSection}>
            <div>
              <h1>🛡️ Sport Teams Hub</h1>
              <p>Join an existing squad or rally your own teammates to compete!</p>
            </div>
            <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>
              <i className="fa-solid fa-plus"></i> Create New Team
            </button>
          </div>

          {/* Feedback messages */}
          {successMsg && <div className={styles.successAlert}>{successMsg}</div>}
          {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

          {loading ? (
            <div className={styles.loader}>Loading squads...</div>
          ) : teams.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fa-solid fa-people-group"></i>
              <h2>No teams created yet</h2>
              <p>Be the pioneer! Click the button above to create the first team in the network.</p>
            </div>
          ) : (
            <div className={styles.teamsGrid}>
              {teams.map((team) => {
                const isMember = isUserMember(team);
                const isFull = team.members.length >= team.maxSize;
                
                return (
                  <div key={team._id} className={styles.teamCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.sportBadge}>
                        <i className={`fa-solid ${getSportIcon(team.sport)}`}></i> {team.sport}
                      </div>
                      <span className={styles.capacityBadge}>
                        👥 {team.members.length} / {team.maxSize}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <h3>{team.name}</h3>
                      <p className={styles.description}>{team.description}</p>
                      
                      <div className={styles.creatorInfo}>
                        <small>Created by: <strong>{team.creatorId?.name || "Unknown"}</strong></small>
                      </div>

                      <div className={styles.membersSection}>
                        <h4>Squad Members:</h4>
                        <div className={styles.avatarList}>
                          {team.members.map((member) => (
                            <div 
                              key={member._id} 
                              className={styles.avatarCircle} 
                              title={`${member.name} (@${member.username})`}
                            >
                              <img 
                                src={
                                  !member.profilePicture || member.profilePicture === 'default.jpg'
                                    ? `${BASE_URL}/uploads/default.jpg`
                                    : `${BASE_URL}/uploads/${member.profilePicture}`
                                } 
                                alt={member.name}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      {isMember ? (
                        <button 
                          className={styles.leaveBtn} 
                          onClick={() => handleLeaveTeam(team._id)}
                        >
                          <i className="fa-solid fa-arrow-right-from-bracket"></i> Leave Squad
                        </button>
                      ) : (
                        <button 
                          className={styles.joinBtn} 
                          onClick={() => handleJoinTeam(team._id)}
                          disabled={isFull}
                        >
                          {isFull ? (
                            <>Full Squad</>
                          ) : (
                            <><i className="fa-solid fa-plus-circle"></i> Join Squad</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Team Modal */}
          {isModalOpen && (
            <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
              <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>🛡️ Create Sport Team</h2>
                  <button className={styles.closeModalBtn} onClick={() => setIsModalOpen(false)}>&times;</button>
                </div>
                <form onSubmit={handleCreateTeam} className={styles.modalForm}>
                  <div className={styles.formGroup}>
                    <label>Team Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={teamForm.name} 
                      onChange={handleFormChange} 
                      placeholder="e.g. Real Madrid PICT"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Select Sport</label>
                    <select name="sport" value={teamForm.sport} onChange={handleFormChange}>
                      <option value="Football">Football</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Fitness">Fitness/Athletics</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Max Squad Size</label>
                    <input 
                      type="number" 
                      name="maxSize" 
                      value={teamForm.maxSize} 
                      onChange={handleFormChange} 
                      min="2" 
                      max="30"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description & Motto</label>
                    <textarea 
                      name="description" 
                      value={teamForm.description} 
                      onChange={handleFormChange} 
                      placeholder="Describe your team's goals, level, or location..."
                      rows="4"
                      required
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      Create Squad
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
