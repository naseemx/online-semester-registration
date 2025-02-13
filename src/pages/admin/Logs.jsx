import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { FaSearch, FaDownload, FaTrash, FaSpinner } from 'react-icons/fa';
import 'animate.css';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        startDate: '',
        endDate: '',
        page: 1
    });
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 1
    });
    const [clearing, setClearing] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await adminAPI.getLogs(filters);
            setLogs(response.data.data.logs);
            setPagination(response.data.data.pagination);
        } catch (err) {
            setError('Error fetching logs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            setError('');
            const response = await adminAPI.exportLogs({
                type: filters.type,
                startDate: filters.startDate,
                endDate: filters.endDate
            });
            
            // Convert to CSV
            const csvContent = convertToCSV(response.data.data);

            // Download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Error exporting logs');
            console.error(err);
        } finally {
            setExporting(false);
        }
    };

    const handleClearLogs = async () => {
        if (!window.confirm('Are you sure you want to clear the logs? This action cannot be undone.')) {
            return;
        }

        try {
            setClearing(true);
            setError('');
            await adminAPI.clearLogs(filters.endDate || undefined);
            await fetchLogs();
        } catch (err) {
            setError('Error clearing logs');
            console.error(err);
        } finally {
            setClearing(false);
        }
    };

    const convertToCSV = (data) => {
        const headers = ['Timestamp', 'Type', 'User', 'Role', 'Action', 'Details', 'IP Address'];
        const rows = data.map(log => [
            log.timestamp,
            log.type,
            log.user,
            log.role,
            log.action,
            log.details,
            log.ipAddress
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: name === 'page' ? value : 1
        }));
    };

    return (
        <div className="container py-4">
            <div className="card shadow animate__animated animate__fadeIn">
                <div className="card-header bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">System Logs</h4>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-light" 
                                onClick={handleExport}
                                disabled={exporting}
                            >
                                {exporting ? <FaSpinner className="spin" /> : <FaDownload />}
                                {' '}Export
                            </button>
                            <button
                                className="btn btn-outline-light" 
                                onClick={handleClearLogs}
                                disabled={clearing}
                            >
                                {clearing ? <FaSpinner className="spin" /> : <FaTrash />}
                                {' '}Clear Logs
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    {/* Filters */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaSearch />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search logs..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                                <select
                                    className="form-select"
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                <option value="auth">Authentication</option>
                                <option value="student">Student</option>
                                <option value="staff">Staff</option>
                                <option value="tutor">Tutor</option>
                                <option value="admin">Admin</option>
                                <option value="system">System</option>
                                </select>
                        </div>
                        <div className="col-md-3">
                                <input
                                    type="date"
                                    className="form-control"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                placeholder="Start Date"
                                />
                        </div>
                        <div className="col-md-3">
                                <input
                                    type="date"
                                    className="form-control"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                placeholder="End Date"
                                />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-danger animate__animated animate__shakeX">
                            {error}
                        </div>
                    )}

                    {/* Logs Table */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Type</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Details</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            <FaSpinner className="spin" /> Loading...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            No logs found
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="animate__animated animate__fadeIn">
                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td>
                                                <span className={`badge bg-${getBadgeColor(log.type)}`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td>{log.user?.username || 'System'}</td>
                                            <td>{log.action}</td>
                                            <td>{log.details}</td>
                                            <td>{log.ipAddress}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <nav>
                                <ul className="pagination">
                                    <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handleFilterChange('page', filters.page - 1)}
                                            disabled={filters.page === 1}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    {[...Array(pagination.pages)].map((_, i) => (
                                        <li
                                            key={i + 1}
                                            className={`page-item ${filters.page === i + 1 ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => handleFilterChange('page', i + 1)}
                                            >
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${filters.page === pagination.pages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handleFilterChange('page', filters.page + 1)}
                                            disabled={filters.page === pagination.pages}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
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

const getBadgeColor = (type) => {
    switch (type) {
        case 'auth': return 'primary';
        case 'student': return 'success';
        case 'staff': return 'info';
        case 'tutor': return 'warning';
        case 'admin': return 'danger';
        case 'system': return 'secondary';
        default: return 'secondary';
    }
};

export default Logs; 