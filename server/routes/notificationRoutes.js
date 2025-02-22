const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getNotifications,
    sendNotification,
    getUnreadNotifications,
    markAsRead,
    deleteNotification
} = require('../controllers/notificationController');

// Get all notifications (with optional status filter)
router.get('/', auth, getNotifications);

// Get unread notifications
router.get('/unread', auth, getUnreadNotifications);

// Send a new notification
router.post('/', auth, sendNotification);

// Mark notification as read
router.put('/:id/read', auth, markAsRead);

// Delete notification
router.delete('/:id', auth, deleteNotification);

module.exports = router; 