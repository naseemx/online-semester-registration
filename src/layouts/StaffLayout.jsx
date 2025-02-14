import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoneyBill, FaUserCircle, FaBell, FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import styles from './StaffLayout.module.css';

const StaffLayout = ({ children }) => {
    const { user } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <Link to="/staff/fines">SR System</Link>
                </div>
                <nav className={styles.nav}>
                    <Link to="/staff/fines" className={styles.navItem}>
                        <FaMoneyBill />
                        <span>Manage Fines</span>
                    </Link>
                    {/* Add more staff navigation items here if needed */}
                </nav>
            </aside>
            <main className={styles.main}>
                <Header />
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default StaffLayout; 