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

        // Filter notifications based on user role
        if (req.user.role !== 'admin') {
            const roleMap = {
                'student': 'students',
                'staff': 'staff',
                'tutor': 'tutors',
                'admin': 'admins'
            };

            const userRole = roleMap[req.user.role];
            if (!userRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user role'
                });
            }

            query.$or = [
                { recipients: 'all' },
                { recipients: userRole }
            ];
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

        // Validate recipients
        const validRecipients = ['all', 'students', 'staff', 'tutors', 'admins'];
        if (!validRecipients.includes(recipients)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recipients value'
            });
        }

        const notification = new Notification({
            title,
            message,
            type,
            recipients,
            createdBy: req.user.id // Changed from req.session.user.id to req.user.id
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

        // Check if the user has permission to read this notification
        if (req.user.role !== 'admin') {
            const roleMap = {
                'student': 'students',
                'staff': 'staff',
                'tutor': 'tutors',
                'admin': 'admins'
            };

            const userRole = roleMap[req.user.role];
            if (notification.recipients !== 'all' && notification.recipients !== userRole) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this notification'
                });
            }
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

        // Only allow admins or the creator to delete notifications
        if (req.user.role !== 'admin' && notification.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this notification'
            });
        }

        await Notification.deleteOne({ _id: req.params.id });

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