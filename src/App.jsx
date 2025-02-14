import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Registration from './pages/student/Registration';
import Status from './pages/student/Status';
import ManageFines from './pages/staff/ManageFines';
import Registrations from './pages/tutor/Registrations';
import Reports from './pages/tutor/Reports';
import SemesterEmail from './pages/tutor/SemesterEmail';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Students from './pages/admin/Students';
import Settings from './pages/admin/Settings';
import Logs from './pages/admin/Logs';
import Notifications from './pages/admin/Notifications';
import Profile from './pages/Profile';
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import TutorLayout from './layouts/TutorLayout';

// Import Bootstrap and custom CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'animate.css/animate.min.css';

// Admin Route wrapper component
const AdminRoute = ({ children }) => {
    // Add your authentication logic here
    const isAuthenticated = true; // Replace with actual auth check
    const isAdmin = true; // Replace with actual role check

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    return <AdminLayout>{children}</AdminLayout>;
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="min-vh-100 d-flex flex-column">
                        <main className="flex-grow-1">
                            <Routes>
                                {/* Public routes */}
                                <Route path="/login" element={<Login />} />
                                
                                {/* Protected routes */}
                                <Route
                                    path="/profile"
                                    element={
                                        <PrivateRoute roles={['student', 'staff', 'tutor', 'admin']}>
                                            <Profile />
                                        </PrivateRoute>
                                    }
                                />

                                {/* Student routes */}
                                <Route
                                    path="/student/registration"
                                    element={
                                        <PrivateRoute roles={['student']}>
                                            <Registration />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/student/status"
                                    element={
                                        <PrivateRoute roles={['student']}>
                                            <Status />
                                        </PrivateRoute>
                                    }
                                />

                                {/* Staff routes */}
                                <Route
                                    path="/staff/fines"
                                    element={
                                        <PrivateRoute roles={['staff']}>
                                            <StaffLayout>
                                                <ManageFines />
                                            </StaffLayout>
                                        </PrivateRoute>
                                    }
                                />

                                {/* Tutor routes */}
                                <Route
                                    path="/tutor/*"
                                    element={
                                        <PrivateRoute roles={['tutor']}>
                                            <TutorLayout>
                                                <Routes>
                                                    <Route path="registrations" element={<Registrations />} />
                                                    <Route path="reports" element={<Reports />} />
                                                    <Route path="semester-email" element={<SemesterEmail />} />
                                                    <Route path="" element={<Navigate to="registrations" replace />} />
                                                </Routes>
                                            </TutorLayout>
                                        </PrivateRoute>
                                    }
                                />

                                {/* Admin routes */}
                                <Route
                                    path="/admin/dashboard"
                                    element={
                                        <AdminRoute>
                                            <Dashboard />
                                        </AdminRoute>
                                    }
                                />
                                <Route
                                    path="/admin/users"
                                    element={
                                        <AdminRoute>
                                            <Users />
                                        </AdminRoute>
                                    }
                                />
                                <Route
                                    path="/admin/students"
                                    element={
                                        <AdminRoute>
                                            <Students />
                                        </AdminRoute>
                                    }
                                />
                                <Route
                                    path="/admin/settings"
                                    element={
                                        <AdminRoute>
                                            <Settings />
                                        </AdminRoute>
                                    }
                                />
                                <Route
                                    path="/admin/logs"
                                    element={
                                        <AdminRoute>
                                            <Logs />
                                        </AdminRoute>
                                    }
                                />
                                <Route
                                    path="/admin/notifications"
                                    element={
                                        <AdminRoute>
                                            <Notifications />
                                        </AdminRoute>
                                    }
                                />

                                {/* Default route */}
                                <Route path="/" element={<Navigate to="/login" />} />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App; 