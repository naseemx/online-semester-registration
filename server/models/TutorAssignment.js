const mongoose = require('mongoose');

const tutorAssignmentSchema = new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignments: [{
        department: {
            type: String,
            required: true,
            enum: ['CSE', 'ECE', 'CE', 'ME', 'SFE', 'CSCS', 'CSBS', 'AI&DS']
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
tutorAssignmentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('TutorAssignment', tutorAssignmentSchema); 