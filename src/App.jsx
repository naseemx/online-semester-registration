import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Registration from './pages/student/Registration';
import Status from './pages/student/Status';
import ManageFines from './pages/staff/ManageFines';
import StudentFinesDashboard from './pages/staff/StudentFinesDashboard';
import Registrations from './pages/tutor/Registrations';
import Reports from './pages/tutor/Reports';
import SemesterRegistration from './pages/tutor/SemesterRegistration';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Students from './pages/admin/Students';
import Logs from './pages/admin/Logs';
import Notifications from './pages/admin/Notifications';
import Profile from './pages/Profile';
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import TutorLayout from './layouts/TutorLayout';
import StudentLayout from './layouts/StudentLayout';
import TutorAssignments from './pages/admin/TutorAssignments';

// Import Bootstrap and custom CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'animate.css/animate.min.css';
import 'react-toastify/dist/ReactToastify.css';

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

const App = () => {
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
                                    path="/student/*"
                                    element={
                                        <PrivateRoute roles={['student']}>
                                            <StudentLayout>
                                                <Routes>
                                                    <Route path="registration" element={<Registration />} />
                                                    <Route path="status" element={<Status />} />
                                                    <Route path="" element={<Navigate to="registration" replace />} />
                                                </Routes>
                                            </StudentLayout>
                                        </PrivateRoute>
                                    }
                                />

                                {/* Staff routes */}
                                <Route
                                    path="/staff/*"
                                    element={
                                        <PrivateRoute roles={['staff']}>
                                            <StaffLayout>
                                                <Routes>
                                                    <Route path="dashboard" element={<StudentFinesDashboard />} />
                                                    <Route path="fines" element={<ManageFines />} />
                                                    <Route path="" element={<Navigate to="dashboard" replace />} />
                                                </Routes>
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
                                                    <Route path="semester-registration" element={<SemesterRegistration />} />
                                                    <Route path="" element={<Navigate to="registrations" replace />} />
                                                </Routes>
                                            </TutorLayout>
                                        </PrivateRoute>
                                    }
                                />

                                {/* Admin routes */}
                                <Route
                                    path="/admin/*"
                                    element={
                                        <PrivateRoute roles={['admin']}>
                                            <AdminLayout>
                                                <Routes>
                                                    <Route path="dashboard" element={<Dashboard />} />
                                                    <Route path="users" element={<Users />} />
                                                    <Route path="students" element={<Students />} />
                                                    <Route path="tutor-assignments" element={<TutorAssignments />} />
                                                    <Route path="logs" element={<Logs />} />
                                                    <Route path="notifications" element={<Notifications />} />
                                                    <Route path="" element={<Navigate to="dashboard" replace />} />
                                                </Routes>
                                            </AdminLayout>
                                        </PrivateRoute>
                                    }
                                />

                                {/* Default route */}
                                <Route path="/" element={<Navigate to="/login" />} />
                            </Routes>
                        </main>
                    </div>
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                    />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App; 