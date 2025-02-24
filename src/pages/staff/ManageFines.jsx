import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaMoneyBill, 
    FaSearch, 
    FaSave, 
    FaSpinner, 
    FaCheckCircle, 
    FaRegCircle,
    FaExclamationCircle,
    FaUser,
    FaFilter
} from 'react-icons/fa';
import { staffAPI } from '../../utils/api';
import styles from './ManageFines.module.css';

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const FINE_CATEGORIES = [
    { id: 'tuition', label: 'Tuition Fee', icon: FaMoneyBill },
    { id: 'transportation', label: 'Transportation Fee', icon: FaMoneyBill },
    { id: 'hostelFees', label: 'Hostel Fee', icon: FaMoneyBill },
    { id: 'labFines', label: 'Lab Fine', icon: FaMoneyBill },
    { id: 'libraryFines', label: 'Library Fine', icon: FaMoneyBill }
];

// Helper function to check if student has actual pending fines
const hasPendingFines = (student) => {
    return Object.values(student).some(fine => 
        typeof fine === 'object' && fine?.status === 'pending' && fine?.amount > 0
    );
};

const FineCard = ({ category, data, onAmountChange, onStatusToggle }) => {
    return (
        <motion.div 
            className={styles.fineCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.fineHeader}>
                <div className={styles.fineIcon}>
                    <category.icon />
                </div>
                <span className={styles.fineLabel}>{category.label}</span>
            </div>
            <div className={styles.fineInputGroup}>
                <div className={styles.amountWrapper}>
                    <input
                        type="number"
                        className={styles.amountInput}
                        value={data.amount}
                        onChange={(e) => onAmountChange(category.id, 'amount', Number(e.target.value))}
                        min="0"
                    />
                    <span className={styles.currencySymbol}>₹</span>
                </div>
                <button
                    className={`${styles.statusToggle} ${data.status === 'paid' ? styles.paid : styles.pending}`}
                    onClick={() => onStatusToggle(category.id)}
                    type="button"
                    title={data.status === 'paid' ? 'Mark as Pending' : 'Mark as Paid'}
                >
                    {data.status === 'paid' ? (
                        <FaCheckCircle size={20} />
                    ) : (
                        <FaRegCircle size={20} />
                    )}
                    <span>{data.status === 'paid' ? 'Paid' : 'Pending'}</span>
                </button>
            </div>
        </motion.div>
    );
};

const StudentCard = ({ student, isSelected, onClick }) => {
    const totalFines = Object.values(student)
        .filter(fine => typeof fine === 'object' && fine?.amount)
        .reduce((sum, fine) => sum + fine.amount, 0);

    const pendingAmount = Object.values(student)
        .filter(fine => typeof fine === 'object' && fine?.status === 'pending')
        .reduce((sum, fine) => sum + (fine?.amount || 0), 0);

    const getFineStatus = () => {
        if (pendingAmount === 0) return 'cleared';
        if (pendingAmount === totalFines) return 'unpaid';
        return 'partial';
    };

    const status = getFineStatus();

    return (
        <motion.div
            className={`${styles.studentItem} ${isSelected ? styles.active : ''} ${styles[status]}`}
            onClick={onClick}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <div className={styles.studentIcon}>
                <FaUser />
            </div>
            <div className={styles.studentInfo}>
                <h5 className={styles.studentName}>
                    {student.student.name}
                </h5>
                <p className={styles.admissionNumber}>
                    {student.student.admissionNumber}
                </p>
                <div className={styles.fineInfo}>
                    <div className={styles.amounts}>
                        <span className={styles.totalFine}>
                            Total: {formatCurrency(totalFines)}
                        </span>
                        {pendingAmount > 0 && (
                            <span className={styles.pendingAmount}>
                                Pending: {formatCurrency(pendingAmount)}
                            </span>
                        )}
                    </div>
                    <span className={`${styles.statusBadge} ${styles[status]}`}>
                        {status === 'cleared' ? 'Cleared' : status === 'partial' ? 'Partially Paid' : 'Unpaid'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

const ManageFines = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [showAllStudents, setShowAllStudents] = useState(false);
    const [fineData, setFineData] = useState({
        tuition: { amount: 0, status: 'pending' },
        transportation: { amount: 0, status: 'pending' },
        hostelFees: { amount: 0, status: 'pending' },
        labFines: { amount: 0, status: 'pending' },
        libraryFines: { amount: 0, status: 'pending' }
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await staffAPI.getAllStudentFines();
            setStudents(response.data.data);
        } catch (err) {
            setError('Error fetching student fines');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSelect = async (student) => {
        try {
            setSelectedStudent(student);
            const response = await staffAPI.getStudentFines(student.student._id);
            setFineData(response.data.data);
        } catch (err) {
            setError('Error fetching student details');
        }
    };

    const handleFineUpdate = async () => {
        try {
            setError('');
            setUpdateSuccess(false);
            
            await staffAPI.updateFines(selectedStudent.student._id, fineData);
            setUpdateSuccess(true);
            await fetchStudents();
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating fines');
        }
    };

    const handleFineChange = (category, field, value) => {
        setFineData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const toggleFineStatus = (category) => {
        handleFineChange(category, 'status', 
            fineData[category].status === 'pending' ? 'paid' : 'pending'
        );
    };

    const getFilteredStudents = () => {
        let filtered = students;
        
        // First apply search filter
        filtered = students.filter(student =>
            student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Then filter by pending status if not showing all
        if (!showAllStudents) {
            filtered = filtered.filter(student => hasPendingFines(student));
        }

        return filtered;
    };

    const filteredStudents = getFilteredStudents();

    if (loading && !students.length) {
        return (
            <div className={styles.loadingContainer}>
                <motion.div
                    animate={{
                        rotate: 360
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <FaSpinner size={40} />
                </motion.div>
                <p>Loading students...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.pageHeader}>
                <h1>Manage Student Fines</h1>
                <p>Update and track student fine payments</p>
            </header>

            <div className={styles.content}>
                {/* Student List */}
                <div className={styles.studentList}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>
                                <FaUser />
                                <span>Students with Fines</span>
                            </h2>
                            <div className={styles.filterControls}>
                                <div className={styles.searchContainer}>
                                    <FaSearch className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <label className={styles.toggleContainer}>
                                    <input
                                        type="checkbox"
                                        checked={showAllStudents}
                                        onChange={(e) => setShowAllStudents(e.target.checked)}
                                    />
                                    <span>Show All Students</span>
                                </label>
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            <AnimatePresence>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <StudentCard
                                            key={student.student._id}
                                            student={student}
                                            isSelected={selectedStudent?.student._id === student.student._id}
                                            onClick={() => handleStudentSelect(student)}
                                        />
                                    ))
                                ) : (
                                    <div className={styles.noResults}>
                                        <p>No students found {!showAllStudents && 'with pending fines'}</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Fines Management */}
                <div className={styles.finesSection}>
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                className={styles.errorMessage}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <FaExclamationCircle />
                                <span>{error}</span>
                            </motion.div>
                        )}
                        {updateSuccess && (
                            <motion.div 
                                className={styles.successMessage}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <FaCheckCircle />
                                <span>Fines updated successfully!</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>
                                <FaMoneyBill />
                                <span>
                                    {selectedStudent 
                                        ? `Manage Fines - ${selectedStudent.student.name}`
                                        : 'Manage Fines'
                                    }
                                </span>
                            </h2>
                        </div>
                        <div className={styles.cardBody}>
                            {selectedStudent ? (
                                <>
                                    <div className={styles.finesGrid}>
                                        {FINE_CATEGORIES.map((category) => (
                                            <FineCard
                                                key={category.id}
                                                category={category}
                                                data={fineData[category.id]}
                                                onAmountChange={handleFineChange}
                                                onStatusToggle={toggleFineStatus}
                                            />
                                        ))}
                                    </div>
                                    
                                    <motion.button 
                                        className={styles.updateButton}
                                        onClick={handleFineUpdate}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <FaSave />
                                        <span>Update Fines</span>
                                    </motion.button>
                                </>
                            ) : (
                                <div className={styles.noSelection}>
                                    <FaUser size={48} />
                                    <p>Select a student to manage their fines</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageFines; 