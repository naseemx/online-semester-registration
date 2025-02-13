import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import 'animate.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
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
            const response = await api.get('/notifications/unread');
            setNotifications(response.data.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'error':
                return 'text-danger';
            case 'warning':
                return 'text-warning';
            case 'success':
                return 'text-success';
            default:
                return 'text-info';
        }
    };

    return (
        <div className="nav-item dropdown">
            <button
                className="btn btn-link nav-link position-relative"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <FaBell />
                {notifications.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger animate__animated animate__bounceIn">
                        {notifications.length}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="dropdown-menu dropdown-menu-end show animate__animated animate__fadeIn">
                    <div className="dropdown-header">
                        <h6 className="mb-0">Notifications</h6>
                    </div>
                    <div className="dropdown-divider"></div>
                    {notifications.length === 0 ? (
                        <div className="dropdown-item text-muted">
                            No new notifications
                        </div>
                    ) : (
                        <>
                            {notifications.map((notification) => (
                                <button
                                    key={notification._id}
                                    className="dropdown-item text-wrap"
                                    onClick={() => handleMarkAsRead(notification._id)}
                                >
                                    <div className={getNotificationIcon(notification.type)}>
                                        <small className="fw-bold">{notification.title}</small>
                                    </div>
                                    <small className="text-muted d-block">
                                        {notification.message}
                                    </small>
                                    <small className="text-muted">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </small>
                                </button>
                            ))}
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-item text-center">
                                <small className="text-muted">
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