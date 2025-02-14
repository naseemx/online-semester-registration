import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaEnvelope } from 'react-icons/fa';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/login');
        }
    };

    const getRoleBasedLinks = () => {
        if (!user) return null;

        switch (user.role) {
            case 'student':
                return (
                    <>
                        <li className="nav-item">
                            <Link className="nav-link" to="/student/registration">Registration</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/student/status">Status</Link>
                        </li>
                    </>
                );
            case 'staff':
                return (
                    <li className="nav-item">
                        <Link className="nav-link" to="/staff/fines">Manage Fines</Link>
                    </li>
                );
            case 'tutor':
                return (
                    <>
                        <li className="nav-item">
                            <Link className="nav-link" to="/tutor/registrations">Registrations</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/tutor/semester-email">
                                <FaEnvelope className="me-1" />
                                Send Emails
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/tutor/reports">Reports</Link>
                        </li>
                    </>
                );
            case 'admin':
                return (
                    <>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/users">Users</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/students">Students</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/settings">Settings</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/logs">Logs</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/notifications">Notifications</Link>
                        </li>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    Semester Registration
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {user && getRoleBasedLinks()}
                    </ul>
                    <ul className="navbar-nav">
                        {user ? (
                            <>
                                <NotificationBell />
                                <li className="nav-item">
                                    <Link className="nav-link" to="/profile">
                                        <FaUser className="me-1" />
                                        {user.username}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="btn btn-link nav-link"
                                        onClick={handleLogout}
                                    >
                                        <FaSignOutAlt className="me-1" />
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 