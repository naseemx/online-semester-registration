const mongoose = require('mongoose');

const semesterRegistrationSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    students: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'submitted', 'approved'],
            default: 'pending'
        },
        submittedAt: Date,
        approvedAt: Date
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
semesterRegistrationSchema.index({ department: 1, semester: 1, status: 1 });
semesterRegistrationSchema.index({ createdBy: 1 });
semesterRegistrationSchema.index({ 'students.student': 1 });

module.exports = mongoose.model('SemesterRegistration', semesterRegistrationSchema); 