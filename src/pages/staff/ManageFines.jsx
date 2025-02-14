import { useState, useEffect } from 'react';
import { staffAPI } from '../../utils/api';
import { FaMoneyBill, FaSearch, FaSave, FaSpinner, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
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
    { id: 'tuition', label: 'Tuition Fee' },
    { id: 'transportation', label: 'Transportation Fee' },
    { id: 'hostelFees', label: 'Hostel Fee' },
    { id: 'labFines', label: 'Lab Fine' },
    { id: 'libraryFines', label: 'Library Fine' }
];

// Helper function to check if student has actual pending fines
const hasPendingFines = (student) => {
    return Object.values(student).some(fine => 
        typeof fine === 'object' && fine?.status === 'pending' && fine?.amount > 0
    );
};

const ManageFines = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);
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

    const filteredStudents = students.filter(student =>
        student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !students.length) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} />
                <p>Loading students...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.row}>
                {/* Student List */}
                <div className={styles.studentList}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h4 className={styles.headerTitle}>
                                <FaMoneyBill />
                                Students
                            </h4>
                        </div>
                        <div className={styles.cardBody}>
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
                            <div className={styles.studentsList}>
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student.student._id}
                                        className={`${styles.studentItem} ${selectedStudent?.student._id === student.student._id ? styles.active : ''}`}
                                        onClick={() => handleStudentSelect(student)}
                                    >
                                        <h5 className={styles.studentName}>
                                            {student.student.name}
                                            {hasPendingFines(student) && (
                                                <span className={styles.pendingBadge}>Has Pending Fines</span>
                                            )}
                                        </h5>
                                        <p className={styles.admissionNumber}>{student.student.admissionNumber}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fines Management */}
                <div className={styles.finesSection}>
                    {selectedStudent ? (
                        <>
                            {error && <div className={styles.errorMessage}>{error}</div>}
                            {updateSuccess && (
                                <div className={styles.successMessage}>Fines updated successfully!</div>
                            )}
                            
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h4 className={styles.headerTitle}>
                                        Manage Fines - {selectedStudent.student.name}
                                    </h4>
                                </div>
                                <div className={styles.cardBody}>
                                    {FINE_CATEGORIES.map(({ id, label }) => (
                                        <div key={id} className={styles.fineCard}>
                                            <div className={styles.fineInputGroup}>
                                                <div className={styles.fineLabel}>{label}</div>
                                                <input
                                                    type="number"
                                                    className={styles.amountInput}
                                                    value={fineData[id].amount}
                                                    onChange={(e) => handleFineChange(id, 'amount', Number(e.target.value))}
                                                    min="0"
                                                />
                                                <button
                                                    className={`${styles.statusToggle} ${fineData[id].status === 'paid' ? styles.paid : styles.pending}`}
                                                    onClick={() => toggleFineStatus(id)}
                                                    type="button"
                                                    title={fineData[id].status === 'paid' ? 'Mark as Pending' : 'Mark as Paid'}
                                                >
                                                    {fineData[id].status === 'paid' ? (
                                                        <FaCheckCircle size={24} />
                                                    ) : (
                                                        <FaRegCircle size={24} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        className={styles.updateButton}
                                        onClick={handleFineUpdate}
                                    >
                                        <FaSave /> Update Fines
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.card}>
                            <div className={styles.cardBody}>
                                <p className={styles.noSelection}>Select a student to manage fines</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageFines; 