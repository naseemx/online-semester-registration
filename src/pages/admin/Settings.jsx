import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../utils/api';
import { 
    FaCog, FaEnvelope, FaUniversity, FaCalendar, FaSave, 
    FaSpinner, FaDownload, FaUpload, FaDatabase, FaExclamationTriangle 
} from 'react-icons/fa';
import useForm from '../../hooks/useForm';
import 'animate.css';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [backupLoading, setBackupLoading] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false);
    const fileInputRef = useRef(null);

    const { values, handleChange, handleSubmit, setFieldValue } = useForm({
        // Email Settings
        emailNotifications: true,
        emailSender: '',
        emailTemplate: '',

        // Academic Settings
        currentSemester: '1',
        academicYear: new Date().getFullYear().toString(),
        registrationDeadline: '',
        lateRegistrationFee: '0',

        // System Settings
        maintenanceMode: false,
        systemAnnouncement: '',
        maxLoginAttempts: '3',
        sessionTimeout: '30'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getSettings();
            Object.keys(response.data.data).forEach(key => {
                setFieldValue(key, response.data.data[key]);
            });
        } catch (err) {
            setError('Error fetching settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (formData) => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            await adminAPI.updateSettings(formData);
            setSuccess('Settings updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error updating settings');
        } finally {
            setSaving(false);
        }
    };

    const handleBackup = async () => {
        try {
            setBackupLoading(true);
            setError('');
            const response = await adminAPI.backupSystem();
            
            // Create and download backup file
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setSuccess('System backup created successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error creating system backup');
        } finally {
            setBackupLoading(false);
        }
    };

    const handleRestore = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setRestoreLoading(true);
            setError('');

            // Read the backup file
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    await adminAPI.restoreSystem(backupData);
                    setSuccess('System restored successfully');
                    setTimeout(() => setSuccess(''), 3000);
                    // Refresh settings after restore
                    fetchSettings();
                } catch (err) {
                    setError('Error restoring system: Invalid backup file');
                } finally {
                    setRestoreLoading(false);
                    // Clear file input
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }
            };
            reader.readAsText(file);
        } catch (err) {
            setError('Error reading backup file');
            setRestoreLoading(false);
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
                        <FaCog className="me-2" />
                        System Settings
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
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(handleSaveSettings)}>
                        {/* Email Settings */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <FaEnvelope className="me-2" />
                                    Email Settings
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="emailNotifications"
                                                name="emailNotifications"
                                                checked={values.emailNotifications}
                                                onChange={(e) => setFieldValue('emailNotifications', e.target.checked)}
                                            />
                                            <label className="form-check-label" htmlFor="emailNotifications">
                                                Enable Email Notifications
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email Sender</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="emailSender"
                                            value={values.emailSender}
                                            onChange={handleChange}
                                            placeholder="noreply@example.com"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Email Template</label>
                                        <textarea
                                            className="form-control"
                                            name="emailTemplate"
                                            value={values.emailTemplate}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Default email template with placeholders: {name}, {status}, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic Settings */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <FaUniversity className="me-2" />
                                    Academic Settings
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Current Semester</label>
                                        <select
                                            className="form-select"
                                            name="currentSemester"
                                            value={values.currentSemester}
                                            onChange={handleChange}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Academic Year</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="academicYear"
                                            value={values.academicYear}
                                            onChange={handleChange}
                                            min={2000}
                                            max={2100}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Registration Deadline</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="registrationDeadline"
                                            value={values.registrationDeadline}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Late Registration Fee ($)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="lateRegistrationFee"
                                            value={values.lateRegistrationFee}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Settings */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <FaCalendar className="me-2" />
                                    System Settings
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="maintenanceMode"
                                                name="maintenanceMode"
                                                checked={values.maintenanceMode}
                                                onChange={(e) => setFieldValue('maintenanceMode', e.target.checked)}
                                            />
                                            <label className="form-check-label" htmlFor="maintenanceMode">
                                                Maintenance Mode
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Max Login Attempts</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="maxLoginAttempts"
                                            value={values.maxLoginAttempts}
                                            onChange={handleChange}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Session Timeout (minutes)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="sessionTimeout"
                                            value={values.sessionTimeout}
                                            onChange={handleChange}
                                            min="5"
                                            max="120"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">System Announcement</label>
                                        <textarea
                                            className="form-control"
                                            name="systemAnnouncement"
                                            value={values.systemAnnouncement}
                                            onChange={handleChange}
                                            rows="2"
                                            placeholder="Display an announcement message to all users"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Backup */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <FaDatabase className="me-2" />
                                    System Backup & Restore
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h6 className="card-title">Backup System</h6>
                                                <p className="card-text text-muted small">
                                                    Create a backup of all system data including users, students, 
                                                    settings, and registration records.
                                                </p>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary w-100"
                                                    onClick={handleBackup}
                                                    disabled={backupLoading}
                                                >
                                                    {backupLoading ? (
                                                        <>
                                                            <FaSpinner className="me-2 animate__animated animate__rotateIn" />
                                                            Creating Backup...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaDownload className="me-2" />
                                                            Download Backup
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h6 className="card-title">Restore System</h6>
                                                <p className="card-text text-muted small">
                                                    <FaExclamationTriangle className="text-warning me-1" />
                                                    Warning: Restoring a backup will overwrite all current system data.
                                                </p>
                                                <div className="d-grid">
                                                    <input
                                                        type="file"
                                                        className="form-control mb-2"
                                                        accept=".json"
                                                        onChange={handleRestore}
                                                        disabled={restoreLoading}
                                                        ref={fileInputRef}
                                                    />
                                                    {restoreLoading && (
                                                        <div className="d-flex align-items-center justify-content-center text-primary">
                                                            <FaSpinner className="me-2 animate__animated animate__rotateIn" />
                                                            Restoring System...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-grid">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <FaSpinner className="me-2 animate__animated animate__rotateIn" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="me-2" />
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings; 