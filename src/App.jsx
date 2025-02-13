import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Registration from './pages/student/Registration';
import Status from './pages/student/Status';
import ManageFines from './pages/staff/ManageFines';
import Registrations from './pages/tutor/Registrations';
import Reports from './pages/tutor/Reports';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Students from './pages/admin/Students';
import Settings from './pages/admin/Settings';
import Logs from './pages/admin/Logs';
import Notifications from './pages/admin/Notifications';
import Profile from './pages/Profile';

// Import Bootstrap and custom CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'animate.css/animate.min.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-vh-100 d-flex flex-column">
                    <Navbar />
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
                                        <ManageFines />
                                    </PrivateRoute>
                                }
                            />

                            {/* Tutor routes */}
                            <Route
                                path="/tutor/registrations"
                                element={
                                    <PrivateRoute roles={['tutor']}>
                                        <Registrations />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/tutor/reports"
                                element={
                                    <PrivateRoute roles={['tutor']}>
                                        <Reports />
                                    </PrivateRoute>
                                }
                            />

                            {/* Admin routes */}
                            <Route
                                path="/admin/dashboard"
                                element={
                                    <PrivateRoute roles={['admin']}>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin/users"
                                element={
                                    <PrivateRoute roles={['admin']}>
                                        <Users />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin/students"
                                element={
                                    <PrivateRoute roles={['admin']}>
                                        <Students />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin/settings"
                                element={
                                    <PrivateRoute roles={['admin']}>
                                        <Settings />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin/logs"
                                element={
                                    <PrivateRoute roles={['admin']}>
                                        <Logs />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin/notifications"
                                element={
                                    <PrivateRoute roles={['admin']}>
                                        <Notifications />
                                    </PrivateRoute>
                                }
                            />

                            {/* Default route */}
                            <Route path="/" element={<Navigate to="/login" />} />
                        </Routes>
                    </main>
                    <footer className="py-3 bg-light text-center">
                        <div className="container">
                            <p className="mb-0">© 2024 Semester Registration System</p>
                        </div>
                    </footer>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App; 