import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const roleRoutes = {
            student: '/student/registration',
            staff: '/staff/dashboard',
            tutor: '/tutor/registrations',
            admin: '/admin/dashboard'
        };
        return <Navigate to={roleRoutes[user.role] || '/'} />;
    }

    return children;
};

export default PrivateRoute; 