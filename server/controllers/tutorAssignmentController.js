const TutorAssignment = require('../models/TutorAssignment');
const User = require('../models/User');
const Student = require('../models/Student');

// Get all tutor assignments
const getAllAssignments = async (req, res) => {
    try {
        const assignments = await TutorAssignment.find()
            .populate('tutor', 'username email');

        // Get student counts for each assignment
        const assignmentsWithCounts = await Promise.all(
            assignments.map(async (assignment) => {
                const studentCounts = await Promise.all(
                    assignment.assignments.map(async ({ department, semester }) => {
                        const count = await Student.countDocuments({ department, semester });
                        return { department, semester, count };
                    })
                );

                return {
                    ...assignment.toObject(),
                    studentCounts
                };
            })
        );

        res.json({
            success: true,
            data: assignmentsWithCounts
        });
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tutor assignments'
        });
    }
};

// Create tutor assignment
const createAssignment = async (req, res) => {
    try {
        const { tutorId, assignments } = req.body;

        // Validate tutor exists and is a tutor
        const tutor = await User.findOne({ _id: tutorId, role: 'tutor' });
        if (!tutor) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tutor ID or user is not a tutor'
            });
        }

        // Check for existing assignments with same department-semester combinations
        const existingAssignments = await TutorAssignment.findOne({
            'assignments': {
                $elemMatch: {
                    $or: assignments.map(({ department, semester }) => ({
                        department,
                        semester
                    }))
                }
            }
        });

        if (existingAssignments) {
            return res.status(400).json({
                success: false,
                message: 'Some department-semester combinations are already assigned to another tutor'
            });
        }

        // Create new assignment
        const assignment = new TutorAssignment({
            tutor: tutorId,
            assignments
        });

        await assignment.save();

        res.json({
            success: true,
            data: assignment
        });
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating tutor assignment'
        });
    }
};

// Update tutor assignment
const updateAssignment = async (req, res) => {
    try {
        const { assignments } = req.body;
        const assignmentId = req.params.id;

        // Check if assignment exists
        const existingAssignment = await TutorAssignment.findById(assignmentId);
        if (!existingAssignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Check for conflicts with other tutors' assignments
        const conflictingAssignment = await TutorAssignment.findOne({
            _id: { $ne: assignmentId },
            'assignments': {
                $elemMatch: {
                    $or: assignments.map(({ department, semester }) => ({
                        department,
                        semester
                    }))
                }
            }
        });

        if (conflictingAssignment) {
            return res.status(400).json({
                success: false,
                message: 'Some department-semester combinations are already assigned to another tutor'
            });
        }

        // Update assignment
        existingAssignment.assignments = assignments;
        await existingAssignment.save();

        res.json({
            success: true,
            data: existingAssignment
        });
    } catch (error) {
        console.error('Update assignment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating tutor assignment'
        });
    }
};

// Delete tutor assignment
const deleteAssignment = async (req, res) => {
    try {
        const result = await TutorAssignment.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        res.json({
            success: true,
            message: 'Assignment deleted successfully'
        });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting tutor assignment'
        });
    }
};

// Get students for a specific assignment
const getAssignmentStudents = async (req, res) => {
    try {
        const assignment = await TutorAssignment.findById(req.params.id)
            .populate('tutor', 'username email');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Get all students matching the department-semester combinations
        const students = await Student.find({
            $or: assignment.assignments.map(({ department, semester }) => ({
                department,
                semester
            }))
        });

        res.json({
            success: true,
            data: {
                assignment,
                students
            }
        });
    } catch (error) {
        console.error('Get assignment students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assignment students'
        });
    }
};

// Get assignments for current tutor
const getTutorAssignments = async (req, res) => {
    try {
        console.log('Request session:', req.session);
        console.log('Request user:', req.user);
        console.log('Fetching assignments for tutor. User info:', {
            id: req.user?._id,
            username: req.user?.username,
            role: req.user?.role
        });

        // Validate the tutor
        if (!req.user || !req.user._id) {
            console.log('No user found in request');
            return res.status(400).json({
                success: false,
                message: 'User not found in request'
            });
        }

        if (req.user.role !== 'tutor') {
            console.log('User is not a tutor. Role:', req.user.role);
            return res.status(400).json({
                success: false,
                message: 'User is not a tutor'
            });
        }

        // Get the tutor's assignments
        const assignment = await TutorAssignment.findOne({ tutor: req.user._id });
        console.log('Found assignment for current tutor:', JSON.stringify(assignment, null, 2));
        
        if (!assignment || !assignment.assignments || assignment.assignments.length === 0) {
            console.log('No assignments found for tutor');
            return res.json({
                success: true,
                data: {
                    assignments: []
                }
            });
        }

        // Sort assignments by department and semester
        const sortedAssignments = assignment.assignments.sort((a, b) => {
            if (a.department === b.department) {
                return a.semester - b.semester;
            }
            return a.department.localeCompare(b.department);
        });

        console.log('Returning sorted assignments:', sortedAssignments);
        res.json({
            success: true,
            data: {
                assignments: sortedAssignments
            }
        });
    } catch (error) {
        console.error('Get tutor assignments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tutor assignments: ' + error.message
        });
    }
};

// Create test assignment for a tutor
const createTestAssignment = async (req, res) => {
    try {
        const tutorId = req.user._id;
        console.log('Creating test assignment for tutor:', tutorId);

        // Validate the tutor
        const tutor = await User.findOne({ _id: tutorId, role: 'tutor' });
        if (!tutor) {
            console.log('Invalid tutor:', tutorId);
            return res.status(400).json({
                success: false,
                message: 'Invalid tutor or user is not a tutor'
            });
        }
        
        // Check if tutor already has assignments
        const existingAssignment = await TutorAssignment.findOne({ tutor: tutorId });
        if (existingAssignment) {
            console.log('Tutor already has assignments:', existingAssignment);
            // Instead of returning error, let's update the existing assignment
            existingAssignment.assignments = [
                { department: 'CSE', semester: 1 },
                { department: 'CSE', semester: 2 },
                { department: 'ECE', semester: 1 },
                { department: 'ECE', semester: 2 }
            ];
            await existingAssignment.save();
            console.log('Updated existing assignment:', existingAssignment);
            return res.json({
                success: true,
                data: existingAssignment,
                message: 'Updated existing assignments'
            });
        }

        // Create new test assignment
        const testAssignment = new TutorAssignment({
            tutor: tutorId,
            assignments: [
                { department: 'CSE', semester: 1 },
                { department: 'CSE', semester: 2 },
                { department: 'ECE', semester: 1 },
                { department: 'ECE', semester: 2 }
            ]
        });

        await testAssignment.save();
        console.log('Created new test assignment:', testAssignment);

        res.json({
            success: true,
            data: testAssignment,
            message: 'Created new test assignments'
        });
    } catch (error) {
        console.error('Create test assignment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating test assignment: ' + error.message
        });
    }
};

module.exports = {
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentStudents,
    getTutorAssignments,
    createTestAssignment
}; 