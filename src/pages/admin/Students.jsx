import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { FaGraduationCap, FaSearch, FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import useForm from '../../hooks/useForm';
import 'animate.css';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const { values, handleChange, handleSubmit, reset, setFieldValue } = useForm({
        name: '',
        admissionNumber: '',
        universityRegisterNumber: '',
        department: '',
        semester: '1',
        email: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getStudents();
            setStudents(response.data.data);
        } catch (err) {
            setError('Error fetching students');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudent = async (formData) => {
        try {
            setError('');
            const response = await adminAPI.createStudent(formData);
            if (response.data.success) {
                fetchStudents();
                setShowForm(false);
                reset();
            } else {
                setError(response.data.message || 'Error creating student');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating student');
        }
    };

    const handleUpdateStudent = async (formData) => {
        try {
            setError('');
            await adminAPI.updateStudent(editingStudent._id, formData);
            fetchStudents();
            setShowForm(false);
            setEditingStudent(null);
            reset();
        } catch (err) {
            setError('Error updating student');
        }
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            setDeleting(studentId);
            await adminAPI.deleteStudent(studentId);
            fetchStudents();
        } catch (err) {
            setError('Error deleting student');
        } finally {
            setDeleting(null);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        Object.keys(values).forEach(key => {
            setFieldValue(key, student[key] || '');
        });
        setShowForm(true);
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container py-4">
            <div className="row">
                {/* Student List */}
                <div className={showForm ? 'col-md-8' : 'col-12'}>
                    <div className="card shadow animate__animated animate__fadeIn">
                        <div className="card-header bg-primary text-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">
                                    <FaGraduationCap className="me-2" />
                                    Students
                                </h4>
                                <div className="d-flex gap-2">
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
                                    <button
                                        className="btn btn-success"
                                        onClick={() => {
                                            setEditingStudent(null);
                                            reset();
                                            setShowForm(true);
                                        }}
                                    >
                                        <FaPlus className="me-1" />
                                        Add Student
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
                                            <th>Name</th>
                                            <th>Admission No.</th>
                                            <th>Department</th>
                                            <th>Semester</th>
                                            <th>Contact</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => (
                                            <tr key={student._id} className="animate__animated animate__fadeIn">
                                                <td>{student.name}</td>
                                                <td>{student.admissionNumber}</td>
                                                <td>{student.department}</td>
                                                <td>{student.semester}</td>
                                                <td>
                                                    <div>
                                                        <small className="text-muted d-block">{student.email}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="btn-group">
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleEdit(student)}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDeleteStudent(student._id)}
                                                            disabled={deleting === student._id}
                                                        >
                                                            {deleting === student._id ? (
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

                {/* Student Form */}
                {showForm && (
                    <div className="col-md-4">
                        <div className="card shadow animate__animated animate__fadeInRight">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">
                                    {editingStudent ? 'Edit Student' : 'Add Student'}
                                </h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit(editingStudent ? handleUpdateStudent : handleCreateStudent)}>
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={values.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Admission Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="admissionNumber"
                                            value={values.admissionNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">University Register Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="universityRegisterNumber"
                                            value={values.universityRegisterNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Department</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="department"
                                            value={values.department}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Semester</label>
                                        <select
                                            className="form-select"
                                            name="semester"
                                            value={values.semester}
                                            onChange={handleChange}
                                            required
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
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
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary">
                                            {editingStudent ? 'Update Student' : 'Create Student'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingStudent(null);
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

export default Students; 