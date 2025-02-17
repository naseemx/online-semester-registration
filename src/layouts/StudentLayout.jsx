import React from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaCheckCircle, FaUserGraduate } from 'react-icons/fa';
import Header from '../components/Header';
import styles from './StudentLayout.module.css';

const StudentLayout = ({ children }) => {
    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <Link to="/student/registration">SR System</Link>
                </div>
                <nav className={styles.nav}>
                    <Link to="/student/registration" className={styles.navItem}>
                        <FaClipboardList />
                        <span>Registration</span>
                    </Link>
                    <Link to="/student/status" className={styles.navItem}>
                        <FaCheckCircle />
                        <span>Status</span>
                    </Link>
                    <Link to="/profile" className={styles.navItem}>
                        <FaUserGraduate />
                        <span>Profile</span>
                    </Link>
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

export default StudentLayout; 