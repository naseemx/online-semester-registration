const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentStudents
} = require('../controllers/tutorAssignmentController');

// Admin routes
router.route('/')
    .get(protect, authorize('admin'), getAllAssignments)
    .post(protect, authorize('admin'), createAssignment);

router.route('/:id')
    .put(protect, authorize('admin'), updateAssignment)
    .delete(protect, authorize('admin'), deleteAssignment);

router.route('/:id/students')
    .get(protect, authorize('admin', 'tutor'), getAssignmentStudents);

module.exports = router; 