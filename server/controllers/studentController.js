const Student = require('../models/Student');
const Fine = require('../models/Fine');
const { sendRegistrationCompletionEmail } = require('../utils/emailService');

// Get student status
const getStatus = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.studentProfile) {
            return res.status(400).json({
                success: false,
                message: 'No student profile associated with this account'
            });
        }

        const student = await Student.findById(req.session.user.studentProfile);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const fines = await Fine.findOne({ student: student._id });

        res.json({
            success: true,
            data: {
                student: {
                    name: student.name,
                    admissionNumber: student.admissionNumber,
                    semester: student.semester,
                    department: student.department,
                    registrationStatus: student.registrationStatus
                },
                verificationStatus: {
                    library: student.libraryStatus,
                    lab: student.labStatus,
                    office: student.officeStatus
                },
                fines: fines ? {
                    tuition: fines.tuition,
                    transportation: fines.transportation,
                    hostelFees: fines.hostelFees,
                    labFines: fines.labFines,
                    libraryFines: fines.libraryFines
                } : null
            }
        });
    } catch (error) {
        console.error('Get student status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student status'
        });
    }
};

// Apply for semester registration
const applyRegistration = async (req, res) => {
    try {
        const student = await Student.findById(req.session.user.studentProfile);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if already registered
        if (student.registrationStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Registration already completed'
            });
        }

        // Update registration status to in progress
        student.registrationStatus = 'in progress';
        await student.save();

        // Check verification statuses
        const isEligible = student.libraryStatus === 'clear' &&
                          student.labStatus === 'clear' &&
                          student.officeStatus === 'clear';

        // Check fines
        const fines = await Fine.findOne({ student: student._id });
        const finesCleared = fines ? fines.isAllCleared : true;

        if (isEligible && finesCleared) {
            student.registrationStatus = 'completed';
            student.registrationCompletedAt = new Date();
            await student.save();

            // Send email notification
            await sendRegistrationCompletionEmail(student);
        }

        res.json({
            success: true,
            data: {
                registrationStatus: student.registrationStatus,
                isEligible,
                finesCleared,
                verificationStatus: {
                    library: student.libraryStatus,
                    lab: student.labStatus,
                    office: student.officeStatus
                }
            }
        });
    } catch (error) {
        console.error('Apply registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error applying for registration'
        });
    }
};

// Get verification status
const getVerificationStatus = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.studentProfile) {
            return res.status(400).json({
                success: false,
                message: 'No student profile associated with this account'
            });
        }

        const student = await Student.findById(req.session.user.studentProfile);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        res.json({
            success: true,
            data: {
                library: student.libraryStatus,
                lab: student.labStatus,
                office: student.officeStatus,
                registrationStatus: student.registrationStatus
            }
        });
    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching verification status'
        });
    }
};

module.exports = {
    getStatus,
    applyRegistration,
    getVerificationStatus
}; 