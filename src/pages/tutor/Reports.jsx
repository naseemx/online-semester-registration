import { useState } from 'react';
import { tutorAPI } from '../../utils/api';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import 'animate.css';

const Reports = () => {
    const [downloading, setDownloading] = useState(null);
    const [error, setError] = useState('');

    const handleDownload = async (type) => {
        try {
            setDownloading(type);
            setError('');

            const response = await tutorAPI.generateReport(type);
            
            // Create a blob from the response data
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_report.xlsx`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download error:', err);
            setError('Error downloading report');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow animate__animated animate__fadeIn">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Generate Reports</h4>
                </div>
                <div className="card-body">
                    {error && (
                        <div className="alert alert-danger animate__animated animate__shakeX">
                            {error}
                        </div>
                    )}

                    <div className="row g-4">
                        {/* Completed Registrations Report */}
                        <div className="col-md-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-success">
                                        <FaDownload className="me-2" />
                                        Completed Registrations
                                    </h5>
                                    <p className="card-text">
                                        List of students who have completed their semester registration
                                    </p>
                                    <button
                                        className="btn btn-success w-100"
                                        onClick={() => handleDownload('completed')}
                                        disabled={downloading === 'completed'}
                                    >
                                        {downloading === 'completed' ? (
                                            <>
                                                <FaSpinner className="me-2 spin" />
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <FaDownload className="me-2" />
                                                Download Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Pending Registrations Report */}
                        <div className="col-md-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-warning">
                                        <FaDownload className="me-2" />
                                        Pending Registrations
                                    </h5>
                                    <p className="card-text">
                                        List of students with pending or incomplete registrations
                                    </p>
                                    <button
                                        className="btn btn-warning w-100"
                                        onClick={() => handleDownload('pending')}
                                        disabled={downloading === 'pending'}
                                    >
                                        {downloading === 'pending' ? (
                                            <>
                                                <FaSpinner className="me-2 spin" />
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <FaDownload className="me-2" />
                                                Download Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Pending Fines Report */}
                        <div className="col-md-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-danger">
                                        <FaDownload className="me-2" />
                                        Pending Fines Report
                                    </h5>
                                    <p className="card-text">
                                        List of students with pending fines and dues
                                    </p>
                                    <button
                                        className="btn btn-danger w-100"
                                        onClick={() => handleDownload('fines')}
                                        disabled={downloading === 'fines'}
                                    >
                                        {downloading === 'fines' ? (
                                            <>
                                                <FaSpinner className="me-2 spin" />
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <FaDownload className="me-2" />
                                                Download Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Information */}
                    <div className="mt-4">
                        <h5>Report Information</h5>
                        <div className="list-group">
                            <div className="list-group-item">
                                <h6 className="mb-1">Completed Registrations Report:</h6>
                                <p className="mb-0 text-muted">
                                    Contains details of students who have successfully completed their semester registration, including verification statuses and registration date.
                                </p>
                            </div>
                            <div className="list-group-item">
                                <h6 className="mb-1">Pending Registrations Report:</h6>
                                <p className="mb-0 text-muted">
                                    Lists students with incomplete registrations, including their current verification status and any pending requirements.
                                </p>
                            </div>
                            <div className="list-group-item">
                                <h6 className="mb-1">Pending Fines Report:</h6>
                                <p className="mb-0 text-muted">
                                    Provides information about students with outstanding fines or dues, including the amount and category of each fine.
                                </p>
                            </div>
                        </div>
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

export default Reports; 