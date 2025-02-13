const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    email: {
        enabled: {
            type: Boolean,
            default: true
        },
        sender: {
            type: String,
            default: 'noreply@example.com'
        },
        template: {
            type: String,
            default: 'Dear {name}, your registration status has been updated to {status}.'
        }
    },
    academic: {
        currentSemester: {
            type: Number,
            default: 1,
            min: 1,
            max: 8
        },
        academicYear: {
            type: String,
            default: new Date().getFullYear().toString()
        },
        registrationDeadline: {
            type: Date,
            default: () => new Date(new Date().setMonth(new Date().getMonth() + 1))
        },
        lateRegistrationFee: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    system: {
        maintenanceMode: {
            type: Boolean,
            default: false
        },
        maxLoginAttempts: {
            type: Number,
            default: 3,
            min: 1
        },
        sessionTimeout: {
            type: Number,
            default: 30,
            min: 5
        },
        announcement: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
    const Settings = this.constructor;
    if (this.isNew) {
        const count = await Settings.countDocuments();
        if (count > 0) {
            throw new Error('Only one settings document can exist');
        }
    }
    next();
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings; 