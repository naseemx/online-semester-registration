const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

// All routes require authentication
router.use(isAuthenticated);

// Notification routes
router.get('/unread', getNotifications);
router.put('/:id/read', markAsRead);

module.exports = router; 