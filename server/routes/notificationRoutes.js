const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
    getNotifications,
    sendNotification,
    getUnreadNotifications,
    markAsRead,
    deleteNotification
} = require('../controllers/notificationController');

// Get all notifications (with optional status filter)
router.get('/', isAuthenticated, getNotifications);

// Get unread notifications
router.get('/unread', isAuthenticated, getUnreadNotifications);

// Send a new notification
router.post('/', isAuthenticated, sendNotification);

// Mark notification as read
router.put('/:id/read', isAuthenticated, markAsRead);

// Delete notification
router.delete('/:id', isAuthenticated, deleteNotification);

module.exports = router; 