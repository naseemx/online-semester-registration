const Student = require('../models/Student');
const Fine = require('../models/Fine');
const TutorAssignment = require('../models/TutorAssignment');
const SemesterRegistration = require('../models/SemesterRegistration');
const XLSX = require('xlsx');
const { sendRegistrationCompletionEmail, sendEmail } = require('../utils/emailService');

// Get all registrations
const getRegistrations = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const tutorId = req.user._id;
        console.log('Fetching registrations for tutor:', tutorId);
        
        // Get the tutor's assignments
        const tutorAssignment = await TutorAssignment.findOne({ tutor: tutorId });
        console.log('Found tutor assignments:', JSON.stringify(tutorAssignment, null, 2));

        if (!tutorAssignment || !tutorAssignment.assignments || tutorAssignment.assignments.length === 0) {
            console.log('No assignments found for tutor');
            return res.json({
                success: true,
                data: []
            });
        }

        // Create query for finding students based on tutor's assignments
        const query = {
            $or: tutorAssignment.assignments.map(({ department, semester }) => ({
                department,
                semester: Number(semester)
            }))
        };

        console.log('Student query:', JSON.stringify(query, null, 2));

        // Get students that match the tutor's department-semester assignments
        const students = await Student.find(query).sort({ name: 1 });
        console.log('Found students:', students.length);

        // Get active semester registrations for these students
        const activeRegistrations = await SemesterRegistration.find({
            status: 'active',
            'students.student': { $in: students.map(s => s._id) }
        });
        console.log('Found active registrations:', activeRegistrations.length);

        // Get fines and create detailed student objects
        const studentsWithDetails = await Promise.all(
            students.map(async (student) => {
                const fines = await Fine.findOne({ student: student._id });
                const registration = activeRegistrations.find(reg => 
                    reg.department === student.department && 
                    reg.semester === student.semester
                );

                const studentReg = registration?.students?.find(s => 
                    s.student.toString() === student._id.toString()
                );

                return {
                    _id: student._id,
                    name: student.name,
                    admissionNumber: student.admissionNumber,
                    department: student.department,
                    semester: student.semester,
                    email: student.email,
                    fines: fines || null,
                    registrationDetails: {
                        hasActiveRegistration: !!registration,
                        deadline: registration?.deadline,
                        status: studentReg?.status || 'not started',
                        submittedAt: studentReg?.submittedAt,
                        approvedAt: studentReg?.approvedAt
                    }
                };
            })
        );

        console.log('Sending response with students:', studentsWithDetails.length);
        console.log('Student details:', JSON.stringify(studentsWithDetails.map(s => ({
            name: s.name,
            department: s.department,
            semester: s.semester
        })), null, 2));

        res.json({
            success: true,
            data: studentsWithDetails
        });
    } catch (error) {
        console.error('Error in getRegistrations:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching registrations'
        });
    }
};

// Approve student registration
const approveRegistration = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Get student details with population
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        console.log('Student registration details:', {
            id: student._id,
            name: student.name,
            status: student.registrationDetails?.status,
            details: student.registrationDetails
        });

        // Find active semester registration first
        const registration = await SemesterRegistration.findOne({
            department: student.department,
            semester: student.semester,
            status: 'active',
            'students.student': studentId
        });

        if (!registration) {
            return res.status(400).json({
                success: false,
                message: 'No active semester registration found for this student'
            });
        }

        // Get student's registration status from semester registration
        const studentRegistration = registration.students.find(
            s => s.student.toString() === studentId
        );

        if (!studentRegistration) {
            return res.status(400).json({
                success: false,
                message: 'Student not found in semester registration'
            });
        }

        // Check if registration is in submitted state
        if (studentRegistration.status !== 'submitted') {
            return res.status(400).json({
                success: false,
                message: `Cannot approve registration. Current status: ${studentRegistration.status}`
            });
        }

        // Update student's registration details
        if (!student.registrationDetails) {
            student.registrationDetails = {};
        }
        student.registrationDetails.status = 'approved';
        student.registrationDetails.approvedAt = new Date();
        student.registrationApproved = true;
        await student.save();

        // Update semester registration status
        const studentIndex = registration.students.findIndex(
            s => s.student.toString() === studentId
        );
        registration.students[studentIndex].status = 'approved';
        registration.students[studentIndex].approvedAt = new Date();
        await registration.save();

        // Send approval email
        await sendEmail({
            email: student.email,
            subject: 'Semester Registration Approved',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Registration Approval Notification</h2>
                    <p>Dear ${student.name},</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p>Your semester registration has been approved by your tutor.</p>
                        
                        <h3 style="color: #2c3e50;">Registration Details:</h3>
                        <ul>
                            <li><strong>Department:</strong> ${student.department}</li>
                            <li><strong>Semester:</strong> ${student.semester}</li>
                            <li><strong>Approved Date:</strong> ${new Date().toLocaleDateString()}</li>
                        </ul>
                    </div>
                    
                    <p>You can now proceed with your course enrollment for the semester.</p>
                    <p>Please log in to your student portal to view your approved registration status and continue with the enrollment process.</p>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
                        <p style="margin: 0; color: #6c757d;">This is an automated message from the University Registration System.</p>
                    </div>
                </div>
            `
        });

        res.json({
            success: true,
            message: 'Registration approved successfully'
        });
    } catch (error) {
        console.error('Approve registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error approving registration'
        });
    }
};

// Send registration status email
const sendStatusEmail = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Get student details with fines
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const fines = await Fine.findOne({ student: studentId });
        
        // Check for pending fines
        const pendingFines = [];
        if (fines) {
            if (fines.tuition.status === 'pending' && fines.tuition.amount > 0) {
                pendingFines.push(`Tuition: ${formatCurrency(fines.tuition.amount)}`);
            }
            if (fines.transportation.status === 'pending' && fines.transportation.amount > 0) {
                pendingFines.push(`Transportation: ${formatCurrency(fines.transportation.amount)}`);
            }
            if (fines.hostelFees.status === 'pending' && fines.hostelFees.amount > 0) {
                pendingFines.push(`Hostel Fees: ${formatCurrency(fines.hostelFees.amount)}`);
            }
            if (fines.labFines.status === 'pending' && fines.labFines.amount > 0) {
                pendingFines.push(`Lab Fines: ${formatCurrency(fines.labFines.amount)}`);
            }
            if (fines.libraryFines.status === 'pending' && fines.libraryFines.amount > 0) {
                pendingFines.push(`Library Fines: ${formatCurrency(fines.libraryFines.amount)}`);
            }
        }

        // Create email content based on registration status
        let statusMessage = '';
        let actionNeeded = '';
        
        switch (student.registrationStatus) {
            case 'not started':
                statusMessage = 'You have not started your semester registration process yet.';
                actionNeeded = 'Please start your registration process as soon as possible by logging into your student portal.';
                break;
            case 'in progress':
                statusMessage = 'Your registration is currently in progress.';
                actionNeeded = 'Please complete all pending verifications to proceed with your registration.';
                break;
            case 'completed':
                statusMessage = 'You have completed your registration process.';
                actionNeeded = pendingFines.length > 0 ? 'However, you have some pending fines that need to be cleared.' : 'All your verifications and payments are clear.';
                break;
        }

        const emailContent = {
            to: student.email,
            subject: 'Semester Registration Status Update',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Registration Status Update</h2>
                    <p>Dear ${student.name},</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Current Status</h3>
                        <p><strong>Registration Status:</strong> ${student.registrationStatus}</p>
                        <p>${statusMessage}</p>
                        
                        <h3 style="color: #2c3e50;">Verification Status</h3>
                        <ul>
                            <li>Library: ${student.libraryStatus}</li>
                            <li>Lab: ${student.labStatus}</li>
                            <li>Office: ${student.officeStatus}</li>
                        </ul>
                        
                        ${pendingFines.length > 0 ? `
                            <h3 style="color: #dc3545;">Pending Fines</h3>
                            <ul>
                                ${pendingFines.map(fine => `<li>${fine}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                    
                    <p><strong>Action Needed:</strong> ${actionNeeded}</p>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
                        <p style="margin: 0; color: #6c757d;">This is an automated message from the University Registration System.</p>
                    </div>
                </div>
            `
        };

        await sendEmail(emailContent);

        res.json({
            success: true,
            message: 'Status email sent successfully'
        });
    } catch (error) {
        console.error('Send status email error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error sending status email'
        });
    }
};

// Helper function to format currency in INR
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Generate report
const generateReport = async (req, res) => {
    try {
        const { type } = req.params;
        let data;
        let filename;
        let worksheetName;

        switch (type) {
            case 'completed':
                data = await Student.find({
                    registrationStatus: 'completed'
                }).select('-__v').lean();
                
                // Format data for Excel
                data = data.map(student => ({
                    'Name': student.name,
                    'Admission Number': student.admissionNumber,
                    'Department': student.department,
                    'Semester': student.semester,
                    'Email': student.email,
                    'Registration Date': student.registrationCompletedAt ? new Date(student.registrationCompletedAt).toLocaleDateString() : '',
                    'Library Status': student.libraryStatus,
                    'Lab Status': student.labStatus,
                    'Office Status': student.officeStatus
                }));
                
                filename = 'completed_registrations.xlsx';
                worksheetName = 'Completed Registrations';
                break;

            case 'pending':
                data = await Student.find({
                    registrationStatus: { $in: ['not started', 'in progress'] }
                }).select('-__v').lean();
                
                // Format data for Excel
                data = data.map(student => ({
                    'Name': student.name,
                    'Admission Number': student.admissionNumber,
                    'Department': student.department,
                    'Semester': student.semester,
                    'Email': student.email,
                    'Registration Status': student.registrationStatus,
                    'Library Status': student.libraryStatus,
                    'Lab Status': student.labStatus,
                    'Office Status': student.officeStatus
                }));
                
                filename = 'pending_registrations.xlsx';
                worksheetName = 'Pending Registrations';
                break;

            case 'fines':
                data = await Fine.find({
                    $or: [
                        { 'tuition.status': 'pending' },
                        { 'transportation.status': 'pending' },
                        { 'hostelFees.status': 'pending' },
                        { 'labFines.status': 'pending' },
                        { 'libraryFines.status': 'pending' }
                    ]
                }).populate('student', '-__v').lean();
                
                // Format data for Excel
                data = data.map(fine => ({
                    'Name': fine.student.name,
                    'Admission Number': fine.student.admissionNumber,
                    'Department': fine.student.department,
                    'Semester': fine.student.semester,
                    'Tuition Fine': `${formatCurrency(fine.tuition.amount)} (${fine.tuition.status})`,
                    'Transportation Fine': `${formatCurrency(fine.transportation.amount)} (${fine.transportation.status})`,
                    'Hostel Fine': `${formatCurrency(fine.hostelFees.amount)} (${fine.hostelFees.status})`,
                    'Lab Fine': `${formatCurrency(fine.labFines.amount)} (${fine.labFines.status})`,
                    'Library Fine': `${formatCurrency(fine.libraryFines.amount)} (${fine.libraryFines.status})`
                }));
                
                filename = 'pending_fines.xlsx';
                worksheetName = 'Pending Fines';
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type'
                });
        }

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

        // Generate buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        
        // Send the file
        res.send(excelBuffer);

    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report'
        });
    }
};

// Send semester registration email
const sendSemesterEmail = async (req, res) => {
    try {
        const { semester, lastDate, message } = req.body;
        
        // Find all students in the specified semester
        const students = await Student.find({ semester }).select('email name');
        
        if (!students || students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No students found in the specified semester'
            });
        }

        // Send emails to all students
        const emailPromises = students.map(student => {
            const emailContent = {
                to: student.email,
                subject: 'Semester Registration Started',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Semester Registration Notification</h2>
                        <p>Dear ${student.name},</p>
                        <p>${message}</p>
                        <p><strong>Important Details:</strong></p>
                        <ul>
                            <li>Semester: ${semester}</li>
                            <li>Last Date for Registration: ${new Date(lastDate).toLocaleDateString()}</li>
                        </ul>
                        <p>Please complete your registration before the deadline to avoid any issues.</p>
                        <p>You can start your registration process by logging into your student portal.</p>
                        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                            <p style="margin: 0; color: #6c757d;">Note: This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                `
            };
            return sendEmail(emailContent);
        });

        await Promise.all(emailPromises);

        res.json({
            success: true,
            message: `Emails sent successfully to ${students.length} students`
        });
    } catch (error) {
        console.error('Send semester email error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error sending emails'
        });
    }
};

module.exports = {
    getRegistrations,
    sendStatusEmail,
    generateReport,
    sendSemesterEmail,
    approveRegistration
}; 