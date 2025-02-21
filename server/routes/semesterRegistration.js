const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const {
    getRegistrations,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    getStatistics,
    sendReminders
} = require('../controllers/semesterRegistrationController');

// All routes require authentication and tutor role
router.use(isAuthenticated);
router.use(hasRole(['tutor']));

// Get all registrations for the tutor
router.get('/', getRegistrations);

// Create new registration
router.post('/', createRegistration);

// Update registration
router.put('/:id', updateRegistration);

// Delete registration
router.delete('/:id', deleteRegistration);

// Get registration statistics
router.get('/:id/statistics', getStatistics);

// Send reminders to pending students
router.post('/:id/reminders', sendReminders);

module.exports = router; 