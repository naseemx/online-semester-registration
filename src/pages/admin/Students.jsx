import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { FaGraduationCap, FaSearch, FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import useForm from '../../hooks/useForm';
import styles from './Students.module.css';
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
        <div className={styles.container}>
            <div className="row">
                {/* Student List */}
                <div className={showForm ? 'col-md-8' : 'col-12'}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.headerContent}>
                                <h4 className={styles.headerTitle}>
                                    <FaGraduationCap />
                                    Students
                                </h4>
                                <div className={styles.searchContainer}>
                                    <div className={styles.searchGroup}>
                                        <span className={styles.searchIcon}>
                                            <FaSearch />
                                        </span>
                                        <input
                                            type="text"
                                            className={styles.searchInput}
                                            placeholder="Search students..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className={styles.addButton}
                                        onClick={() => {
                                            setEditingStudent(null);
                                            reset();
                                            setShowForm(true);
                                        }}
                                    >
                                        <FaPlus />
                                        Add Student
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            {error && (
                                <div className={styles.errorAlert}>
                                    {error}
                                </div>
                            )}

                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
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
                                            <tr key={student._id}>
                                                <td>{student.name}</td>
                                                <td>{student.admissionNumber}</td>
                                                <td>{student.department}</td>
                                                <td>{student.semester}</td>
                                                <td>
                                                    <div>
                                                        <small className={styles.emailText}>{student.email}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.actionButtons}>
                                                        <button
                                                            className={styles.editButton}
                                                            onClick={() => handleEdit(student)}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            className={styles.deleteButton}
                                                            onClick={() => handleDeleteStudent(student._id)}
                                                            disabled={deleting === student._id}
                                                        >
                                                            {deleting === student._id ? (
                                                                <FaSpinner className={styles.spinner} />
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
                        <div className={styles.formCard}>
                            <div className={styles.formHeader}>
                                <h4 className={styles.headerTitle}>
                                    {editingStudent ? 'Edit Student' : 'Add Student'}
                                </h4>
                            </div>
                            <div className={styles.formBody}>
                                <form onSubmit={handleSubmit(editingStudent ? handleUpdateStudent : handleCreateStudent)}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Name</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            name="name"
                                            value={values.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Admission Number</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            name="admissionNumber"
                                            value={values.admissionNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>University Register Number</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            name="universityRegisterNumber"
                                            value={values.universityRegisterNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Department</label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            name="department"
                                            value={values.department}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Semester</label>
                                        <select
                                            className={styles.formSelect}
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
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Email</label>
                                        <input
                                            type="email"
                                            className={styles.formInput}
                                            name="email"
                                            value={values.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formButtons}>
                                        <button type="submit" className={styles.submitButton}>
                                            {editingStudent ? 'Update Student' : 'Create Student'}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.cancelButton}
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