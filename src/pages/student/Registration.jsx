import { useState, useEffect } from 'react';
import { studentAPI } from '../../utils/api';
import { FaGraduationCap, FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import 'animate.css';

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

                // Check if there are any active registrations
                const hasActiveRegistration = data.activeRegistrations && data.activeRegistrations.length > 0;

                if (!hasActiveRegistration) {
                    console.log('No active registrations found');
                    setError('No active registration available for your department and semester.');
                } else {
                    console.log('Found active registrations:', data.activeRegistrations);
                }

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

    const handleApplyRegistration = async () => {
        try {
            setApplying(true);
            setError('');
            setSuccess(false);

            // Check for pending fines before proceeding
            if (hasPendingFines(status.fines)) {
                setError('Cannot apply for registration. Please clear all pending fines first.');
                return;
            }

            // Check if there is an active registration
            const hasActiveRegistration = status.activeRegistrations && status.activeRegistrations.length > 0;

            if (!hasActiveRegistration) {
                setError('No active registration available for your department and semester.');
                return;
            }

            const response = await studentAPI.applyRegistration();
            if (response.data.success) {
                setSuccess(true);
                await fetchStatus();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error applying for registration');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="card shadow animate__animated animate__fadeIn">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">
                        <FaGraduationCap className="me-2" />
                        Semester Registration
                    </h4>
                </div>
                <div className="card-body">
                    {error && (
                        <div className="alert alert-danger animate__animated animate__shakeX">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success animate__animated animate__fadeIn">
                            Registration application submitted successfully!
                        </div>
                    )}

                    {/* Student Info */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">Student Information</h5>
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Name:</strong> {status?.student?.name}</p>
                                    <p><strong>Admission Number:</strong> {status?.student?.admissionNumber}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Department:</strong> {status?.student?.department}</p>
                                    <p><strong>Semester:</strong> {status?.student?.semester}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">Verification Status</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center">
                                    <FaCheckCircle className={`me-2 ${
                                        status?.verificationStatus?.library === 'clear' ? 'text-success' : 'text-danger'
                                    }`} />
                                    <div>
                                        <h6 className="mb-0">Library Status</h6>
                                        <small className="text-muted">{status?.verificationStatus?.library}</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <FaCheckCircle className={`me-2 ${
                                        status?.verificationStatus?.lab === 'clear' ? 'text-success' : 'text-danger'
                                    }`} />
                                    <div>
                                        <h6 className="mb-0">Lab Status</h6>
                                        <small className="text-muted">{status?.verificationStatus?.lab}</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <FaCheckCircle className={`me-2 ${
                                        status?.verificationStatus?.office === 'clear' ? 'text-success' : 'text-danger'
                                    }`} />
                                    <div>
                                        <h6 className="mb-0">Office Status</h6>
                                        <small className="text-muted">{status?.verificationStatus?.office}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fines Status */}
                    {status?.fines && hasPendingFines(status.fines) && (
                        <div className="alert alert-warning mb-4">
                            <FaExclamationTriangle className="me-2" />
                            <strong>Warning:</strong> You have pending fines that need to be cleared before applying for registration.
                            Please visit the finance office to clear your dues.
                        </div>
                    )}

                    {/* Registration Status and Action */}
                    <div className="text-center">
                        <div className="mb-3">
                            <span className={`badge bg-${
                                status?.student?.registrationStatus === 'completed' ? 'success' :
                                status?.student?.registrationStatus === 'in progress' ? 'warning' :
                                'secondary'
                            } fs-6`}>
                                Registration Status: {status?.student?.registrationStatus?.toUpperCase()}
                            </span>
                        </div>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleApplyRegistration}
                            disabled={
                                applying ||
                                status?.student?.registrationStatus === 'completed' ||
                                hasPendingFines(status?.fines)
                            }
                        >
                            {applying ? (
                                <>
                                    <FaSpinner className="me-2 spin" />
                                    Applying...
                                </>
                            ) : (
                                'Apply for Registration'
                            )}
                        </button>
                        {status?.student?.registrationStatus === 'completed' && (
                            <div className="mt-3 text-success">
                                <FaCheckCircle className="me-2" />
                                Your registration has been completed!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Registration; 