import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { FaUser, FaSearch, FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import useForm from '../../hooks/useForm';
import 'animate.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const { values, handleChange, handleSubmit, reset, setFieldValue } = useForm({
        username: '',
        password: '',
        email: '',
        role: 'student'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getUsers();
            setUsers(response.data.data);
        } catch (err) {
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (formData) => {
        try {
            setError('');
            await adminAPI.createUser(formData);
            fetchUsers();
            setShowForm(false);
            reset();
        } catch (err) {
            setError('Error creating user');
        }
    };

    const handleUpdateUser = async (formData) => {
        try {
            setError('');
            const response = await adminAPI.updateUser(editingUser._id, formData);
            if (response.data.success) {
                await fetchUsers();
                setShowForm(false);
                setEditingUser(null);
                reset();
            } else {
                setError(response.data.message || 'Error updating user');
            }
        } catch (err) {
            console.error('Update user error:', err);
            setError(err.response?.data?.message || 'Error updating user');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            setDeleting(userId);
            await adminAPI.deleteUser(userId);
            fetchUsers();
        } catch (err) {
            setError('Error deleting user');
        } finally {
            setDeleting(null);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFieldValue('username', user.username);
        setFieldValue('email', user.email);
        setFieldValue('role', user.role);
        setFieldValue('password', ''); // Clear password field for security
        setShowForm(true);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container py-4">
            <div className="row">
                {/* User List */}
                <div className={showForm ? 'col-md-8' : 'col-12'}>
                    <div className="card shadow animate__animated animate__fadeIn">
                        <div className="card-header bg-primary text-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">
                                    <FaUser className="me-2" />
                                    Users
                                </h4>
                                <div className="d-flex gap-2">
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FaSearch />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => {
                                            setEditingUser(null);
                                            reset();
                                            setShowForm(true);
                                        }}
                                    >
                                        <FaPlus className="me-1" />
                                        Add User
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger animate__animated animate__shakeX">
                                    {error}
                                </div>
                            )}

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user._id} className="animate__animated animate__fadeIn">
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`badge bg-${
                                                        user.role === 'admin' ? 'danger' :
                                                        user.role === 'tutor' ? 'success' :
                                                        user.role === 'staff' ? 'warning' :
                                                        'info'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group">
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleEdit(user)}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            disabled={deleting === user._id}
                                                        >
                                                            {deleting === user._id ? (
                                                                <FaSpinner className="animate__animated animate__rotateIn" />
                                                            ) : (
                                                                <FaTrash />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Form */}
                {showForm && (
                    <div className="col-md-4">
                        <div className="card shadow animate__animated animate__fadeInRight">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">
                                    {editingUser ? 'Edit User' : 'Add User'}
                                </h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit(editingUser ? handleUpdateUser : handleCreateUser)}>
                                    <div className="mb-3">
                                        <label className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={values.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={values.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={values.password}
                                            onChange={handleChange}
                                            placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                                            required={!editingUser}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Role</label>
                                        <select
                                            className="form-select"
                                            name="role"
                                            value={values.role}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="student">Student</option>
                                            <option value="staff">Staff</option>
                                            <option value="tutor">Tutor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary">
                                            {editingUser ? 'Update User' : 'Create User'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingUser(null);
                                                reset();
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users; 