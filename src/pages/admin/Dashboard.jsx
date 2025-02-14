import React, { useState, useEffect } from 'react';
import { FaChartLine } from 'react-icons/fa';
import styles from './Dashboard.module.css';
import { adminAPI } from '../../utils/api';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTutors: 0,
        totalStaff: 0,
        completedRegistrations: 0,
        pendingRegistrations: 0,
        pendingFines: '₹0.00'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await adminAPI.getDashboardStats();
                if (response.data.success) {
                    setStats(response.data.data);
                } else {
                    throw new Error('Failed to fetch statistics');
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to load dashboard statistics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className={styles['loading-container']}>
                <div className={styles['loading-spinner']} />
                <p>Loading dashboard statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles['dashboard-container']}>
                <div className={styles['error-alert']}>
                    {error}
                </div>
            </div>
        );
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className={styles['dashboard-container']}>
            <div className={styles['dashboard-header']}>
                <div className={styles['header-title']}>
                    <h1>
                        <FaChartLine className={styles['header-icon']} />
                        Dashboard Overview
                    </h1>
                    <p className={styles.date}>{currentDate}</p>
                </div>
            </div>

            <div className={styles['stats-grid']}>
                <section className={styles['stats-section']}>
                    <h2>User Statistics</h2>
                    <div className={styles['stats-cards']}>
                        <div className={`${styles['stat-card']} ${styles.primary}`}>
                            <div className={styles['stat-info']}>
                                <h3>Total Students</h3>
                                <p className={styles['stat-number']}>{stats.totalStudents}</p>
                            </div>
                            <div className={styles['stat-progress']} style={{ width: '100%' }} />
                        </div>
                        <div className={`${styles['stat-card']} ${styles.success}`}>
                            <div className={styles['stat-info']}>
                                <h3>Total Tutors</h3>
                                <p className={styles['stat-number']}>{stats.totalTutors}</p>
                            </div>
                            <div 
                                className={styles['stat-progress']} 
                                style={{ width: `${(stats.totalTutors / (stats.totalStudents || 1)) * 100}%` }} 
                            />
                        </div>
                        <div className={`${styles['stat-card']} ${styles.info}`}>
                            <div className={styles['stat-info']}>
                                <h3>Total Staff</h3>
                                <p className={styles['stat-number']}>{stats.totalStaff}</p>
                            </div>
                            <div 
                                className={styles['stat-progress']} 
                                style={{ width: `${(stats.totalStaff / (stats.totalStudents || 1)) * 100}%` }} 
                            />
                        </div>
                    </div>
                </section>

                <section className={styles['stats-section']}>
                    <h2>Registration Statistics</h2>
                    <div className={styles['stats-cards']}>
                        <div className={`${styles['stat-card']} ${styles.warning}`}>
                            <div className={styles['stat-info']}>
                                <h3>Completed Registrations</h3>
                                <p className={styles['stat-number']}>{stats.completedRegistrations}</p>
                            </div>
                            <div 
                                className={styles['stat-progress']} 
                                style={{ width: `${(stats.completedRegistrations / (stats.totalStudents || 1)) * 100}%` }} 
                            />
                        </div>
                        <div className={`${styles['stat-card']} ${styles.danger}`}>
                            <div className={styles['stat-info']}>
                                <h3>Pending Registrations</h3>
                                <p className={styles['stat-number']}>{stats.pendingRegistrations}</p>
                            </div>
                            <div 
                                className={styles['stat-progress']} 
                                style={{ width: `${(stats.pendingRegistrations / (stats.totalStudents || 1)) * 100}%` }} 
                            />
                        </div>
                        <div className={`${styles['stat-card']} ${styles.primary}`}>
                            <div className={styles['stat-info']}>
                                <h3>Pending Fines</h3>
                                <p className={styles['stat-number']}>{stats.pendingFines}</p>
                            </div>
                            <div className={styles['stat-progress']} style={{ width: '100%' }} />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard; 