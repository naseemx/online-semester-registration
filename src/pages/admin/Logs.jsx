import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { FaSearch, FaDownload, FaTrash, FaSpinner, FaHistory } from 'react-icons/fa';
import styles from './Logs.module.css';
import 'animate.css';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [logType, setLogType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 1
    });
    const [clearing, setClearing] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [searchTerm, logType, startDate, endDate]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await adminAPI.getSystemLogs({
                search: searchTerm,
                type: logType,
                startDate: startDate,
                endDate: endDate
            });
            
            // Ensure we have an array of logs
            const logsData = response.data?.data?.logs || response.data?.data || [];
            const paginationData = response.data?.data?.pagination || { total: 0, pages: 1 };
            
            if (!Array.isArray(logsData)) {
                console.error('Logs data is not an array:', logsData);
                setLogs([]);
            } else {
                setLogs(logsData);
            }
            
            setPagination(paginationData);
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError('Error fetching logs');
            setLogs([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            setError('');
            const response = await adminAPI.exportLogs({
                type: logType,
                startDate: startDate,
                endDate: endDate
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
            await adminAPI.clearLogs(endDate || undefined);
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

    return (
        <div className={styles['logs-container']}>
            <div className={styles['logs-header']}>
                <div className={styles['logs-title']}>
                    <FaHistory />
                    <h1>System Logs</h1>
                </div>
                <div className={styles['header-actions']}>
                    <button
                        className={styles['export-btn']}
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        {exporting ? <FaSpinner className={styles['spin']} /> : <FaDownload />}
                        Export
                    </button>
                    <button
                        className={styles['clear-btn']}
                        onClick={handleClearLogs}
                        disabled={clearing}
                    >
                        {clearing ? <FaSpinner className={styles['spin']} /> : <FaTrash />}
                        Clear Logs
                    </button>
                </div>
            </div>

            <div className={styles['filters-section']}>
                <div className={styles['search-box']}>
                    <FaSearch className={styles['search-icon']} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className={styles['search-input']}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select 
                    className={styles['filter-select']}
                    value={logType}
                    onChange={(e) => setLogType(e.target.value)}
                >
                    <option value="all">All Types</option>
                    <option value="auth">Authentication</option>
                    <option value="system">System</option>
                    <option value="error">Error</option>
                </select>

                <input
                    type="date"
                    className={styles['date-picker']}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start Date"
                />

                <input
                    type="date"
                    className={styles['date-picker']}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End Date"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className={styles['error-message']}>
                    {error}
                </div>
            )}

            {/* Logs Table */}
            <div className={styles['logs-table']}>
                <table>
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
                                <td colSpan="6" className={styles['loading']}>
                                    <FaSpinner className={styles['spin']} /> Loading...
                                </td>
                            </tr>
                        ) : !Array.isArray(logs) || logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className={styles['no-logs']}>
                                    No logs found
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id || Math.random()} className={styles['log-row']}>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td>
                                        <span className={styles[`badge-${getBadgeColor(log.type)}`]}>
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
                <div className={styles['pagination']}>
                    <nav>
                        <ul>
                            <li className={`${styles['page-item']} ${pagination.page === 1 ? styles['disabled'] : ''}`}>
                                <button
                                    className={styles['page-link']}
                                    onClick={() => handleFilterChange('page', pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    Previous
                                </button>
                            </li>
                            {[...Array(pagination.pages)].map((_, i) => (
                                <li
                                    key={i + 1}
                                    className={`${styles['page-item']} ${pagination.page === i + 1 ? styles['active'] : ''}`}
                                >
                                    <button
                                        className={styles['page-link']}
                                        onClick={() => handleFilterChange('page', i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`${styles['page-item']} ${pagination.page === pagination.pages ? styles['disabled'] : ''}`}>
                                <button
                                    className={styles['page-link']}
                                    onClick={() => handleFilterChange('page', pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
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