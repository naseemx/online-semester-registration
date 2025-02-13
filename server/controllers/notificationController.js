const Notification = require('../models/Notification');

// Get notifications
const getNotifications = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        // Filter by read status
        if (status === 'read') {
            query.read = true;
        } else if (status === 'unread') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username');

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
        const { title, message, type, recipients } = req.body;

        const notification = new Notification({
            title,
            message,
            type,
            recipients,
            createdBy: req.session.user.id
        });

        await notification.save();

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending notification'
        });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.read = true;
        await notification.save();

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification'
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await notification.remove();

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
    markAsRead,
    deleteNotification
}; 