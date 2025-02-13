const Student = require('../models/Student');
const Fine = require('../models/Fine');
const { sendRegistrationCompletionEmail } = require('../utils/emailService');

// Get all registrations
const getRegistrations = async (req, res) => {
    try {
        const { status } = req.query;
        
        // Build query based on status filter
        let query = {};
        if (status && status !== 'all') {
            query.registrationStatus = status;
        }

        const students = await Student.find(query)
            .select('-__v')
            .sort({ name: 1 }); // Sort by name alphabetically

        // Get fines for each student
        const studentsWithFines = await Promise.all(
            students.map(async (student) => {
                const fines = await Fine.findOne({ student: student._id });
                return {
                    ...student.toObject(),
                    fines: fines || null
                };
            })
        );

        res.json({
            success: true,
            data: studentsWithFines
        });
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registrations'
        });
    }
};

// Approve registration
const approveRegistration = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if student is eligible
        if (!student.isEligibleForRegistration) {
            return res.status(400).json({
                success: false,
                message: 'Student is not eligible for registration'
            });
        }

        // Check if all fines are cleared
        const fines = await Fine.findOne({ student: studentId });
        if (fines && !fines.isAllCleared) {
            return res.status(400).json({
                success: false,
                message: 'Student has pending fines'
            });
        }

        // Update registration status
        student.registrationStatus = 'completed';
        student.registrationCompletedAt = new Date();
        await student.save();

        // Send email notification
        await sendRegistrationCompletionEmail(student);

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Approve registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving registration'
        });
    }
};

// Generate report
const generateReport = async (req, res) => {
    try {
        const { type } = req.params;
        let report;

        switch (type) {
            case 'completed':
                report = await Student.find({
                    registrationStatus: 'completed'
                }).select('-__v');
                break;
            case 'pending':
                report = await Student.find({
                    registrationStatus: { $in: ['not started', 'in progress'] }
                }).select('-__v');
                break;
            case 'fines':
                report = await Fine.find({
                    $or: [
                        { 'tuition.status': 'pending' },
                        { 'transportation.status': 'pending' },
                        { 'hostelFees.status': 'pending' },
                        { 'labFines.status': 'pending' },
                        { 'libraryFines.status': 'pending' }
                    ]
                }).populate('student', '-__v');
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type'
                });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report'
        });
    }
};

module.exports = {
    getRegistrations,
    approveRegistration,
    generateReport
}; 