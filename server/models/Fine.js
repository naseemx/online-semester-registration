const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    tuition: {
        amount: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ['paid', 'pending'],
            default: 'pending'
        }
    },
    transportation: {
        amount: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ['paid', 'pending'],
            default: 'pending'
        }
    },
    hostelFees: {
        amount: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ['paid', 'pending'],
            default: 'pending'
        }
    },
    labFines: {
        amount: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ['paid', 'pending'],
            default: 'pending'
        }
    },
    libraryFines: {
        amount: {
            type: Number,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ['paid', 'pending'],
            default: 'pending'
        }
    }
}, {
    timestamps: true
});

// Virtual to get total pending amount
fineSchema.virtual('totalPendingAmount').get(function() {
    let total = 0;
    if (this.tuition.status === 'pending') total += this.tuition.amount;
    if (this.transportation.status === 'pending') total += this.transportation.amount;
    if (this.hostelFees.status === 'pending') total += this.hostelFees.amount;
    if (this.labFines.status === 'pending') total += this.labFines.amount;
    if (this.libraryFines.status === 'pending') total += this.libraryFines.amount;
    return total;
});

// Virtual to check if all fines are cleared
fineSchema.virtual('isAllCleared').get(function() {
    return this.tuition.status === 'paid' &&
           this.transportation.status === 'paid' &&
           this.hostelFees.status === 'paid' &&
           this.labFines.status === 'paid' &&
           this.libraryFines.status === 'paid';
});

module.exports = mongoose.model('Fine', fineSchema); 