import { useState } from 'react';
import { tutorAPI } from '../../utils/api';
import { FaFileDownload, FaSpinner, FaChartBar } from 'react-icons/fa';
import 'animate.css';

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeReport, setActiveReport] = useState(null);

    const reports = [
        {
            id: 'completed',
            title: 'Completed Registrations',
            description: 'List of students who have completed their semester registration',
            icon: <FaFileDownload className="text-success" size={24} />
        },
        {
            id: 'pending',
            title: 'Pending Registrations',
            description: 'List of students with pending or incomplete registrations',
            icon: <FaFileDownload className="text-warning" size={24} />
        },
        {
            id: 'fines',
            title: 'Pending Fines Report',
            description: 'List of students with pending fines and dues',
            icon: <FaFileDownload className="text-danger" size={24} />
        }
    ];

    const generateReport = async (type) => {
        try {
            setLoading(true);
            setError('');
            setActiveReport(type);
            
            const response = await tutorAPI.generateReport(type);
            const data = response.data.data;

            // Convert data to CSV
            let csv = '';
            if (data.length > 0) {
                // Headers
                const headers = Object.keys(data[0]).filter(key => 
                    !key.startsWith('_') && key !== '__v'
                );
                csv += headers.join(',') + '\n';

                // Data rows
                data.forEach(row => {
                    const values = headers.map(header => {
                        const value = row[header];
                        // Handle nested objects and arrays
                        if (typeof value === 'object' && value !== null) {
                            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                        }
                        return `"${value}"`;
                    });
                    csv += values.join(',') + '\n';
                });
            }

            // Create and download file
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Error generating report');
        } finally {
            setLoading(false);
            setActiveReport(null);
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow animate__animated animate__fadeIn">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">
                        <FaChartBar className="me-2" />
                        Generate Reports
                    </h4>
                </div>
                <div className="card-body">
                    {error && (
                        <div className="alert alert-danger animate__animated animate__shakeX">
                            {error}
                        </div>
                    )}

                    <div className="row g-4">
                        {reports.map((report) => (
                            <div key={report.id} className="col-md-4">
                                <div className="card h-100 animate__animated animate__fadeIn">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            {report.icon}
                                            <h5 className="mb-0 ms-2">{report.title}</h5>
                                        </div>
                                        <p className="text-muted">
                                            {report.description}
                                        </p>
                                        <button
                                            className="btn btn-primary w-100"
                                            onClick={() => generateReport(report.id)}
                                            disabled={loading && activeReport === report.id}
                                        >
                                            {loading && activeReport === report.id ? (
                                                <>
                                                    <FaSpinner className="me-2 animate__animated animate__rotateIn" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <FaFileDownload className="me-2" />
                                                    Download Report
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <h5>Report Information</h5>
                        <ul className="list-group">
                            <li className="list-group-item">
                                <strong>Completed Registrations Report:</strong> Contains details of students who have successfully completed their semester registration, including verification statuses and registration date.
                            </li>
                            <li className="list-group-item">
                                <strong>Pending Registrations Report:</strong> Lists students with incomplete registrations, including their current verification status and any pending requirements.
                            </li>
                            <li className="list-group-item">
                                <strong>Pending Fines Report:</strong> Provides information about students with outstanding fines or dues, including the amount and category of each fine.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports; 