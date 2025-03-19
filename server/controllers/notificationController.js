const Notification = require('../models/Notification');
const User = require('../models/User');

// Get notifications
const getNotifications = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const { status } = req.query;
        let query = { user: req.user._id };

        // Filter by read status
        if (status === 'read') {
            query.read = true;
        } else if (status === 'unread') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
};

// Send notification
const sendNotification = async (req, res) => {
    try {
        const { title, message, type = 'info', recipients = 'all' } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Get users based on recipient type
        let users = [];
        switch (recipients) {
            case 'all':
                users = await User.find({});
                break;
            case 'students':
                users = await User.find({ role: 'student' });
                break;
            case 'staff':
                users = await User.find({ role: 'staff' });
                break;
            case 'tutors':
                users = await User.find({ role: 'tutor' });
                break;
            case 'admins':
                users = await User.find({ role: 'admin' });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid recipient type'
                });
        }

        // Create notifications for all users
        const notifications = await Promise.all(
            users.map(user => 
                new Notification({
                    user: user._id,
                    title,
                    message,
                    type,
                    read: false
                }).save()
            )
        );

        res.json({
            success: true,
            data: notifications,
            message: `Notification sent to ${notifications.length} users`
        });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error sending notification'
        });
    }
};

// Get unread notifications for the current user
const getUnreadNotifications = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const notifications = await Notification.find({
            user: req.user._id,
            read: false
        })
        .sort({ createdAt: -1 })
        .limit(10);

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching unread notifications:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching notifications'
        });
    }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error marking notification as read'
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await notification.deleteOne();

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification'
        });
    }
};

module.exports = {
    getNotifications,
    sendNotification,
    getUnreadNotifications,
    markAsRead,
    deleteNotification
}; 