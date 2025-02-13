import { useState, useEffect } from 'react';
import { tutorAPI } from '../../utils/api';
import { FaGraduationCap, FaSearch, FaCheckCircle, FaTimesCircle, FaSpinner, FaFilter } from 'react-icons/fa';
import 'animate.css';

const Registrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [approving, setApproving] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchRegistrations();
    }, [statusFilter]);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const response = await tutorAPI.getRegistrations(statusFilter);
            setRegistrations(response.data.data);
        } catch (err) {
            setError('Error fetching registrations');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRegistration = async (studentId) => {
        try {
            setApproving(studentId);
            await tutorAPI.approveRegistration(studentId);
            await fetchRegistrations(); // Refresh the list
        } catch (err) {
            setError('Error approving registration');
        } finally {
            setApproving(null);
        }
    };

    const filteredRegistrations = registrations.filter(reg =>
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="badge bg-success">Completed</span>;
            case 'in progress':
                return <span className="badge bg-warning">In Progress</span>;
            default:
                return <span className="badge bg-secondary">Not Started</span>;
        }
    };

    if (loading && !registrations.length) {
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
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">
                            <FaGraduationCap className="me-2" />
                            Student Registrations
                        </h4>
                        <div className="d-flex gap-3">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaFilter />
                                </span>
                                <select 
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="not started">Not Started</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaSearch />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
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
                                    <th>Student</th>
                                    <th>Department</th>
                                    <th>Semester</th>
                                    <th>Verification Status</th>
                                    <th>Registration Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRegistrations.map((student) => (
                                    <tr key={student._id} className="animate__animated animate__fadeIn">
                                        <td>
                                            <div>
                                                <h6 className="mb-0">{student.name}</h6>
                                                <small className="text-muted">
                                                    {student.admissionNumber}
                                                </small>
                                            </div>
                                        </td>
                                        <td>{student.department}</td>
                                        <td>{student.semester}</td>
                                        <td>
                                            <div className="d-flex flex-column gap-1">
                                                <div>
                                                    <FaCheckCircle className={`me-1 ${
                                                        student.libraryStatus === 'clear' ? 'text-success' : 'text-danger'
                                                    }`} />
                                                    Library: {student.libraryStatus}
                                                </div>
                                                <div>
                                                    <FaCheckCircle className={`me-1 ${
                                                        student.labStatus === 'clear' ? 'text-success' : 'text-danger'
                                                    }`} />
                                                    Lab: {student.labStatus}
                                                </div>
                                                <div>
                                                    <FaCheckCircle className={`me-1 ${
                                                        student.officeStatus === 'clear' ? 'text-success' : 'text-danger'
                                                    }`} />
                                                    Office: {student.officeStatus}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {getStatusBadge(student.registrationStatus)}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleApproveRegistration(student._id)}
                                                disabled={
                                                    approving === student._id ||
                                                    student.registrationStatus === 'completed' ||
                                                    !student.isEligibleForRegistration
                                                }
                                            >
                                                {approving === student._id ? (
                                                    <>
                                                        <FaSpinner className="me-1 animate__animated animate__rotateIn" />
                                                        Approving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaCheckCircle className="me-1" />
                                                        Approve
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRegistrations.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            <FaTimesCircle className="text-muted mb-2" size={32} />
                                            <h5>No registrations found</h5>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registrations; 