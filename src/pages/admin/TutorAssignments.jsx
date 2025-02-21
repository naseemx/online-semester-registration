import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaTrash, FaPlus, FaList } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from './TutorAssignments.module.css';
import { adminAPI } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DEPARTMENTS = ['CSE', 'ECE', 'CE', 'ME', 'SFE', 'CSCS', 'CSBS', 'AI&DS'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const TutorAssignments = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
    const [assignments, setAssignments] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [students, setStudents] = useState({});
    const [loading, setLoading] = useState(true);
    const [studentCounts, setStudentCounts] = useState({});
    const [formData, setFormData] = useState({
        tutorId: '',
        assignments: []
    });
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedSemesters, setSelectedSemesters] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch student counts for department-semester combinations
    const fetchStudentCounts = async (departments, semesters) => {
        try {
            const counts = {};
            for (const dept of departments) {
                for (const sem of semesters) {
                    const response = await adminAPI.getStudents({ department: dept, semester: parseInt(sem) });
                    const key = `${dept}-${sem}`;
                    counts[key] = response.data?.data?.length || 0;
                }
            }
            setStudentCounts(counts);
            return counts;
        } catch (error) {
            console.error('Error fetching student counts:', error);
            return null;
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignmentsResponse, tutorsResponse] = await Promise.all([
                adminAPI.getTutorAssignments(),
                adminAPI.getUsers({ role: 'tutor' })
            ]);

            if (assignmentsResponse.data?.success) {
                setAssignments(assignmentsResponse.data.data || []);
            }
            
            if (tutorsResponse.data?.success) {
                setTutors(tutorsResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleRowExpand = async (assignmentId) => {
        const newExpandedRows = new Set(expandedRows);
        if (expandedRows.has(assignmentId)) {
            newExpandedRows.delete(assignmentId);
        } else {
            newExpandedRows.add(assignmentId);
            if (!students[assignmentId]) {
                try {
                    const response = await adminAPI.getTutorAssignmentStudents(assignmentId);
                    if (response.data?.success) {
                        setStudents(prev => ({
                            ...prev,
                            [assignmentId]: response.data.data?.students || []
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching students:', error);
                    toast.error(error.response?.data?.message || 'Failed to fetch students');
                    newExpandedRows.delete(assignmentId);
                }
            }
        }
        setExpandedRows(newExpandedRows);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.tutorId || selectedDepartments.length === 0 || selectedSemesters.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            // Check if there are students in the selected combinations
            const counts = await fetchStudentCounts(selectedDepartments, selectedSemesters);
            if (!counts) {
                toast.error('Failed to verify student existence');
                return;
            }

            // Check for empty department-semester combinations
            let hasEmptyCombinations = false;
            let emptyCombinations = [];
            selectedDepartments.forEach(dept => {
                selectedSemesters.forEach(sem => {
                    if (counts[`${dept}-${sem}`] === 0) {
                        hasEmptyCombinations = true;
                        emptyCombinations.push(`${dept} Semester ${sem}`);
                    }
                });
            });

            if (hasEmptyCombinations) {
                toast.error(`No students found in: ${emptyCombinations.join(', ')}`);
                return;
            }

            // Create assignments array from selected departments and semesters
            const assignments = [];
            selectedDepartments.forEach(dept => {
                selectedSemesters.forEach(sem => {
                    assignments.push({ department: dept, semester: parseInt(sem) });
                });
            });

            const response = await adminAPI.createTutorAssignment({
                tutorId: formData.tutorId,
                assignments
            });

            if (response.data?.success) {
                toast.success('Assignment created successfully');
                fetchData();
                setFormData({ tutorId: '', assignments: [] });
                setSelectedDepartments([]);
                setSelectedSemesters([]);
                setActiveTab('list');
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
            if (error.response?.data?.message?.includes('already assigned')) {
                toast.error('Some department-semester combinations are already assigned to another tutor');
            } else {
                toast.error(error.response?.data?.message || 'Failed to create assignment');
            }
        }
    };

    const handleDelete = async (assignmentId) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) {
            return;
        }

        try {
            const response = await adminAPI.deleteTutorAssignment(assignmentId);
            if (response.data?.success) {
                toast.success('Assignment deleted successfully');
                setAssignments(prev => prev.filter(a => a._id !== assignmentId));
                setStudents(prev => {
                    const newStudents = { ...prev };
                    delete newStudents[assignmentId];
                    return newStudents;
                });
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            toast.error(error.response?.data?.message || 'Failed to delete assignment');
        }
    };

    const renderStudentCount = (dept, sem) => {
        const count = studentCounts[`${dept}-${sem}`];
        if (count === undefined) return null;
        return (
            <span className={styles.studentCount}>
                ({count} student{count !== 1 ? 's' : ''})
            </span>
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'list' ? styles.active : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    <FaList /> View Assignments
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'create' ? styles.active : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    <FaPlus /> Create Assignment
                </button>
            </div>

            {activeTab === 'create' ? (
                <div className={styles.createSection}>
                    <h2>Create New Tutor Assignment</h2>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Select Tutor:</label>
                            <select
                                value={formData.tutorId}
                                onChange={(e) => setFormData(prev => ({ ...prev, tutorId: e.target.value }))}
                                required
                                className={styles.select}
                            >
                                <option value="">Choose a tutor</option>
                                {Array.isArray(tutors) && tutors.map(tutor => (
                                    <option key={tutor._id} value={tutor._id}>
                                        {tutor.username} ({tutor.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Select Departments:</label>
                                <select
                                    multiple
                                    value={selectedDepartments}
                                    onChange={(e) => setSelectedDepartments(
                                        Array.from(e.target.selectedOptions, option => option.value)
                                    )}
                                    required
                                    className={styles.select}
                                >
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Select Semesters:</label>
                                <select
                                    multiple
                                    value={selectedSemesters}
                                    onChange={(e) => setSelectedSemesters(
                                        Array.from(e.target.selectedOptions, option => option.value)
                                    )}
                                    required
                                    className={styles.select}
                                >
                                    {SEMESTERS.map(sem => (
                                        <option key={sem} value={sem}>
                                            Semester {sem}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.selectedAssignments}>
                            <h3>Selected Assignments:</h3>
                            <div className={styles.assignmentsList}>
                                {selectedDepartments.length > 0 && selectedSemesters.length > 0 ? (
                                    selectedDepartments.map(dept => 
                                        selectedSemesters.map(sem => (
                                            <span key={`${dept}-${sem}`} className={styles.assignmentTag}>
                                                {dept} - Semester {sem} {renderStudentCount(dept, sem)}
                                            </span>
                                        ))
                                    )
                                ) : (
                                    <p className={styles.noSelections}>
                                        No assignments selected. Please choose departments and semesters.
                                    </p>
                                )}
                            </div>
                        </div>

                        <button type="submit" className={styles.submitButton}>
                            Create Assignment
                        </button>
                    </form>
                </div>
            ) : (
                <div className={styles.listSection}>
                    <h2>Current Tutor Assignments</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Expand</th>
                                    <th>Tutor</th>
                                    <th>Assignments</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(assignments) && assignments.length > 0 ? (
                                    assignments.map(assignment => (
                                        <React.Fragment key={assignment._id}>
                                            <tr>
                                                <td>
                                                    <button
                                                        className={styles.expandButton}
                                                        onClick={() => handleRowExpand(assignment._id)}
                                                    >
                                                        {expandedRows.has(assignment._id) ? <FaChevronUp /> : <FaChevronDown />}
                                                    </button>
                                                </td>
                                                <td>{assignment.tutor?.username || 'Unknown'}</td>
                                                <td>
                                                    {Array.isArray(assignment.assignments) ? 
                                                        assignment.assignments.map(a => `${a.department} Sem ${a.semester}`).join(', ') 
                                                        : 'No assignments'}
                                                </td>
                                                <td>
                                                    <button
                                                        className={styles.deleteButton}
                                                        onClick={() => handleDelete(assignment._id)}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRows.has(assignment._id) && (
                                                <tr>
                                                    <td colSpan="4" className={styles.expandedContent}>
                                                        <h4>Assigned Students:</h4>
                                                        {students[assignment._id] ? (
                                                            students[assignment._id].length > 0 ? (
                                                                <table className={styles.studentsTable}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Name</th>
                                                                            <th>Department</th>
                                                                            <th>Semester</th>
                                                                            <th>Admission Number</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {students[assignment._id].map(student => (
                                                                            <tr key={student._id}>
                                                                                <td>{student.name}</td>
                                                                                <td>{student.department}</td>
                                                                                <td>{student.semester}</td>
                                                                                <td>{student.admissionNumber}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <p>No students assigned yet.</p>
                                                            )
                                                        ) : (
                                                            <LoadingSpinner />
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className={styles.noData}>
                                            No assignments found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorAssignments; 