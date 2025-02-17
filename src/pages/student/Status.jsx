import React, { useState, useEffect } from 'react';
import { FaClipboardCheck, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { studentAPI } from '../../utils/api';
import styles from './Status.module.css';

const Status = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState({
        registrationStatus: '',
        verificationStatus: {
            library: 'pending',
            lab: 'pending',
            office: 'pending'
        },
        fines: {
            tuition: { amount: 0, status: 'paid' },
            transportation: { amount: 0, status: 'paid' },
            hostelFees: { amount: 0, status: 'paid' },
            labFines: { amount: 0, status: 'paid' },
            libraryFines: { amount: 0, status: 'paid' }
        }
    });

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await studentAPI.getStatus();
            if (response.data.success) {
                const data = response.data.data;
                setStatus({
                    ...data,
                    registrationStatus: data.registrationStatus || data.student?.registrationStatus || 'Not Started'
                });
            } else {
                throw new Error(response.data.message || 'Failed to fetch status');
            }
        } catch (err) {
            setError('Failed to fetch status. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        if (!status) return 'notstarted';
        const statusMap = {
            'completed': 'completed',
            'in progress': 'inprogress',
            'not started': 'notstarted',
            'rejected': 'rejected'
        };
        return statusMap[status.toLowerCase()] || 'notstarted';
    };

    const getStatusDisplay = (status) => {
        if (!status) return 'Not Started';
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} />
                <p>Loading status...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>
                    <FaClipboardCheck className={styles.headerIcon} />
                    Registration Status
                </h2>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <div className={styles.statusGrid}>
                {/* Registration Status Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Registration Status</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={`${styles.statusBadge} ${styles[getStatusClass(status.registrationStatus)]}`}>
                            {getStatusDisplay(status.registrationStatus)}
                        </div>
                    </div>
                </div>

                {/* Verification Status Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Verification Status</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.verificationList}>
                            <div className={styles.verificationItem}>
                                <span>Library</span>
                                <div className={styles.statusWithIcon}>
                                    {status.verificationStatus?.library === 'clear' ? (
                                        <>
                                            <FaCheckCircle className={styles.statusIconSuccess} />
                                            <span className={styles.statusText}>Cleared</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaTimesCircle className={styles.statusIconPending} />
                                            <span className={styles.statusText}>Pending</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={styles.verificationItem}>
                                <span>Lab</span>
                                <div className={styles.statusWithIcon}>
                                    {status.verificationStatus?.lab === 'clear' ? (
                                        <>
                                            <FaCheckCircle className={styles.statusIconSuccess} />
                                            <span className={styles.statusText}>Cleared</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaTimesCircle className={styles.statusIconPending} />
                                            <span className={styles.statusText}>Pending</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={styles.verificationItem}>
                                <span>Office</span>
                                <div className={styles.statusWithIcon}>
                                    {status.verificationStatus?.office === 'clear' ? (
                                        <>
                                            <FaCheckCircle className={styles.statusIconSuccess} />
                                            <span className={styles.statusText}>Cleared</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaTimesCircle className={styles.statusIconPending} />
                                            <span className={styles.statusText}>Pending</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fines Status Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Fines Status</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.finesList}>
                            {Object.entries(status.fines || {}).map(([type, fine]) => (
                                <div key={type} className={styles.fineItem}>
                                    <span className={styles.fineType}>
                                        {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </span>
                                    <div className={styles.fineDetails}>
                                        <span className={styles.fineAmount}>
                                            ₹{fine?.amount?.toFixed(2) || '0.00'}
                                        </span>
                                        <span className={`${styles.fineStatus} ${styles[fine?.status || 'paid']}`}>
                                            {fine?.status ? (fine.status.charAt(0).toUpperCase() + fine.status.slice(1)) : 'Paid'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Status; 