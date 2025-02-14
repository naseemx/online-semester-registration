const express = require('express');
const router = express.Router();
const { getRegistrations, sendStatusEmail, generateReport, sendSemesterEmail } = require('../controllers/tutorController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// All routes require authentication and tutor role
router.use(isAuthenticated);
router.use(hasRole(['tutor']));

// Tutor routes
router.get('/registrations', getRegistrations);
router.post('/registrations/:studentId/send-status', sendStatusEmail);
router.get('/reports/:type', generateReport);
router.post('/semester-email', sendSemesterEmail);

module.exports = router; 