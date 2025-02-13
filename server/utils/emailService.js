const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send registration completion email
const sendRegistrationCompletionEmail = async (student) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'Semester Registration Completed Successfully',
            html: `
                <h1>Congratulations ${student.name}!</h1>
                <p>Your semester registration has been successfully completed.</p>
                <h2>Registration Details:</h2>
                <ul>
                    <li>Admission Number: ${student.admissionNumber}</li>
                    <li>Semester: ${student.semester}</li>
                    <li>Department: ${student.department}</li>
                    <li>Completion Date: ${new Date().toLocaleDateString()}</li>
                </ul>
                <p>All your verifications have been cleared and you are now officially registered for the semester.</p>
                <p>Best regards,<br>University Administration</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Registration completion email sent to ${student.email}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendRegistrationCompletionEmail
}; 