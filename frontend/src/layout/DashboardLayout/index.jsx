import React from 'react'
import { useEffect } from 'react';
import styles from "./index.module.css"
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux';
import { setTokenIsThere } from '../../config/redux/reducer/authReducer';
import { useSelector } from 'react-redux';

export default function DashboardLayout({children}) {
  const router = useRouter();
  const dispatch = useDispatch();  
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else{
      dispatch(setTokenIsThere());
    }
  }, []);

  return (
    <div className={styles.layoutWrapper}>
      <div className={styles.container}>
        <div className={styles.homeContainer}>
          {/* Sports-themed Sidebar */}
          <div className={styles.homeContainer_leftBar}>
            <div className={styles.sidebarContent}>
              {/* Quick Actions */}
              <div className={styles.quickActions}>
                <h3>Quick Actions</h3>
                <div 
                  onClick={() => router.push("/dashboard")}
                  className={`${styles.sideBarOption} ${router.pathname === '/dashboard' ? styles.active : ''}`}
                >
                  <div className={styles.iconWrapper}>
                    <i className="fa-solid fa-home"></i>
                  </div>
                  <div className={styles.optionContent}>
                    <span>Dashboard</span>
                    <small>Your sports hub</small>
                  </div>
                </div>

                <div 
                  onClick={() => router.push("/discover")}
                  className={`${styles.sideBarOption} ${router.pathname === '/discover' ? styles.active : ''}`}
                >
                  <div className={styles.iconWrapper}>
                    <i className="fa-solid fa-search"></i>
                  </div>
                  <div className={styles.optionContent}>
                    <span>Discover</span>
                    <small>Find athletes & teams</small>
                  </div>
                </div>

                <div 
                  onClick={() => router.push("/my_connections")}
                  className={`${styles.sideBarOption} ${router.pathname === '/my_connections' ? styles.active : ''}`}
                >
                  <div className={styles.iconWrapper}>
                    <i className="fa-solid fa-user-friends"></i>
                  </div>
                  <div className={styles.optionContent}>
                    <span>My Network</span>
                    <small>Sport connections</small>
                  </div>
                </div>

                <div 
                  onClick={() => router.push("/calendar")}
                  className={`${styles.sideBarOption} ${router.pathname === '/calendar' ? styles.active : ''}`}
                >
                  <div className={styles.iconWrapper}>
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <div className={styles.optionContent}>
                    <span>Events</span>
                    <small>Matches & tournaments</small>
                  </div>
                </div>

                <div 
                  onClick={() => router.push("/teams")}
                  className={`${styles.sideBarOption} ${router.pathname === '/teams' ? styles.active : ''}`}
                >
                  <div className={styles.iconWrapper}>
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div className={styles.optionContent}>
                    <span>Teams</span>
                    <small>Join or create teams</small>
                  </div>
                </div>
              </div>

              {/* Sports Categories */}
              <div className={styles.sportsCategories}>
                <h3>Sports</h3>
                <div className={styles.sportsList}>
                  <div className={styles.sportItem}>
                    <i className="fa-solid fa-futbol"></i>
                    <span>Football</span>
                  </div>
                  <div className={styles.sportItem}>
                    <i className="fa-solid fa-basketball-ball"></i>
                    <span>Basketball</span>
                  </div>
                  <div className={styles.sportItem}>
                    <i className="fa-solid fa-tennis-ball"></i>
                    <span>Tennis</span>
                  </div>
                  <div className={styles.sportItem}>
                    <i className="fa-solid fa-dumbbell"></i>
                    <span>Fitness</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
           
          {/* Main Feed Container - FIXED: Added scrollable wrapper */}
          <div className={styles.homeContainer_feedContainer}>
            <div className={styles.feedContent}>
              {children}
            </div>
          </div>

          {/* Enhanced Right Sidebar - FIXED: Added scrollable wrapper */}
          <div className={styles.homeContainer_extraContainer}>
            <div className={styles.extraContent}>
              {/* Trending Athletes */}
              <div className={styles.trendingSection}>
                <div className={styles.sectionHeader}>
                  <i className="fa-solid fa-fire"></i>
                  <h3>Trending Athletes</h3>
                </div>
                
                {authState.all_profiles_fetched && authState.all_users.slice(0, 5).map((profile) => (
                  <div key={profile._id} className={styles.extraContainer__profile}>
                    <div className={styles.profileAvatar}>
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div className={styles.profileInfo}>
                      <p className={styles.profileName}>{profile.userId.name}</p>
                      <span className={styles.profileSport}>Football Player</span>
                    </div>
                    <button className={styles.followBtn}>
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                ))}
              </div>

              {/* Upcoming Events */}
              <div className={styles.upcomingEvents}>
                <div className={styles.sectionHeader}>
                  <i className="fa-solid fa-calendar"></i>
                  <h3>Upcoming Events</h3>
                </div>
                
                <div className={styles.eventItem}>
                  <div className={styles.eventDate}>
                    <span className={styles.day}>25</span>
                    <span className={styles.month}>Dec</span>
                  </div>
                  <div className={styles.eventDetails}>
                    <p>City Football Championship</p>
                    <span>Mumbai Sports Complex</span>
                  </div>
                </div>

                <div className={styles.eventItem}>
                  <div className={styles.eventDate}>
                    <span className={styles.day}>28</span>
                    <span className={styles.month}>Dec</span>
                  </div>
                  <div className={styles.eventDetails}>
                    <p>Basketball League Finals</p>
                    <span>Sports Arena</span>
                  </div>
                </div>

                <div className={styles.eventItem}>
                  <div className={styles.eventDate}>
                    <span className={styles.day}>02</span>
                    <span className={styles.month}>Jan</span>
                  </div>
                  <div className={styles.eventDetails}>
                    <p>Tennis Open Tournament</p>
                    <span>Tennis Club</span>
                  </div>
                </div>
              </div>

              {/* Sports Stats */}
              <div className={styles.sportsStats}>
                <div className={styles.sectionHeader}>
                  <i className="fa-solid fa-chart-line"></i>
                  <h3>Your Stats</h3>
                </div>
                
                <div className={styles.statItem}>
                  <div className={styles.statIcon}>
                    <i className="fa-solid fa-trophy"></i>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>12</span>
                    <span className={styles.statLabel}>Matches Won</span>
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statIcon}>
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>156</span>
                    <span className={styles.statLabel}>Connections</span>
                  </div>
                </div>

                <div className={styles.statItem}>
                  <div className={styles.statIcon}>
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>8</span>
                    <span className={styles.statLabel}>Events Joined</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}