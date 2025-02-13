const express = require('express');
const router = express.Router();
const { login, logout, getStatus, updateProfile } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/logout', isAuthenticated, logout);
router.get('/status', isAuthenticated, getStatus);

// Protected routes
router.put('/profile', isAuthenticated, updateProfile);

module.exports = router; 