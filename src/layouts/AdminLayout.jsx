import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartBar, FaUsers, FaUserGraduate, FaHistory, FaBell, FaUserFriends } from 'react-icons/fa';
import Header from '../components/Header';
import styles from './AdminLayout.module.css';

const AdminLayout = ({ children }) => {
    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <Link to="/admin/dashboard">SR System</Link>
                </div>
                <nav className={styles.nav}>
                    <Link to="/admin/dashboard" className={styles.navItem}>
                        <FaChartBar />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/users" className={styles.navItem}>
                        <FaUsers />
                        <span>Users</span>
                    </Link>
                    <Link to="/admin/students" className={styles.navItem}>
                        <FaUserGraduate />
                        <span>Students</span>
                    </Link>
                    <Link to="/admin/tutor-assignments" className={styles.navItem}>
                        <FaUserFriends />
                        <span>Tutor Assignments</span>
                    </Link>
                    <Link to="/admin/logs" className={styles.navItem}>
                        <FaHistory />
                        <span>Logs</span>
                    </Link>
                    <Link to="/admin/notifications" className={styles.navItem}>
                        <FaBell />
                        <span>Notifications</span>
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

export default AdminLayout;