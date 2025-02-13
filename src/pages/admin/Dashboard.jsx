import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { FaUsers, FaGraduationCap, FaChalkboardTeacher, FaUserTie, FaChartLine } from 'react-icons/fa';
import 'animate.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTutors: 0,
        totalStaff: 0,
        completedRegistrations: 0,
        pendingRegistrations: 0,
        pendingFines: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getDashboardStats();
            setStats(response.data.data);
        } catch (err) {
            setError('Error fetching dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="card shadow animate__animated animate__fadeIn">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">
                        <FaChartLine className="me-2" />
                        System Overview
                    </h4>
                </div>
                <div className="card-body">
                    {error && (
                        <div className="alert alert-danger animate__animated animate__shakeX">
                            {error}
                        </div>
                    )}

                    <div className="row g-4">
                        {/* User Statistics */}
                        <div className="col-md-12">
                            <h5 className="mb-3">User Statistics</h5>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="card bg-primary text-white animate__animated animate__fadeIn">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-0">Total Students</h6>
                                                    <h2 className="mb-0">{stats.totalStudents}</h2>
                                                </div>
                                                <FaGraduationCap size={32} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-success text-white animate__animated animate__fadeIn">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-0">Total Tutors</h6>
                                                    <h2 className="mb-0">{stats.totalTutors}</h2>
                                                </div>
                                                <FaChalkboardTeacher size={32} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-info text-white animate__animated animate__fadeIn">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-0">Total Staff</h6>
                                                    <h2 className="mb-0">{stats.totalStaff}</h2>
                                                </div>
                                                <FaUserTie size={32} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Registration Statistics */}
                        <div className="col-md-12">
                            <h5 className="mb-3">Registration Statistics</h5>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="card bg-success text-white animate__animated animate__fadeIn">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-0">Completed Registrations</h6>
                                                    <h2 className="mb-0">{stats.completedRegistrations}</h2>
                                                </div>
                                                <FaUsers size={32} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-warning text-dark animate__animated animate__fadeIn">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-0">Pending Registrations</h6>
                                                    <h2 className="mb-0">{stats.pendingRegistrations}</h2>
                                                </div>
                                                <FaUsers size={32} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-danger text-white animate__animated animate__fadeIn">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-0">Pending Fines</h6>
                                                    <h2 className="mb-0">${stats.pendingFines.toFixed(2)}</h2>
                                                </div>
                                                <FaUsers size={32} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 