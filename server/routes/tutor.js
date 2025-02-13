const express = require('express');
const router = express.Router();
const { getRegistrations, approveRegistration, generateReport } = require('../controllers/tutorController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// All routes require authentication and tutor role
router.use(isAuthenticated);
router.use(hasRole(['tutor']));

// Tutor routes
router.get('/registrations', getRegistrations);
router.post('/registrations/:studentId/approve', approveRegistration);
router.get('/reports/:type', generateReport);

module.exports = router; 