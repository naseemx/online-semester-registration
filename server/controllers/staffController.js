const Student = require('../models/Student');
const Fine = require('../models/Fine');

// Get all student fines
const getAllStudentFines = async (req, res) => {
    try {
        const fines = await Fine.find()
            .populate('student', 'name admissionNumber semester department');

        res.json({
            success: true,
            data: fines
        });
    } catch (error) {
        console.error('Get all fines error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student fines'
        });
    }
};

// Get single student's fines
const getStudentFines = async (req, res) => {
    try {
        const { studentId } = req.params;
        const fines = await Fine.findOne({ student: studentId })
            .populate('student', 'name admissionNumber semester department');

        if (!fines) {
            return res.status(404).json({
                success: false,
                message: 'Fines record not found'
            });
        }

        res.json({
            success: true,
            data: fines
        });
    } catch (error) {
        console.error('Get student fines error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student fines'
        });
    }
};

// Helper function to check if a fine category has pending payment
const hasPendingPayment = (fine) => {
    return fine.status === 'pending' && fine.amount > 0;
};

// Update student fines
const updateFines = async (req, res) => {
    try {
        const { studentId } = req.params;
        const updates = req.body;

        // Validate student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Find or create fines record
        let fines = await Fine.findOne({ student: studentId });
        if (!fines) {
            fines = new Fine({ student: studentId });
        }

        // Validate and update each fine category
        const fineCategories = ['tuition', 'transportation', 'hostelFees', 'labFines', 'libraryFines'];
        const validStatuses = ['paid', 'pending'];
        
        for (const category of fineCategories) {
            if (updates[category]) {
                const update = updates[category];
                
                // Validate amount
                if (update.amount !== undefined) {
                    if (typeof update.amount !== 'number' || update.amount < 0) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid amount for ${category}`
                        });
                    }
                    fines[category].amount = update.amount;
                }

                // Validate status
                if (update.status !== undefined) {
                    if (!validStatuses.includes(update.status)) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid status for ${category}. Must be 'paid' or 'pending'`
                        });
                    }
                    // Only set status to pending if there's an actual fine amount
                    fines[category].status = update.amount > 0 ? update.status : 'paid';
                }
            }
        }

        await fines.save();

        // Update student verification statuses based on actual pending fines
        student.labStatus = hasPendingPayment(fines.labFines) ? 'fine pending' : 'clear';
        student.libraryStatus = hasPendingPayment(fines.libraryFines) ? 'fine pending' : 'clear';
        
        const hasOfficeFines = hasPendingPayment(fines.tuition) ||
                             hasPendingPayment(fines.transportation) ||
                             hasPendingPayment(fines.hostelFees);
        student.officeStatus = hasOfficeFines ? 'fine pending' : 'clear';

        await student.save();

        // Fetch updated fines with populated student data
        const updatedFines = await Fine.findOne({ student: studentId })
            .populate('student', 'name admissionNumber semester department');

        res.json({
            success: true,
            data: updatedFines,
            message: 'Fines updated successfully'
        });
    } catch (error) {
        console.error('Update fines error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating student fines'
        });
    }
};

module.exports = {
    getAllStudentFines,
    getStudentFines,
    updateFines
}; 