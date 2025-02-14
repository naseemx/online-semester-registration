import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBell, FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styles from './Header.module.css';

const Header = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerRight}>
                <button 
                    className={styles.themeToggle}
                    onClick={toggleDarkMode}
                    title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {darkMode ? <FaSun className={styles.icon} /> : <FaMoon className={styles.icon} />}
                </button>
                <div className={styles.notifications}>
                    <FaBell className={styles.icon} />
                    <span className={styles.badge}>0</span>
                </div>
                <div className={styles.profile}>
                    <button 
                        className={styles.profileButton}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <FaUserCircle className={styles.icon} />
                        <span>{user?.username || 'User'}</span>
                    </button>
                    {showProfileMenu && (
                        <div className={styles.profileMenu}>
                            <Link 
                                to="/profile" 
                                className={styles.menuItem}
                                onClick={() => setShowProfileMenu(false)}
                            >
                                Profile
                            </Link>
                            <hr className={styles.divider} />
                            <button 
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    handleLogout();
                                }} 
                                className={styles.menuItem}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header; 