import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import styles from './Profile.module.css';

const Profile = () => {
    const [formData, setFormData] = useState({
        username: 'admin',
        email: 'admin@example.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [notification, setNotification] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate passwords match
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setNotification({
                type: 'error',
                message: 'New passwords do not match'
            });
            return;
        }

        try {
            // API call would go here
            setNotification({
                type: 'success',
                message: 'Profile updated successfully'
            });
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.message || 'Error updating profile'
            });
        }
    };

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatar}>
                        <FaUser />
                    </div>
                    <h1>Profile Settings</h1>
                </div>

                {notification && (
                    <div className={`${styles.notification} ${styles[notification.type]}`}>
                        {notification.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
                        {notification.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>
                            <FaUser className={styles.inputIcon} />
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled
                            className={styles.disabled}
                        />
                        <small>Username cannot be changed</small>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            <FaEnvelope className={styles.inputIcon} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.passwordSection}>
                        <h2>Change Password</h2>
                        
                        <div className={styles.formGroup}>
                            <label>
                                <FaLock className={styles.inputIcon} />
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                <FaLock className={styles.inputIcon} />
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                <FaLock className={styles.inputIcon} />
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.updateButton}>
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile; 