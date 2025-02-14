const Student = require('../models/Student');
const Fine = require('../models/Fine');

// Helper function to format currency in INR
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Get all student fines
const getAllStudentFines = async (req, res) => {
    try {
        // Get all students
        const students = await Student.find();
        
        // Get all fines
        const fines = await Fine.find().populate('student', 'name admissionNumber semester department');
        
        // Create a map of student ID to fine record
        const fineMap = new Map(fines.map(fine => [fine.student._id.toString(), fine]));
        
        // Create or get fines for each student
        const allStudentFines = await Promise.all(students.map(async (student) => {
            let fine = fineMap.get(student._id.toString());
            
            // If student doesn't have a fine record, create one
            if (!fine) {
                fine = new Fine({
                    student: student._id,
                    tuition: { amount: 0, status: 'paid' },
                    transportation: { amount: 0, status: 'paid' },
                    hostelFees: { amount: 0, status: 'paid' },
                    labFines: { amount: 0, status: 'paid' },
                    libraryFines: { amount: 0, status: 'paid' }
                });
                await fine.save();
                
                // Populate the student field
                fine.student = {
                    _id: student._id,
                    name: student.name,
                    admissionNumber: student.admissionNumber,
                    semester: student.semester,
                    department: student.department
                };
            }
            
            return fine;
        }));

        res.json({
            success: true,
            data: allStudentFines
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