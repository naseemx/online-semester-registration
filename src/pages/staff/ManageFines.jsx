import { useState, useEffect } from 'react';
import { staffAPI } from '../../utils/api';
import { FaMoneyBill, FaSearch, FaSave, FaTimesCircle } from 'react-icons/fa';
import useForm from '../../hooks/useForm';
import 'animate.css';

const FINE_CATEGORIES = ['tuition', 'transportation', 'hostelFees', 'labFines', 'libraryFines'];

// Helper function to check if student has actual pending fines
const hasPendingFines = (fines) => {
    return FINE_CATEGORIES.some(category => 
        fines[category]?.status === 'pending' && 
        fines[category]?.amount > 0
    );
};

const ManageFines = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // Initialize form with only the necessary fine categories
    const initialValues = FINE_CATEGORIES.reduce((acc, category) => {
        acc[category] = { amount: 0, status: 'pending' };
        return acc;
    }, {});

    const { values, handleChange, handleSubmit, reset, setFieldValue } = useForm(initialValues);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await staffAPI.getAllStudentFines();
            setStudents(response.data.data);
        } catch (err) {
            setError('Error fetching student fines');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSelect = async (student) => {
        try {
            setSelectedStudent(student);
            const response = await staffAPI.getStudentFines(student.student._id);
            const fines = response.data.data;
            
            // Only set values for the defined fine categories
            FINE_CATEGORIES.forEach(category => {
                if (fines[category]) {
                    setFieldValue(category, {
                        amount: fines[category].amount || 0,
                        status: fines[category].status || 'pending'
                    });
                }
            });
        } catch (err) {
            setError('Error fetching student details');
        }
    };

    const handleFineUpdate = async (formValues) => {
        try {
            setError('');
            setUpdateSuccess(false);
            
            // Only include the defined fine categories in the update
            const updatedFines = {};
            FINE_CATEGORIES.forEach(category => {
                if (formValues[category]) {
                    updatedFines[category] = {
                        amount: Number(formValues[category].amount),
                        status: formValues[category].status
                    };
                }
            });

            const response = await staffAPI.updateFines(selectedStudent.student._id, updatedFines);
            
            if (response.data.success) {
                setUpdateSuccess(true);
                setSelectedStudent(prevState => ({
                    ...prevState,
                    ...response.data.data
                }));
                await fetchStudents();
                setTimeout(() => setUpdateSuccess(false), 3000);
            } else {
                setError(response.data.message || 'Error updating fines');
            }
        } catch (err) {
            console.error('Fine update error:', err);
            setError(err.response?.data?.message || 'Error updating fines');
        }
    };

    const filteredStudents = students.filter(student =>
        student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading && !students.length) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="row">
                {/* Student List */}
                <div className="col-md-4">
                    <div className="card shadow animate__animated animate__fadeIn">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">Students</h4>
                        </div>
                        <div className="card-body">
                            <div className="input-group mb-3">
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
                            <div className="list-group">
                                {filteredStudents.map((student) => (
                                    <button
                                        key={student.student._id}
                                        className={`list-group-item list-group-item-action ${
                                            selectedStudent?.student._id === student.student._id ? 'active' : ''
                                        }`}
                                        onClick={() => handleStudentSelect(student)}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0">{student.student.name}</h6>
                                                <small>{student.student.admissionNumber}</small>
                                            </div>
                                            {hasPendingFines(student) && (
                                                <span className="badge bg-danger">Has Pending Fines</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fine Management Form */}
                <div className="col-md-8">
                    {selectedStudent ? (
                        <div className="card shadow animate__animated animate__fadeIn">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">
                                    <FaMoneyBill className="me-2" />
                                    Manage Fines - {selectedStudent.student.name}
                                </h4>
                            </div>
                            <div className="card-body">
                                {error && (
                                    <div className="alert alert-danger animate__animated animate__shakeX">
                                        {error}
                                    </div>
                                )}
                                {updateSuccess && (
                                    <div className="alert alert-success animate__animated animate__fadeIn">
                                        Fines updated successfully!
                                    </div>
                                )}
                                <form onSubmit={handleSubmit(handleFineUpdate)}>
                                    {FINE_CATEGORIES.map((category) => (
                                        <div key={category} className="card mb-3">
                                            <div className="card-body">
                                                <h6>{category.replace(/([A-Z])/g, ' $1').trim()}</h6>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Amount</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text">$</span>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                name={`${category}.amount`}
                                                                value={values[category]?.amount || 0}
                                                                onChange={handleChange}
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Status</label>
                                                        <select
                                                            className="form-select"
                                                            name={`${category}.status`}
                                                            value={values[category]?.status || 'pending'}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="paid">Paid</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary">
                                            <FaSave className="me-2" />
                                            Update Fines
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="card shadow">
                            <div className="card-body text-center py-5">
                                <FaTimesCircle className="text-muted mb-3" size={48} />
                                <h5>Select a student to manage fines</h5>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageFines; 