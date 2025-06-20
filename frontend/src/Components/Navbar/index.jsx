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
  const settingsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        {/* LEFT SIDE: Home + Calendar */}
        <div className={styles.navLeft}>
          <div
            className={styles.navIcon}
            onClick={() => router.push("/")}
          >
            <i className="fa-solid fa-th-large"></i>
          </div>
          <div
            className={styles.navIcon}
            onClick={() => router.push("/calendar")}
          >
            <i className="fa-solid fa-calendar"></i>
          </div>
        </div>

        {/* RIGHT SIDE: Greeting + Profile link + Settings */}
        <div className={styles.navRight}>
          {authState.profileFetched && authState.user?.userId?.name && (
            <div className={styles.profileContainer}>
              <p className={styles.greeting}>Hey, {authState.user.userId.name}</p>
              <div
                className={styles.profileIcon}
                onClick={() => router.push("/profile")}
              >
                <i className="fa-duotone fa-solid fa-id-card"></i>
              </div>
              
              {/* Settings Dropdown */}
              <div className={styles.settingsContainer} ref={settingsRef}>
                <div
                  className={styles.settingsIcon}
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                >
                  <i className="fa-solid fa-cog"></i>
                </div>
                
                {isSettingsOpen && (
                  <div className={styles.settingsCard}>
                    <div className={styles.settingsOption}>
                      <i className="fa-solid fa-shield-alt"></i>
                      <span>Privacy</span>
                    </div>
                    <div className={styles.settingsOption}>
                      <i className="fa-solid fa-file-contract"></i>
                      <span>Terms</span>
                    </div>
                    <div className={styles.settingsOption}>
                      <i className="fa-solid fa-info-circle"></i>
                      <span>Know More</span>
                    </div>
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
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}