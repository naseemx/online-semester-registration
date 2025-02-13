const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['auth', 'student', 'staff', 'tutor', 'admin', 'system'],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

// Index for faster queries
logSchema.index({ timestamp: -1, type: 1 });
logSchema.index({ user: 1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log; 