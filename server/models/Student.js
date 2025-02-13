const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    admissionNumber: {
        type: String,
        required: true,
        unique: true
    },
    universityRegisterNumber: {
        type: String,
        required: true,
        unique: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    department: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Verification statuses
    libraryStatus: {
        type: String,
        enum: ['pending', 'clear', 'fine pending'],
        default: 'pending'
    },
    labStatus: {
        type: String,
        enum: ['pending', 'clear', 'fine pending'],
        default: 'pending'
    },
    officeStatus: {
        type: String,
        enum: ['pending', 'clear', 'fine pending'],
        default: 'pending'
    },
    // Registration status
    registrationStatus: {
        type: String,
        enum: ['not started', 'in progress', 'completed'],
        default: 'not started'
    },
    registrationCompletedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Virtual for checking if all verifications are clear
studentSchema.virtual('isEligibleForRegistration').get(function() {
    return this.libraryStatus === 'clear' && 
           this.labStatus === 'clear' && 
           this.officeStatus === 'clear';
});

module.exports = mongoose.model('Student', studentSchema); 