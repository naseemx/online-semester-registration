import React, { useState, useEffect } from 'react';
import { BiUser, BiEnvelope, BiLock, BiCheckCircle, BiErrorCircle, BiArrowBack } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setFormData(prevData => ({
                ...prevData,
                username: user.username || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                    <button className={styles.backButton} onClick={() => navigate(-1)}>
                        <BiArrowBack /> Back
                    </button>
                    <h1>Profile Settings</h1>
                </div>
                {notification && (
                    <div className={`${styles.notification} ${styles[notification.type]}`}> 
                        {notification.type === 'success' ? <BiCheckCircle /> : <BiErrorCircle />}
                        <p>{notification.message}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label><BiUser /> Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label><BiEnvelope /> Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className={styles.passwordSection}>
                        <h2>Change Password</h2>
                        <div className={styles.formGroup}>
                            <label><BiLock /> Current Password</label>
                            <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label><BiLock /> New Password</label>
                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label><BiLock /> Confirm New Password</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton}>Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default Profile; 