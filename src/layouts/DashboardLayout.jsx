import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Header from '../components/Header';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children, navItems, logo = "SR System", logoLink = "/" }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className={styles.layout}>
            <button 
                className={`${styles.menuButton} ${isSidebarOpen ? styles.open : ''}`}
                onClick={toggleSidebar}
                aria-label="Toggle menu"
            >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            {isSidebarOpen && (
                <div className={styles.backdrop} onClick={() => setIsSidebarOpen(false)} />
            )}

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                <div className={styles.logo}>
                    <Link to={logoLink}>{logo}</Link>
                </div>
                <nav className={styles.nav}>
                    {navItems.map((item, index) => (
                        <Link 
                            key={index}
                            to={item.path} 
                            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
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

export default DashboardLayout; 