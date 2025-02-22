import { useState, useEffect } from 'react';
import { notificationAPI } from '../../utils/api';
import { 
    FaBell, FaEnvelope, FaExclamationTriangle, FaCheckCircle, 
    FaSpinner, FaTrash, FaEye, FaEyeSlash 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'animate.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [sending, setSending] = useState(false);
    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        type: 'info',
        recipients: 'all'
    });

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [filterStatus]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationAPI.getAll();
            if (response.data?.success) {
                setNotifications(response.data.data || []);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch notifications');
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            toast.error('Error fetching notifications');
            setError('Error fetching notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        try {
            setSending(true);
            const response = await notificationAPI.send(newNotification);
            if (response.data?.success) {
                toast.success('Notification sent successfully');
                setShowForm(false);
                setNewNotification({
                    title: '',
                    message: '',
                    type: 'info',
                    recipients: 'all'
                });
                await fetchNotifications();
            } else {
                throw new Error(response.data?.message || 'Failed to send notification');
            }
        } catch (err) {
            console.error('Error sending notification:', err);
            toast.error('Error sending notification');
            setError('Error sending notification');
        } finally {
            setSending(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const response = await notificationAPI.markAsRead(notificationId);
            if (response.data?.success) {
                toast.success('Notification marked as read');
                await fetchNotifications();
            } else {
                throw new Error(response.data?.message || 'Failed to mark notification as read');
            }
        } catch (err) {
            console.error('Error updating notification:', err);
            toast.error('Error updating notification');
            setError('Error updating notification');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) {
            return;
        }

        try {
            const response = await notificationAPI.delete(notificationId);
            if (response.data?.success) {
                toast.success('Notification deleted successfully');
                await fetchNotifications();
            } else {
                throw new Error(response.data?.message || 'Failed to delete notification');
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
            toast.error('Error deleting notification');
            setError('Error deleting notification');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'error':
                return <FaExclamationTriangle className="text-danger" />;
            case 'warning':
                return <FaExclamationTriangle className="text-warning" />;
            case 'success':
                return <FaCheckCircle className="text-success" />;
            default:
                return <FaBell className="text-info" />;
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow animate__animated animate__fadeIn">
                <div className="card-header bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">
                            <FaBell className="me-2" />
                            System Notifications
                        </h4>
                        <button
                            className="btn btn-light btn-sm"
                            onClick={() => setShowForm(!showForm)}
                        >
                            <FaEnvelope className="me-2" />
                            Send Notification
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {error && (
                        <div className="alert alert-danger animate__animated animate__shakeX">
                            {error}
                        </div>
                    )}

                    {/* Send Notification Form */}
                    {showForm && (
                        <div className="card mb-4 animate__animated animate__fadeIn">
                            <div className="card-body">
                                <h5 className="card-title">Send New Notification</h5>
                                <form onSubmit={handleSendNotification}>
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newNotification.title}
                                            onChange={(e) => setNewNotification({
                                                ...newNotification,
                                                title: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Message</label>
                                        <textarea
                                            className="form-control"
                                            value={newNotification.message}
                                            onChange={(e) => setNewNotification({
                                                ...newNotification,
                                                message: e.target.value
                                            })}
                                            required
                                            rows="3"
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Type</label>
                                                <select
                                                    className="form-select"
                                                    value={newNotification.type}
                                                    onChange={(e) => setNewNotification({
                                                        ...newNotification,
                                                        type: e.target.value
                                                    })}
                                                >
                                                    <option value="info">Information</option>
                                                    <option value="success">Success</option>
                                                    <option value="warning">Warning</option>
                                                    <option value="error">Error</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Recipients</label>
                                                <select
                                                    className="form-select"
                                                    value={newNotification.recipients}
                                                    onChange={(e) => setNewNotification({
                                                        ...newNotification,
                                                        recipients: e.target.value
                                                    })}
                                                >
                                                    <option value="all">All Users</option>
                                                    <option value="students">Students Only</option>
                                                    <option value="staff">Staff Only</option>
                                                    <option value="tutors">Tutors Only</option>
                                                    <option value="admins">Admins Only</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowForm(false);
                                                setNewNotification({
                                                    title: '',
                                                    message: '',
                                                    type: 'info',
                                                    recipients: 'all'
                                                });
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={sending}
                                        >
                                            {sending ? (
                                                <>
                                                    <FaSpinner className="me-2 spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <FaEnvelope className="me-2" />
                                                    Send Notification
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Notifications</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                        </div>
                    </div>

                    {/* Notifications List */}
                    {loading ? (
                        <div className="text-center py-4">
                            <FaSpinner className="me-2 animate__animated animate__rotateIn" />
                            Loading notifications...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <FaBell className="mb-2" size={24} />
                            <p>No notifications found</p>
                        </div>
                    ) : (
                        <div className="list-group">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`list-group-item list-group-item-action ${
                                        !notification.read ? 'bg-light' : ''
                                    } animate__animated animate__fadeIn`}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="d-flex align-items-center">
                                                {getNotificationIcon(notification.type)}
                                                <h6 className="mb-0 ms-2">{notification.title}</h6>
                                            </div>
                                            <p className="mb-1 mt-2">{notification.message}</p>
                                            <small className="text-muted">
                                                Sent to: {notification.recipients} • 
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                        <div className="btn-group">
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                disabled={notification.read}
                                            >
                                                {notification.read ? (
                                                    <FaEye />
                                                ) : (
                                                    <FaEyeSlash />
                                                )}
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDeleteNotification(notification._id)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications; 