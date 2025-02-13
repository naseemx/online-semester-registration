const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'staff', 'tutor', 'admin'],
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Reference to student profile if role is student
    studentProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: function() {
            return this.role === 'student';
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema); 