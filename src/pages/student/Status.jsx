import { useEffect } from 'react';
import usePolling from '../../hooks/usePolling';
import { FaGraduationCap, FaMoneyBill, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import 'animate.css';

const Status = () => {
    const { data: statusData, error: statusError } = usePolling(
        'http://localhost:5000/api/student/status'
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (statusError) {
        return (
            <div className="alert alert-danger m-3">
                Error loading student status
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-lg-8 mx-auto">
                    <div className="card shadow animate__animated animate__fadeIn">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                <FaGraduationCap className="me-2" />
                                Registration Status
                            </h4>
                        </div>
                        <div className="card-body">
                            {/* Student Information */}
                            <div className="mb-4">
                                <h5 className="card-title">Student Information</h5>
                                <div className="list-group">
                                    <div className="list-group-item">
                                        <strong>Name:</strong> {statusData?.data?.student?.name}
                                    </div>
                                    <div className="list-group-item">
                                        <strong>Admission Number:</strong> {statusData?.data?.student?.admissionNumber}
                                    </div>
                                    <div className="list-group-item">
                                        <strong>Semester:</strong> {statusData?.data?.student?.semester}
                                    </div>
                                    <div className="list-group-item">
                                        <strong>Department:</strong> {statusData?.data?.student?.department}
                                    </div>
                                    <div className="list-group-item">
                                        <strong>Registration Status:</strong>{' '}
                                        <span className={`badge ${
                                            statusData?.data?.student?.registrationStatus === 'completed'
                                                ? 'bg-success'
                                                : statusData?.data?.student?.registrationStatus === 'in progress'
                                                ? 'bg-warning'
                                                : 'bg-secondary'
                                        }`}>
                                            {statusData?.data?.student?.registrationStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Status */}
                            <div className="mb-4">
                                <h5 className="card-title">Verification Status</h5>
                                <div className="list-group">
                                    <div className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Library Status</strong>
                                            <p className="mb-0 text-muted">
                                                {statusData?.data?.verificationStatus?.library}
                                            </p>
                                        </div>
                                        {statusData?.data?.verificationStatus?.library === 'clear' ? (
                                            <FaCheckCircle className="text-success" />
                                        ) : (
                                            <FaTimesCircle className="text-danger" />
                                        )}
                                    </div>
                                    <div className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Lab Status</strong>
                                            <p className="mb-0 text-muted">
                                                {statusData?.data?.verificationStatus?.lab}
                                            </p>
                                        </div>
                                        {statusData?.data?.verificationStatus?.lab === 'clear' ? (
                                            <FaCheckCircle className="text-success" />
                                        ) : (
                                            <FaTimesCircle className="text-danger" />
                                        )}
                                    </div>
                                    <div className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Office Status</strong>
                                            <p className="mb-0 text-muted">
                                                {statusData?.data?.verificationStatus?.office}
                                            </p>
                                        </div>
                                        {statusData?.data?.verificationStatus?.office === 'clear' ? (
                                            <FaCheckCircle className="text-success" />
                                        ) : (
                                            <FaTimesCircle className="text-danger" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Fines */}
                            {statusData?.data?.fines && (
                                <div>
                                    <h5 className="card-title">
                                        <FaMoneyBill className="me-2" />
                                        Pending Fines
                                    </h5>
                                    <div className="list-group">
                                        {Object.entries(statusData.data.fines).map(([key, value]) => (
                                            <div key={key} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>{key.replace(/([A-Z])/g, ' $1').trim()}</strong>
                                                    <p className="mb-0 text-muted">
                                                        Status: {value.status}
                                                    </p>
                                                </div>
                                                <span className={`badge ${value.status === 'paid' ? 'bg-success' : 'bg-danger'}`}>
                                                    {formatCurrency(value.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Status; 