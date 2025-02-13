import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaKey, FaEnvelope, FaSave, FaSpinner } from 'react-icons/fa';
import api from '../utils/api';
import 'animate.css';

const Profile = () => {
    const { user, checkAuthStatus } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            setLoading(true);
            await api.put('/auth/profile', {
                email: formData.email,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword || undefined
            });

            setSuccess('Profile updated successfully');
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            // Refresh auth status to update user info
            await checkAuthStatus();
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow animate__animated animate__fadeIn">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                <FaUser className="me-2" />
                                Profile Settings
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

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={user?.username || ''}
                                        disabled
                                    />
                                    <small className="text-muted">
                                        Username cannot be changed
                                    </small>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">
                                        <FaEnvelope className="me-2" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">
                                        <FaKey className="me-2" />
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">
                                        <FaKey className="me-2" />
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        minLength="6"
                                    />
                                    <small className="text-muted">
                                        Leave blank to keep current password
                                    </small>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">
                                        <FaKey className="me-2" />
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        minLength="6"
                                    />
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <FaSpinner className="me-2 animate__animated animate__rotateIn" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="me-2" />
                                                Update Profile
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 