const express = require('express');
const router = express.Router();
const { getAllStudentFines, getStudentFines, updateFines } = require('../controllers/staffController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// All routes require authentication and staff role
router.use(isAuthenticated);
router.use(hasRole(['staff']));

// Staff routes
router.get('/fines', getAllStudentFines);
router.get('/fines/:studentId', getStudentFines);
router.put('/fines/:studentId', updateFines);

module.exports = router; 