const SemesterRegistration = require('../models/SemesterRegistration');
const Student = require('../models/Student');
const TutorAssignment = require('../models/TutorAssignment');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/email');
const mongoose = require('mongoose');

// Get all registrations for a tutor
const getRegistrations = async (req, res) => {
    try {
        const registrations = await SemesterRegistration.find({ createdBy: req.user._id })
            .populate({
                path: 'students.student',
                select: 'name admissionNumber email department semester'
            })
            .sort('-createdAt');

        // Filter out null students and recalculate counts
        const processedRegistrations = registrations.map(reg => {
            // Filter out entries where student is null
            reg.students = reg.students.filter(s => s.student != null);
            return reg;
        });

        console.log('Found registrations:', processedRegistrations.map(reg => ({
            id: reg._id,
            department: reg.department,
            semester: reg.semester,
            studentCount: reg.students.length,
            students: reg.students.map(s => ({
                id: s.student?._id,
                name: s.student?.name,
                status: s.status
            }))
        })));

        res.json({
            success: true,
            data: processedRegistrations
        });
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registrations'
        });
    }
};

// Create new semester registration
const createRegistration = async (req, res) => {
    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { department, semester, deadline } = req.body;
        console.log('Creating new registration:', { department, semester, deadline });

        // Validate required fields
        if (!department || !semester || !deadline) {
            console.log('Missing required fields:', { department, semester, deadline });
            return res.status(400).json({
                success: false,
                message: 'Department, semester, and deadline are required'
            });
        }

        // Check for existing active registration with transaction
        const existingRegistration = await SemesterRegistration.findOne({
            department: { $regex: new RegExp(`^${department}$`, 'i') },
            semester: parseInt(semester),
            status: 'active',
            createdBy: req.user._id
        }).session(session);

        if (existingRegistration) {
            await session.abortTransaction();
            session.endSession();
            console.log('Active registration already exists:', {
                id: existingRegistration._id,
                department: existingRegistration.department,
                semester: existingRegistration.semester
            });
            return res.status(400).json({
                success: false,
                message: 'An active registration already exists for this department and semester'
            });
        }

        // Check tutor assignment with transaction
        const tutorAssignment = await TutorAssignment.findOne({
            tutor: req.user._id,
            assignments: { 
                $elemMatch: { 
                    department, 
                    semester: parseInt(semester)
                } 
            }
        }).session(session);

        if (!tutorAssignment) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this department and semester'
            });
        }

        // Find students with transaction
        const students = await Student.find({ 
            department, 
            semester: parseInt(semester)
        }).session(session);

        if (students.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'No students found in this department and semester'
            });
        }

        // Create registration with transaction
        const registration = new SemesterRegistration({
            department,
            semester: parseInt(semester),
            deadline: new Date(deadline),
            createdBy: req.user._id,
            status: 'active',
            students: students.map(student => ({
                student: student._id,
                status: 'pending'
            }))
        });

        await registration.save({ session });

        // Create notifications with transaction
        const notifications = students.map(student => ({
            recipient: student._id,
            title: `New Registration Created`,
            message: `A new semester registration has been created for ${department} - Semester ${semester}. Deadline: ${new Date(deadline).toLocaleDateString()}`,
            type: 'info',
            user: req.user._id
        }));

        await Notification.insertMany(notifications, { session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Send emails after successful transaction (don't include in transaction)
        for (const student of students) {
            try {
                await sendEmail({
                    email: student.email,
                    subject: 'New Semester Registration Available',
                    message: `
Dear ${student.name},

A new semester registration has been created for:

Department: ${department}
Semester: ${semester}
Deadline: ${new Date(deadline).toLocaleDateString()}

Please log in to the SR System to complete your registration.

Best regards,
Academic Affairs Office
                    `
                });
            } catch (emailError) {
                console.error('Error sending email to student:', emailError);
                // Continue even if email fails
            }
        }

        res.status(201).json({
            success: true,
            data: registration,
            message: 'Semester registration created successfully'
        });

    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();
        
        console.error('Create registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating semester registration'
        });
    }
};

// Update registration
const updateRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { deadline, status } = req.body;

        const registration = await SemesterRegistration.findOne({
            _id: id,
            createdBy: req.user._id
        });

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        registration.deadline = deadline || registration.deadline;
        registration.status = status || registration.status;

        await registration.save();

        if (status === 'inactive') {
            // Notify students if registration is deactivated
            const notification = new Notification({
                title: 'Semester Registration Update',
                message: `The semester registration for ${registration.department} - Semester ${registration.semester} has been deactivated.`,
                type: 'warning',
                recipients: 'students',
                createdBy: req.user._id
            });

            await notification.save();
        }

        res.json({
            success: true,
            data: registration,
            message: 'Registration updated successfully'
        });
    } catch (error) {
        console.error('Update registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating registration'
        });
    }
};

// Get registration statistics
const getStatistics = async (req, res) => {
    try {
        const registrationId = req.params.id;
        console.log('\n=== Starting getStatistics ===');
        console.log('Registration ID:', registrationId);
        
        // Get registration with populated students
        const populatedRegistration = await SemesterRegistration.findById(registrationId)
            .populate({
                path: 'students.student',
                select: 'name admissionNumber email department semester'
            });

        if (!populatedRegistration) {
            console.log('Registration not found');
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        console.log('Found registration:', {
            department: populatedRegistration.department,
            semester: populatedRegistration.semester,
            totalStudents: populatedRegistration.students.length
        });

        // Filter out null students
        const validStudents = populatedRegistration.students.filter(s => s.student != null);

        console.log('Valid students after filtering:', {
            totalValid: validStudents.length,
            students: validStudents.map(s => ({
                studentId: s.student._id,
                name: s.student.name,
                status: s.status
            }))
        });

        // Count statistics
        const totalStudents = validStudents.length;
        const pendingCount = validStudents.filter(s => s.status === 'pending').length;
        const submittedCount = validStudents.filter(s => s.status === 'submitted').length;
        const approvedCount = validStudents.filter(s => s.status === 'approved').length;

        const statistics = {
            totalStudents,
            pending: pendingCount,
            submitted: submittedCount,
            approved: approvedCount
        };

        console.log('Final calculated statistics:', statistics);
        console.log('=== End getStatistics ===\n');

        res.json({
            success: true,
            data: statistics
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
};

// Send reminder emails
const sendReminders = async (req, res) => {
    try {
        const { id } = req.params;

        const registration = await SemesterRegistration.findOne({
            _id: id,
            createdBy: req.user._id
        }).populate('students.student', 'name email');

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        const pendingStudents = registration.students.filter(s => s.status === 'pending');

        // Send reminder notifications and emails
        for (const { student } of pendingStudents) {
            // Create individual notification for each student
            const notification = new Notification({
                recipient: student._id,
                message: `Reminder: Please complete your semester registration for ${registration.department} - Semester ${registration.semester}. Deadline: ${new Date(registration.deadline).toLocaleDateString()}`,
                type: 'warning'
            });

            await notification.save();

            try {
                await sendEmail({
                    email: student.email,
                    subject: 'URGENT: Semester Registration Reminder',
                    message: `
Dear ${student.name},

This is an important reminder regarding your pending semester registration for:

Department: ${registration.department}
Semester: ${registration.semester}
Deadline: ${new Date(registration.deadline).toLocaleDateString()}

Your registration status is still showing as PENDING. To avoid any academic complications, please complete your registration as soon as possible.

Required Actions:
1. Log in to the SR System immediately
2. Complete any pending verifications
3. Clear any outstanding fines
4. Submit your registration

If you are experiencing any difficulties with the registration process, please don't hesitate to reach out to your department coordinator or the academic office for assistance.

Please note that failure to complete the registration by the deadline may result in:
- Late registration fees
- Delayed course enrollment
- Other academic consequences

Take immediate action to ensure your registration is completed on time.

Best regards,
Academic Affairs Office
SR System
                    `
                });
            } catch (emailError) {
                console.error('Error sending email to student:', emailError);
                // Continue with the process even if email fails
            }
        }

        res.status(200).json({
            success: true,
            message: 'Reminders sent successfully'
        });
    } catch (error) {
        console.error('Send reminders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending reminders'
        });
    }
};

// Delete registration
const deleteRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid registration ID:', id);
            return res.status(400).json({
                success: false,
                message: 'Invalid registration ID'
            });
        }

        // Find registration with populated student data
        const registration = await SemesterRegistration.findOne({
            _id: id,
            createdBy: req.user._id
        }).populate('students.student', '_id name email');

        if (!registration) {
            console.log('Registration not found for deletion:', id);
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        // Check if any students have already submitted or been approved
        const hasSubmittedStudents = registration.students.some(
            student => ['submitted', 'approved'].includes(student.status)
        );

        if (hasSubmittedStudents) {
            console.log('Cannot delete registration with submitted or approved students:', {
                id: registration._id,
                department: registration.department,
                semester: registration.semester
            });
            return res.status(400).json({
                success: false,
                message: 'Cannot delete registration with submitted or approved students'
            });
        }

        // Create notifications for students
        const notifications = registration.students
            .filter(({ student }) => student && student._id)
            .map(({ student }) => ({
                recipient: student._id,
                message: `The semester registration for ${registration.department} - Semester ${registration.semester} has been deleted.`,
                type: 'warning'
            }));

        if (notifications.length > 0) {
            try {
                await Notification.insertMany(notifications);
            } catch (notificationError) {
                console.error('Error creating notifications:', notificationError);
                // Continue with deletion even if notifications fail
            }
        }

        // Delete the registration
        await SemesterRegistration.deleteOne({ _id: id });
        console.log('Registration deleted successfully:', id);

        res.json({
            success: true,
            message: 'Registration deleted successfully'
        });
    } catch (error) {
        console.error('Delete registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting registration'
        });
    }
};

module.exports = {
    getRegistrations,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    getStatistics,
    sendReminders
};