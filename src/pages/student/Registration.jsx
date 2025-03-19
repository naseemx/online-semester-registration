import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentAPI } from '../../utils/api';
import { 
    FaGraduationCap, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaSpinner, 
    FaExclamationTriangle,
    FaInfoCircle,
    FaEnvelope
} from 'react-icons/fa';
import styles from './Registration.module.css';

const StatusCard = ({ title, status, icon: Icon, description }) => {
    const isCleared = status === 'clear';
    return (
        <motion.div 
            className={`${styles.statusCard} ${isCleared ? styles.cleared : styles.pending}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.statusIcon}>
                <Icon />
            </div>
            <div className={styles.statusContent}>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className={styles.statusBadge}>
                    {isCleared ? (
                        <FaCheckCircle className={styles.checkIcon} />
                    ) : (
                        <FaTimesCircle className={styles.pendingIcon} />
                    )}
                    <span>{isCleared ? 'Cleared' : 'Pending'}</span>
                </div>
            </div>
        </motion.div>
    );
};

const Registration = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applying, setApplying] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await studentAPI.getStatus();
            if (response.data.success) {
                const data = response.data.data;
                console.log('Student status data:', data);
                setStatus(data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch status');
            }
        } catch (err) {
            setError('Error fetching status');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const hasPendingFines = (fines) => {
        if (!fines) return false;
        const categories = ['tuition', 'transportation', 'hostelFees', 'labFines', 'libraryFines'];
        return categories.some(category => 
            fines[category]?.status === 'pending' && 
            fines[category]?.amount > 0
        );
    };

    const canApplyForRegistration = () => {
        if (!status) return false;
        
        // Check for active registration
        const hasActiveRegistration = status.activeRegistrations && 
            status.activeRegistrations.length > 0 &&
            status.activeRegistrations.some(reg => reg.status === 'active');

        // Check for pending fines
        const hasFines = hasPendingFines(status.fines);

        // Check current registration status
        const isNotStarted = status.student?.registrationStatus === 'not started';

        return hasActiveRegistration && !hasFines && isNotStarted;
    };

    const handleApplyRegistration = async () => {
        try {
            setApplying(true);
            setError('');
            setSuccess(false);

            if (!canApplyForRegistration()) {
                setError('Cannot apply for registration at this time.');
                return;
            }

            const response = await studentAPI.applyRegistration();
            if (response.data.success) {
                setSuccess(true);
                await fetchStatus(); // Refresh status after successful application
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error applying for registration');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} />
                <p>Loading registration status...</p>
            </div>
        );
    }

    const getRegistrationStatusColor = () => {
        const statusColors = {
            'not started': 'default',
            'submitted': 'warning',
            'approved': 'success',
            'rejected': 'error'
        };
        return statusColors[status?.student?.registrationStatus] || 'default';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <FaGraduationCap className={styles.headerIcon} />
                    <div>
                        <h1>Semester Registration</h1>
                        <p>Manage your semester registration process</p>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                    {error && (
                    <motion.div 
                        className={styles.error}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <FaExclamationTriangle />
                        <span>{error}</span>
                    </motion.div>
                )}

                {success && (
                    <motion.div 
                        className={styles.success}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <FaEnvelope />
                        <span>Registration submitted successfully! A confirmation email has been sent.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.content}>
                {/* Student Information */}
                <div className={styles.infoCard}>
                    <h2>Student Information</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Name</span>
                            <span className={styles.infoValue}>{status?.student?.name}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Admission Number</span>
                            <span className={styles.infoValue}>{status?.student?.admissionNumber}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Department</span>
                            <span className={styles.infoValue}>{status?.student?.department}</span>
                                </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Semester</span>
                            <span className={styles.infoValue}>{status?.student?.semester}</span>
                        </div>
                    </div>
                        </div>

                {/* Registration Status */}
                <div className={styles.statusSection}>
                    <h2>Registration Status</h2>
                    <div className={`${styles.currentStatus} ${styles[getRegistrationStatusColor()]}`}>
                        <FaInfoCircle />
                        <span>Current Status: {status?.student?.registrationStatus?.toUpperCase() || 'NOT STARTED'}</span>
                                    </div>

                    {/* Verification Status Cards */}
                    <div className={styles.statusGrid}>
                        <StatusCard
                            title="Library Status"
                            status={status?.verificationStatus?.library}
                            icon={FaCheckCircle}
                            description="Library clearance and book returns"
                        />
                        <StatusCard
                            title="Lab Status"
                            status={status?.verificationStatus?.lab}
                            icon={FaCheckCircle}
                            description="Laboratory equipment and dues clearance"
                        />
                        <StatusCard
                            title="Office Status"
                            status={status?.verificationStatus?.office}
                            icon={FaCheckCircle}
                            description="Administrative office clearance"
                        />
                        </div>
                    </div>

                {/* Fines Warning */}
                    {status?.fines && hasPendingFines(status.fines) && (
                    <motion.div 
                        className={styles.warning}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <FaExclamationTriangle />
                        <div>
                            <h3>Pending Fines</h3>
                            <p>Please clear all pending fines before applying for registration.</p>
                        </div>
                    </motion.div>
                )}

                {/* Action Button */}
                <div className={styles.actionSection}>
                    <motion.button
                        className={styles.applyButton}
                            onClick={handleApplyRegistration}
                        disabled={!canApplyForRegistration() || applying}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        >
                            {applying ? (
                                <>
                                <FaSpinner className={styles.spinner} />
                                <span>Applying...</span>
                                </>
                            ) : (
                            <>
                                <FaGraduationCap />
                                <span>Apply for Registration</span>
                            </>
                        )}
                    </motion.button>
                    {!canApplyForRegistration() && !status?.activeRegistrations?.length && (
                        <p className={styles.noRegistrationMessage}>
                            No active registration available for your department and semester.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Registration; 