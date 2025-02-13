import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { 
    FaBell, FaEnvelope, FaExclamationTriangle, FaCheckCircle, 
    FaSpinner, FaTrash, FaEye, FaEyeSlash 
} from 'react-icons/fa';
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
            const response = await adminAPI.getNotifications(filterStatus);
            setNotifications(response.data.data);
        } catch (err) {
            setError('Error fetching notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        try {
            setSending(true);
            await adminAPI.sendNotification(newNotification);
            setShowForm(false);
            setNewNotification({
                title: '',
                message: '',
                type: 'info',
                recipients: 'all'
            });
            fetchNotifications();
        } catch (err) {
            setError('Error sending notification');
        } finally {
            setSending(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await adminAPI.markNotificationAsRead(notificationId);
            fetchNotifications();
        } catch (err) {
            setError('Error updating notification');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) {
            return;
        }

        try {
            await adminAPI.deleteNotification(notificationId);
            fetchNotifications();
        } catch (err) {
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

                    {/* New Notification Form */}
                    {showForm && (
                        <div className="card mb-4 animate__animated animate__fadeIn">
                            <div className="card-body">
                                <form onSubmit={handleSendNotification}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newNotification.title}
                                                onChange={(e) => setNewNotification(prev => ({
                                                    ...prev,
                                                    title: e.target.value
                                                }))}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Type</label>
                                            <select
                                                className="form-select"
                                                value={newNotification.type}
                                                onChange={(e) => setNewNotification(prev => ({
                                                    ...prev,
                                                    type: e.target.value
                                                }))}
                                            >
                                                <option value="info">Info</option>
                                                <option value="success">Success</option>
                                                <option value="warning">Warning</option>
                                                <option value="error">Error</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Recipients</label>
                                            <select
                                                className="form-select"
                                                value={newNotification.recipients}
                                                onChange={(e) => setNewNotification(prev => ({
                                                    ...prev,
                                                    recipients: e.target.value
                                                }))}
                                            >
                                                <option value="all">All Users</option>
                                                <option value="students">Students</option>
                                                <option value="staff">Staff</option>
                                                <option value="tutors">Tutors</option>
                                                <option value="admins">Admins</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Message</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={newNotification.message}
                                                onChange={(e) => setNewNotification(prev => ({
                                                    ...prev,
                                                    message: e.target.value
                                                }))}
                                                required
                                            />
                                        </div>
                                        <div className="col-12">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={sending}
                                            >
                                                {sending ? (
                                                    <>
                                                        <FaSpinner className="me-2 animate__animated animate__rotateIn" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaEnvelope className="me-2" />
                                                        Send Notification
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary ms-2"
                                                onClick={() => setShowForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
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