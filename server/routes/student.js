const express = require('express');
const router = express.Router();
const { getStatus, applyRegistration, getVerificationStatus } = require('../controllers/studentController');
const { isAuthenticated, hasRole, isOwnStudent } = require('../middleware/auth');

// All routes require authentication and student role
router.use(isAuthenticated);
router.use(hasRole(['student']));

// Student routes
router.get('/status', getStatus);
router.post('/registration/apply', applyRegistration);
router.get('/verification-status', getVerificationStatus);

module.exports = router; 