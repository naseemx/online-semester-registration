import { useState, useEffect } from 'react';
import { FaBell, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../utils/api';
import styles from './Header.module.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setError(null);
            const response = await notificationAPI.getUnread();
            if (response.data.success) {
                setNotifications(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to load notifications');
            setNotifications([]); // Clear notifications on error
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            setError(null);
            const response = await notificationAPI.markAsRead(id);
            if (response.data.success) {
                // Update local state to remove the read notification
                setNotifications(prevNotifications => 
                    prevNotifications.filter(notification => notification._id !== id)
                );
                setShowDropdown(false);
            } else {
                throw new Error(response.data.message || 'Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            setError('Failed to mark notification as read');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'error':
                return styles.notificationError;
            case 'warning':
                return styles.notificationWarning;
            case 'success':
                return styles.notificationSuccess;
            default:
                return styles.notificationInfo;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest(`.${styles.notifications}`)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showDropdown]);

    return (
        <div className={styles.notifications}>
            <button
                className={styles.notificationButton}
                onClick={() => setShowDropdown(!showDropdown)}
                title="Notifications"
            >
                <FaBell className={styles.icon} />
                {notifications.length > 0 && (
                    <span className={styles.badge}>
                        {notifications.length}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className={styles.notificationDropdown}>
                    <div className={styles.notificationHeader}>
                        <h6 className={styles.notificationTitle}>Notifications</h6>
                    </div>
                    <div className={styles.notificationDivider} />
                    {error ? (
                        <div className={styles.notificationError}>
                            <FaExclamationTriangle className={styles.errorIcon} />
                            {error}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className={styles.notificationEmpty}>
                            No new notifications
                        </div>
                    ) : (
                        <>
                            {notifications.map((notification) => (
                                <button
                                    key={notification._id}
                                    className={`${styles.notificationItem} ${getNotificationIcon(notification.type)}`}
                                    onClick={() => handleMarkAsRead(notification._id)}
                                >
                                    <div>
                                        <small className={styles.notificationItemTitle}>{notification.title}</small>
                                    </div>
                                    <small className={styles.notificationItemMessage}>
                                        {notification.message}
                                    </small>
                                    <small className={styles.notificationItemTime}>
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </small>
                                </button>
                            ))}
                            <div className={styles.notificationDivider} />
                            <div className={styles.notificationFooter}>
                                <small>
                                    Click on a notification to mark it as read
                                </small>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell; 