const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { getRegistrations, sendStatusEmail, generateReport, approveRegistration } = require('../controllers/tutorController');
const { 
    getRegistrations: getSemesterRegistrations,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    getStatistics,
    sendReminders
} = require('../controllers/semesterRegistrationController');
const { getTutorAssignments, createTestAssignment } = require('../controllers/tutorAssignmentController');

// Student registration routes
router.get('/registrations', isAuthenticated, hasRole(['tutor']), getRegistrations);
router.post('/registrations/:studentId/send-status', isAuthenticated, hasRole(['tutor']), sendStatusEmail);
router.post('/registrations/:studentId/approve', isAuthenticated, hasRole(['tutor']), approveRegistration);

// Report routes
router.get('/reports/:type', isAuthenticated, hasRole(['tutor']), generateReport);

// Tutor assignments routes
router.get('/assignments/me', isAuthenticated, hasRole(['tutor']), getTutorAssignments);
router.post('/assignments/test', isAuthenticated, hasRole(['tutor']), createTestAssignment);

// Semester registration routes
router.get('/semester-registrations', isAuthenticated, hasRole(['tutor']), getSemesterRegistrations);
router.post('/semester-registrations', isAuthenticated, hasRole(['tutor']), createRegistration);
router.put('/semester-registrations/:id', isAuthenticated, hasRole(['tutor']), updateRegistration);
router.delete('/semester-registrations/:id', isAuthenticated, hasRole(['tutor']), deleteRegistration);
router.get('/semester-registrations/:id/statistics', isAuthenticated, hasRole(['tutor']), getStatistics);
router.post('/semester-registrations/:id/reminders', isAuthenticated, hasRole(['tutor']), sendReminders);

module.exports = router; 