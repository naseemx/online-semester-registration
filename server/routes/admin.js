const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Fine = require('../models/Fine');
const Settings = require('../models/Settings');
const Log = require('../models/Log');
const { 
    getNotifications, 
    sendNotification, 
    markAsRead, 
    deleteNotification 
} = require('../controllers/notificationController');
const {
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentStudents
} = require('../controllers/tutorAssignmentController');

// Helper function to format currency in INR
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// All routes require authentication and admin role
router.use(isAuthenticated);
router.use(hasRole(['admin']));

// Settings routes
router.get('/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching settings'
        });
    }
});

router.put('/settings', async (req, res) => {
    try {
        const {
            email,
            academic,
            system
        } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }

        // Update settings
        if (email) {
            settings.email = { ...settings.email, ...email };
        }
        if (academic) {
            settings.academic = { ...settings.academic, ...academic };
        }
        if (system) {
            settings.system = { ...settings.system, ...system };
        }

        await settings.save();

        res.json({
            success: true,
            data: settings,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating settings'
        });
    }
});

// Dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        // Get total counts
        const totalStudents = await Student.countDocuments();
        
        // Count users by role
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format user statistics
        const totalTutors = userStats.find(stat => stat._id === 'tutor')?.count || 0;
        const totalStaff = userStats.find(stat => stat._id === 'staff')?.count || 0;
        
        // Get registration statistics
        const registrationStats = await Student.aggregate([
            {
                $group: {
                    _id: '$registrationStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format registration statistics
        const completedRegistrations = registrationStats.find(stat => stat._id === 'completed')?.count || 0;
        const pendingRegistrations = registrationStats.reduce((total, stat) => {
            if (stat._id === 'in progress' || stat._id === 'not started') {
                return total + stat.count;
            }
            return total;
        }, 0);

        // Get fine statistics
        const fineStats = await Fine.aggregate([
            {
                $facet: {
                    totalPendingFines: [
                        {
                            $group: {
                                _id: null,
                                total: {
                                    $sum: {
                                        $add: [
                                            { $cond: [{ $eq: ['$tuition.status', 'pending'] }, '$tuition.amount', 0] },
                                            { $cond: [{ $eq: ['$transportation.status', 'pending'] }, '$transportation.amount', 0] },
                                            { $cond: [{ $eq: ['$hostelFees.status', 'pending'] }, '$hostelFees.amount', 0] },
                                            { $cond: [{ $eq: ['$labFines.status', 'pending'] }, '$labFines.amount', 0] },
                                            { $cond: [{ $eq: ['$libraryFines.status', 'pending'] }, '$libraryFines.amount', 0] }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const pendingFines = fineStats[0]?.totalPendingFines[0]?.total || 0;

        res.json({
            success: true,
            data: {
                totalStudents,
                totalTutors,
                totalStaff,
                completedRegistrations,
                pendingRegistrations,
                pendingFines: formatCurrency(pendingFines)
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
});

// User management routes
router.get('/users', async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : {};
        
        const users = await User.find(query).select('-password');
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;

        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if username is taken by another user
        if (username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }
        }

        // If changing from tutor/staff to student, check if they have any associated data
        if (user.role !== 'student' && role === 'student') {
            // Add any necessary checks here before allowing role change
            // For now, we'll allow the change
        }

        // Update user fields
        const updates = {
            username,
            email,
            role
        };

        // Only update password if provided
        if (password && password.trim() !== '') {
            updates.password = password;
        }

        // Use findByIdAndUpdate to ensure atomic update
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create log entry
        try {
            const log = new Log({
                type: 'admin',
                user: req.user._id, // Use req.user instead of session
                action: 'update_user',
                details: `Updated user ${username} (Role: ${user.role} -> ${role})`,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });
            await log.save();
        } catch (logError) {
            console.error('Error creating log:', logError);
            // Continue even if logging fails
        }

        res.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating user'
        });
    }
});

// Create user
router.post('/users', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if username is taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username is already taken'
            });
        }

        // Check if email is taken
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email is already taken'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role
        });

        await user.save();

        // Create log entry
        try {
            const log = new Log({
                type: 'admin',
                user: req.user._id,
                action: 'create_user',
                details: `Created new user ${username} with role ${role}`,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            });
            await log.save();
        } catch (logError) {
            console.error('Error creating log:', logError);
            // Continue even if logging fails
        }

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating user'
        });
    }
});

// Student management routes
router.get('/students', async (req, res) => {
    try {
        // Find students whose profiles are not associated with admin users
        const students = await Student.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'studentProfile',
                    as: 'user'
                }
            },
            {
                $match: {
                    'user.role': { $ne: 'admin' }
                }
            },
            {
                $project: {
                    user: 0 // Exclude the user data from the final result
                }
            }
        ]);

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students'
        });
    }
});

// Create new student
router.post('/students', async (req, res) => {
    try {
        const {
            name,
            admissionNumber,
            universityRegisterNumber,
            semester,
            department,
            email
        } = req.body;

        // Check if student with same admission number exists
        const existingStudent = await Student.findOne({ admissionNumber });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student with this admission number already exists'
            });
        }

        // Create new student
        const student = new Student({
            name,
            admissionNumber,
            universityRegisterNumber,
            semester,
            department,
            email,
            libraryStatus: 'clear',
            labStatus: 'clear',
            officeStatus: 'clear',
            registrationStatus: 'not started'
        });

        await student.save();

        // Create user account for the student
        const user = new User({
            username: admissionNumber, // Using admission number as username
            password: 'student123', // Default password
            role: 'student',
            email,
            studentProfile: student._id
        });

        await user.save();

        // Create initial fine record for the student
        const fine = new Fine({
            student: student._id,
            tuition: { amount: 0, status: 'paid' },
            transportation: { amount: 0, status: 'paid' },
            hostelFees: { amount: 0, status: 'paid' },
            labFines: { amount: 0, status: 'paid' },
            libraryFines: { amount: 0, status: 'paid' }
        });

        await fine.save();

        res.status(201).json({
            success: true,
            data: student,
            message: 'Student created successfully'
        });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating student'
        });
    }
});

// Update student
router.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            admissionNumber,
            universityRegisterNumber,
            semester,
            department,
            email
        } = req.body;

        // Check if student exists
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if new admission number is already taken by another student
        if (admissionNumber !== student.admissionNumber) {
            const existingStudent = await Student.findOne({ admissionNumber });
            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'Student with this admission number already exists'
                });
            }
        }

        // Update student
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            {
                name,
                admissionNumber,
                universityRegisterNumber,
                semester,
                department,
                email
            },
            { new: true }
        );

        // Update associated user account
        await User.findOneAndUpdate(
            { studentProfile: id },
            {
                username: admissionNumber,
                email
            }
        );

        res.json({
            success: true,
            data: updatedStudent,
            message: 'Student updated successfully'
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student'
        });
    }
});

// Delete student
router.delete('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if student exists
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Delete associated user account
        await User.findOneAndDelete({ studentProfile: id });

        // Delete student
        await Student.findByIdAndDelete(id);

        // Delete associated fines
        await Fine.findOneAndDelete({ student: id });

        res.json({
            success: true,
            message: 'Student and associated data deleted successfully'
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student'
        });
    }
});

// Notification routes
router.get('/notifications', getNotifications);
router.post('/notifications', sendNotification);
router.put('/notifications/:id/read', markAsRead);
router.delete('/notifications/:id', deleteNotification);

// Log routes
router.get('/logs', async (req, res) => {
    try {
        const { 
            search, 
            type, 
            startDate, 
            endDate, 
            page = 1, 
            limit = 50 
        } = req.query;

        // Build query
        const query = {};
        
        // Add type filter
        if (type && type !== 'all') {
            query.type = type;
        }

        // Add date range filter
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }

        // Add search filter
        if (search) {
            query.$or = [
                { action: { $regex: search, $options: 'i' } },
                { details: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get logs with pagination
        const logs = await Log.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username role');

        // Get total count for pagination
        const total = await Log.countDocuments(query);

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching system logs'
        });
    }
});

// Clear logs
router.delete('/logs', async (req, res) => {
    try {
        const { before } = req.query;
        let query = {};
        
        if (before) {
            query.timestamp = { $lt: new Date(before) };
        }

        await Log.deleteMany(query);

        // Log the clear action
        const log = new Log({
            type: 'admin',
            user: req.session.user.id,
            action: 'clear_logs',
            details: before ? `Cleared logs before ${before}` : 'Cleared all logs',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });
        await log.save();

        res.json({
            success: true,
            message: 'Logs cleared successfully'
        });
    } catch (error) {
        console.error('Clear logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing system logs'
        });
    }
});

// Export logs
router.get('/logs/export', async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        const query = {};

        if (type && type !== 'all') {
            query.type = type;
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }

        const logs = await Log.find(query)
            .sort({ timestamp: -1 })
            .populate('user', 'username role');

        // Format logs for CSV
        const csvData = logs.map(log => ({
            timestamp: log.timestamp.toISOString(),
            type: log.type,
            user: log.user.username,
            role: log.user.role,
            action: log.action,
            details: log.details,
            ipAddress: log.ipAddress
        }));

        res.json({
            success: true,
            data: csvData
        });
    } catch (error) {
        console.error('Export logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting system logs'
        });
    }
});

// Tutor Assignment routes
router.get('/tutor-assignments', getAllAssignments);
router.post('/tutor-assignments', createAssignment);
router.put('/tutor-assignments/:id', updateAssignment);
router.delete('/tutor-assignments/:id', deleteAssignment);
router.get('/tutor-assignments/:id/students', getAssignmentStudents);

module.exports = router; 