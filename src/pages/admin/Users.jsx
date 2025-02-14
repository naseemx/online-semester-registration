import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaSpinner } from 'react-icons/fa';
import { adminAPI } from '../../utils/api';
import styles from './Users.module.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminAPI.getUsers();
            if (response.data.success) {
                setUsers(response.data.data || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users. Please try again later.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await adminAPI.deleteUser(userId);
            if (response.data.success) {
                setUsers(users.filter(user => user._id !== userId));
                setError(null);
            } else {
                throw new Error(response.data.message || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete user. Please try again later.');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchQuery || (
            (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleFormSubmit = async (userData) => {
        try {
            let response;
            if (selectedUser) {
                response = await adminAPI.updateUser(selectedUser._id, userData);
            } else {
                response = await adminAPI.createUser(userData);
            }

            if (response.data.success) {
                if (selectedUser) {
                    setUsers(users.map(u => u._id === selectedUser._id ? response.data.data : u));
                } else {
                    setUsers([...users, response.data.data]);
                }
                setShowModal(false);
                setError(null);
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to save user');
            }
        } catch (err) {
            console.error('Save user error:', err);
            throw err;
        }
    };

    if (loading) {
        return (
            <div className={styles['loading-container']}>
                <FaSpinner className={styles.spinner} />
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className={styles['users-container']}>
            <div className={styles['page-header']}>
                <h1>Users Management</h1>
                <button 
                    className={styles['add-user-btn']}
                    onClick={() => {
                        setSelectedUser(null);
                        setShowModal(true);
                        setError(null);
                    }}
                >
                    <FaUserPlus />
                    Add User
                </button>
            </div>

            {error && (
                <div className={styles['error-message']}>
                    {error}
                </div>
            )}

            <div className={styles['filters-section']}>
                <div className={styles['search-box']}>
                    <FaSearch className={styles['search-icon']} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles['search-input']}
                    />
                </div>
                <div className={styles['role-filter']}>
                    <FaFilter className={styles['filter-icon']} />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className={styles['role-select']}
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="tutor">Tutor</option>
                        <option value="staff">Staff</option>
                        <option value="student">Student</option>
                    </select>
                </div>
            </div>

            <div className={styles['users-grid']}>
                {filteredUsers.length === 0 ? (
                    <div className={styles['no-results']}>
                        <p>
                            {searchQuery || roleFilter !== 'all'
                                ? 'No users found matching your criteria'
                                : 'No users found in the system'}
                        </p>
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div key={user.id} className={styles['user-card']}>
                            <div className={styles['user-avatar']}>
                                {getInitials(user.username)}
                            </div>
                            <div className={styles['user-info']}>
                                <h3>{user.username}</h3>
                                <p className={styles['user-email']}>{user.email}</p>
                                <span className={`${styles['role-badge']} ${styles[user.role]}`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className={styles['user-actions']}>
                                <button
                                    className={styles['edit-btn']}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setShowModal(true);
                                    }}
                                    title="Edit user"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    className={styles['delete-btn']}
                                    onClick={() => handleDeleteUser(user.id)}
                                    title="Delete user"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['modal-content']}>
                        <h2>{selectedUser ? 'Edit User' : 'Add New User'}</h2>
                        <UserForm
                            user={selectedUser}
                            onSubmit={handleFormSubmit}
                            onCancel={() => {
                                setShowModal(false);
                                setError(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const UserForm = ({ user, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        role: user?.role || 'student',
        password: ''
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);

        try {
            // Validate form data
            if (!formData.username.trim()) {
                setFormError('Username is required');
                return;
            }
            if (!formData.email.trim()) {
                setFormError('Email is required');
                return;
            }
            if (!user && !formData.password.trim()) {
                setFormError('Password is required for new users');
                return;
            }
            if (!user && formData.password.length < 6) {
                setFormError('Password must be at least 6 characters');
                return;
            }

            // Remove password if empty (for updates)
            const userData = { ...formData };
            if (!userData.password) {
                delete userData.password;
            }

            const success = await onSubmit(userData);
            if (success) {
                onCancel();
            }
        } catch (err) {
            console.error('Form submission error:', err);
            setFormError(err.response?.data?.message || 'Failed to save user. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles['user-form']}>
            {formError && (
                <div className={styles['form-error']}>
                    {formError}
                </div>
            )}
            <div className={styles['form-group']}>
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={submitting}
                />
            </div>
            <div className={styles['form-group']}>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={submitting}
                />
            </div>
            <div className={styles['form-group']}>
                <label className={styles.formLabel}>Role</label>
                <select
                    className={styles.formSelect}
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="tutor">Tutor</option>
                    <option value="staff">Staff</option>
                    <option value="student">Student</option>
                </select>
            </div>
            {!user && (
                <div className={styles['form-group']}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!user}
                        minLength={6}
                        disabled={submitting}
                    />
                    <small>Minimum 6 characters</small>
                </div>
            )}
            <div className={styles['form-actions']}>
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className={styles['cancel-btn']}
                    disabled={submitting}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className={styles['submit-btn']}
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <FaSpinner className={styles.spinner} />
                            {user ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        user ? 'Update User' : 'Create User'
                    )}
                </button>
            </div>
        </form>
    );
};

export default Users; 