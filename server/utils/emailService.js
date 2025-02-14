const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not configured. Emails will not be sent.');
        return null;
    }

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // This should be an App Password
        },
        tls: {
            rejectUnauthorized: false // For development only
        }
    });
};

// General function to send any email
const sendEmail = async (emailContent) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            console.log(`Email would have been sent to ${emailContent.to} (Email service not configured)`);
            return true;
        }

        const mailOptions = {
            from: `"University Registration" <${process.env.EMAIL_USER}>`,
            to: emailContent.to,
            subject: emailContent.subject,
            html: emailContent.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Throw error to handle it in the controller
    }
};

// Function to send registration completion email
const sendRegistrationCompletionEmail = async (student) => {
    try {
        // If it's already an email content object, send it directly
        if (student.to && student.subject && student.html) {
            return await sendEmail(student);
        }

        // Otherwise, format it as a registration completion email
        const emailContent = {
            to: student.email,
            subject: 'Semester Registration Completed Successfully',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2196f3;">Congratulations ${student.name}!</h1>
                    <p>Your semester registration has been successfully completed and approved.</p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                        <h2 style="color: #333;">Registration Details:</h2>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin: 10px 0;"><strong>Admission Number:</strong> ${student.admissionNumber}</li>
                            <li style="margin: 10px 0;"><strong>Semester:</strong> ${student.semester}</li>
                            <li style="margin: 10px 0;"><strong>Department:</strong> ${student.department}</li>
                            <li style="margin: 10px 0;"><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</li>
                        </ul>
                    </div>
                    <p>All your verifications have been cleared and you are now officially registered for the semester.</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p>Best regards,<br><strong>University Administration</strong></p>
                    </div>
                </div>
            `
        };

        return await sendEmail(emailContent);
    } catch (error) {
        console.error('Error sending registration email:', error);
        throw error;
    }
};

module.exports = {
    sendRegistrationCompletionEmail,
    sendEmail
}; 