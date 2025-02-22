import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';
import Header from '../components/Header';
import styles from './TutorLayout.module.css';

const TutorLayout = ({ children }) => {
    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <Link to="/tutor/registrations">SR System</Link>
                </div>
                <nav className={styles.nav}>
                    <Link to="/tutor/registrations" className={styles.navItem}>
                        <FaGraduationCap />
                        <span>Student Details</span>
                    </Link>
                    <Link to="/tutor/semester-registration" className={styles.navItem}>
                        <FaCalendarAlt />
                        <span>Semester Registration</span>
                    </Link>
                    <Link to="/tutor/reports" className={styles.navItem}>
                        <FaFileAlt />
                        <span>Reports</span>
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

export default TutorLayout; 