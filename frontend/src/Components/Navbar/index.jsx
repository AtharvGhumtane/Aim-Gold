// src/Components/Navbar/index.jsx
import React, { useState, useEffect, useRef } from 'react'
import styles from "./styles.module.css"
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from '@/config/redux/reducer/authReducer';

export default function NavbarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const settingsRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }

    if (isSettingsOpen || isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen, isNotificationsOpen]);

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        {/* LEFT SIDE: Logo + Brand */}
        <div className={styles.navLeft}>
          <div className={styles.logoContainer} onClick={() => router.push("/")}>
            <div className={styles.logo}>
              <i className="fa-solid fa-trophy"></i>
            </div>
            <span className={styles.brandName}>SportConnect</span>
          </div>
        </div>

        {/* CENTER: Navigation Links */}
        <div className={styles.navCenter}>
          <div 
            className={`${styles.navLink} ${router.pathname === '/' ? styles.active : ''}`}
            onClick={() => router.push("/")}
          >
            <i className="fa-solid fa-home"></i>
            <span>Home</span>
          </div>
          <div 
            className={`${styles.navLink} ${router.pathname === '/discover' ? styles.active : ''}`}
            onClick={() => router.push("/discover")}
          >
            <i className="fa-solid fa-search"></i>
            <span>Discover</span>
          </div>
          <div 
            className={`${styles.navLink} ${router.pathname === '/events' ? styles.active : ''}`}
            onClick={() => router.push("/events")}
          >
            <i className="fa-solid fa-calendar-check"></i>
            <span>Events</span>
          </div>
          <div 
            className={`${styles.navLink} ${router.pathname === '/teams' ? styles.active : ''}`}
            onClick={() => router.push("/teams")}
          >
            <i className="fa-solid fa-users"></i>
            <span>Teams</span>
          </div>
          <div 
            className={`${styles.navLink} ${router.pathname === '/my_connections' ? styles.active : ''}`}
            onClick={() => router.push("/my_connections")}
          >
            <i className="fa-solid fa-user-friends"></i>
            <span>Network</span>
          </div>
        </div>

        {/* RIGHT SIDE: User Actions */}
        <div className={styles.navRight}>
          {authState.profileFetched && authState.user?.userId?.name && (
            <>
              {/* Notifications */}
              <div className={styles.notificationContainer} ref={notificationsRef}>
                <div
                  className={styles.notificationIcon}
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <i className="fa-solid fa-bell"></i>
                  <span className={styles.notificationBadge}>3</span>
                </div>
                
                {isNotificationsOpen && (
                  <div className={styles.notificationDropdown}>
                    <div className={styles.dropdownHeader}>
                      <h4>Notifications</h4>
                    </div>
                    <div className={styles.notificationItem}>
                      <i className="fa-solid fa-user-plus"></i>
                      <div>
                        <p>New connection request</p>
                        <span>2 minutes ago</span>
                      </div>
                    </div>
                    <div className={styles.notificationItem}>
                      <i className="fa-solid fa-calendar"></i>
                      <div>
                        <p>Upcoming match reminder</p>
                        <span>1 hour ago</span>
                      </div>
                    </div>
                    <div className={styles.notificationItem}>
                      <i className="fa-solid fa-trophy"></i>
                      <div>
                        <p>Tournament invitation</p>
                        <span>3 hours ago</span>
                      </div>
                    </div>
                    <div className={styles.viewAllNotifications}>
                      View All Notifications
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className={styles.userProfile}>
                <div className={styles.userAvatar} onClick={() => router.push("/profile")}>
                  <i className="fa-solid fa-user"></i>
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{authState.user.userId.name}</span>
                  <span className={styles.userRole}>Athlete</span>
                </div>
              </div>
              
              {/* Settings Dropdown */}
              <div className={styles.settingsContainer} ref={settingsRef}>
                <div
                  className={styles.settingsIcon}
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                >
                  <i className="fa-solid fa-ellipsis-v"></i>
                </div>
                
                {isSettingsOpen && (
                  <div className={styles.settingsCard}>
                    <div className={styles.settingsOption} onClick={() => router.push("/profile")}>
                      <i className="fa-solid fa-user-circle"></i>
                      <span>My Profile</span>
                    </div>
                    <div className={styles.settingsOption} onClick={() => router.push("/settings")}>
                      <i className="fa-solid fa-cog"></i>
                      <span>Settings</span>
                    </div>
                    <div className={styles.settingsOption}>
                      <i className="fa-solid fa-shield-alt"></i>
                      <span>Privacy</span>
                    </div>
                    <div className={styles.settingsOption}>
                      <i className="fa-solid fa-question-circle"></i>
                      <span>Help & Support</span>
                    </div>
                    <div className={styles.settingsDivider}></div>
                    <div 
                      className={styles.settingsOption}
                      onClick={() => {
                        localStorage.removeItem("token");
                        dispatch(reset());
                        router.push("/login");
                        setIsSettingsOpen(false);
                      }}
                    >
                      <i className="fa-solid fa-sign-out-alt"></i>
                      <span>Logout</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}