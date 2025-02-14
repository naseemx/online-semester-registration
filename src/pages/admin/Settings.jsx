import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../utils/api';
import { 
    FaCog, FaEnvelope, FaUniversity, FaCalendar, FaSave, 
    FaSpinner, FaDownload, FaUpload, FaDatabase, FaExclamationTriangle 
} from 'react-icons/fa';
import useForm from '../../hooks/useForm';
import 'animate.css';
import styles from './Settings.module.css';

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
        <div className={styles['settings-container']}>
            <div className={styles['settings-card']}>
                <div className={styles['settings-header']}>
                    <FaCog />
                    <h2>System Settings</h2>
                </div>

                <form onSubmit={handleSubmit(handleSaveSettings)}>
                    {/* Email Settings */}
                    <div className={styles['settings-section']}>
                        <h3>Email Settings</h3>
                        <div className={styles['form-group']}>
                            <div className={styles['toggle-switch']}>
                                <input
                                    type="checkbox"
                                    id="emailNotifications"
                                    checked={values.emailNotifications}
                                    onChange={(e) => setFieldValue('emailNotifications', e.target.checked)}
                                />
                                <label htmlFor="emailNotifications" className={styles['toggle-label']}>
                                    Enable Email Notifications
                                </label>
                            </div>
                        </div>

                        <div className={styles['form-group']}>
                            <label>Email Sender</label>
                            <input
                                type="email"
                                value={values.emailSender}
                                onChange={handleChange}
                                placeholder="noreply@example.com"
                            />
                        </div>

                        <div className={styles['form-group']}>
                            <label>Email Template</label>
                            <textarea
                                value={values.emailTemplate}
                                onChange={handleChange}
                                placeholder="Default email template with placeholders: {name}, {status}, etc."
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Academic Settings */}
                    <div className={styles['settings-section']}>
                        <h3>Academic Settings</h3>
                        <div className={styles['form-group']}>
                            <label>Current Semester</label>
                            <select
                                value={values.currentSemester}
                                onChange={handleChange}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles['form-group']}>
                            <label>Academic Year</label>
                            <input
                                type="number"
                                value={values.academicYear}
                                onChange={handleChange}
                                min={2000}
                                max={2100}
                            />
                        </div>

                        <div className={styles['form-group']}>
                            <label>Registration Deadline</label>
                            <input
                                type="date"
                                value={values.registrationDeadline}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles['form-group']}>
                            <label>Late Registration Fee ($)</label>
                            <input
                                type="number"
                                value={values.lateRegistrationFee}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* System Settings */}
                    <div className={styles['settings-section']}>
                        <h3>System Settings</h3>
                        <div className={styles['form-group']}>
                            <div className={styles['toggle-switch']}>
                                <input
                                    type="checkbox"
                                    id="maintenanceMode"
                                    checked={values.maintenanceMode}
                                    onChange={(e) => setFieldValue('maintenanceMode', e.target.checked)}
                                />
                                <label htmlFor="maintenanceMode" className={styles['toggle-label']}>
                                    Maintenance Mode
                                </label>
                            </div>
                        </div>

                        <div className={styles['form-group']}>
                            <label>Max Login Attempts</label>
                            <input
                                type="number"
                                value={values.maxLoginAttempts}
                                onChange={handleChange}
                                min="1"
                                max="10"
                            />
                        </div>

                        <div className={styles['form-group']}>
                            <label>Session Timeout (minutes)</label>
                            <input
                                type="number"
                                value={values.sessionTimeout}
                                onChange={handleChange}
                                min="5"
                                max="120"
                            />
                        </div>

                        <div className={styles['form-group']}>
                            <label>System Announcement</label>
                            <textarea
                                value={values.systemAnnouncement}
                                onChange={handleChange}
                                placeholder="Display an announcement message to all users"
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Backup & Restore */}
                    <div className={styles['settings-section']}>
                        <h3>System Backup & Restore</h3>
                        <div className={styles['backup-section']}>
                            <p>Download a backup of your system data or restore from a previous backup.</p>
                            <div className={styles['backup-buttons']}>
                                <button
                                    type="button"
                                    className={styles['download-btn']}
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
                                            <FaDownload /> Download Backup
                                        </>
                                    )}
                                </button>
                                <div className={styles['upload-btn']}>
                                    <FaUpload /> Choose File
                                    <input
                                        type="file"
                                        hidden
                                        accept=".json"
                                        onChange={handleRestore}
                                        disabled={restoreLoading}
                                        ref={fileInputRef}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles['d-grid']}>
                        <button
                            type="submit"
                            className={styles['save-button']}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <FaSpinner className="me-2 animate__animated animate__rotateIn" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings; 