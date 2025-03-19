import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaEdit, FaTrash, FaPlus, FaSchool, FaChevronDown, FaChevronUp, FaGraduationCap, FaEnvelope, FaIdCard, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import styles from './TutorAssignments.module.css';

const DEPARTMENTS = ['CSE', 'ECE', 'CE', 'ME', 'SFE', 'CSCS', 'CSBS', 'AI&DS'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const STUDENTS_PER_PAGE = 6;

const TutorAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [formData, setFormData] = useState({
        tutorId: '',
        assignments: [{ department: '', semester: '' }]
    });
    const [expandedTutors, setExpandedTutors] = useState(new Set());
    const [studentDetails, setStudentDetails] = useState({});
    const [studentPages, setStudentPages] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignmentsResponse, tutorsResponse] = await Promise.all([
                adminAPI.getTutorAssignments(),
                adminAPI.getUsers({ role: 'tutor' })
            ]);

            if (assignmentsResponse.data?.success) {
                const assignmentsData = assignmentsResponse.data.data || [];
                setAssignments(assignmentsData);

                // Fetch student details for each assignment
                const studentDetailsPromises = assignmentsData.map(async (assignment) => {
                    try {
                        const response = await adminAPI.getTutorAssignmentStudents(assignment._id);
                        if (response.data?.success) {
                            return { [assignment._id]: response.data.data.students };
                        }
                        return { [assignment._id]: [] };
                    } catch (error) {
                        console.error('Error fetching students for assignment:', error);
                        return { [assignment._id]: [] };
                    }
                });

                const studentDetailsResults = await Promise.all(studentDetailsPromises);
                const combinedStudentDetails = studentDetailsResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
                setStudentDetails(combinedStudentDetails);
            }
            
            if (tutorsResponse.data?.success) {
                setTutors(tutorsResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (assignment) => {
        setEditingAssignment(assignment);
        setFormData({
            tutorId: assignment.tutor._id,
            assignments: assignment.assignments.map(a => ({
                department: a.department,
                semester: a.semester
            }))
        });
        setDialogOpen(true);
    };

    const handleDelete = async (assignmentId) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        
        try {
            const response = await adminAPI.deleteTutorAssignment(assignmentId);
            if (response.data?.success) {
                toast.success('Assignment deleted successfully');
                setAssignments(prev => prev.filter(a => a._id !== assignmentId));
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            toast.error('Failed to delete assignment');
        }
    };

    const handleSubmit = async () => {
        try {
            let response;
            if (editingAssignment) {
                response = await adminAPI.updateTutorAssignment(editingAssignment._id, formData);
            } else {
                response = await adminAPI.createTutorAssignment(formData);
            }

            if (response.data?.success) {
                toast.success(`Assignment ${editingAssignment ? 'updated' : 'created'} successfully`);
                fetchData();
                handleCloseDialog();
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            if (error.response?.data?.message?.includes('already assigned')) {
                toast.error('Some department-semester combinations are already assigned to another tutor');
            } else {
                toast.error('Failed to save assignment');
            }
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingAssignment(null);
        setFormData({
            tutorId: '',
            assignments: [{ department: '', semester: '' }]
        });
    };

    const addAssignment = () => {
        setFormData(prev => ({
            ...prev,
            assignments: [...prev.assignments, { department: '', semester: '' }]
        }));
    };

    const removeAssignment = (index) => {
        setFormData(prev => ({
            ...prev,
            assignments: prev.assignments.filter((_, i) => i !== index)
        }));
    };

    const handleAssignmentChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            assignments: prev.assignments.map((a, i) => 
                i === index ? { ...a, [field]: value } : a
            )
        }));
    };

    const toggleTutorExpansion = (tutorId) => {
        setExpandedTutors(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tutorId)) {
                newSet.delete(tutorId);
            } else {
                newSet.add(tutorId);
            }
            return newSet;
        });
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>
                        <FaUserGraduate />
                        Tutor Assignments
                    </h1>
                    <p className={styles.subtitle}>Manage tutor assignments and view student details</p>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => setDialogOpen(true)}
                >
                    <FaPlus />
                    New Assignment
                </button>
            </div>

            <div className={styles.tutorGrid}>
                {assignments.map((assignment) => (
                    <div key={assignment._id} className={styles.tutorCard}>
                        <div className={styles.tutorHeader}>
                            <div className={styles.tutorInfo}>
                                <div className={styles.tutorAvatar}>
                                    {getInitials(assignment.tutor.username)}
                                </div>
                                <div className={styles.tutorDetails}>
                                    <h3>{assignment.tutor.username}</h3>
                                    <div className={styles.tutorEmail}>
                                        <FaEnvelope /> {assignment.tutor.email}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.tutorActions}>
                                <button
                                    className={styles.actionButton}
                                    onClick={() => handleEdit(assignment)}
                                    title="Edit Assignment"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    className={`${styles.actionButton} ${styles.delete}`}
                                    onClick={() => handleDelete(assignment._id)}
                                    title="Delete Assignment"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>

                        <div className={styles.assignmentSection}>
                            <h4 className={styles.sectionTitle}>
                                <FaSchool /> Assigned Classes
                            </h4>
                            <div className={styles.assignments}>
                                {assignment.assignments.map((a, index) => (
                                    <div key={index} className={styles.assignmentChip}>
                                        <FaGraduationCap />
                                        {a.department} - Semester {a.semester}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.studentsSection}>
                            <div className={styles.studentsHeader}>
                                <h4 className={styles.sectionTitle}>
                                    <FaUserGraduate /> Student Details
                                </h4>
                                <button
                                    className={styles.expandButton}
                                    onClick={() => toggleTutorExpansion(assignment._id)}
                                >
                                    {expandedTutors.has(assignment._id) ? <FaChevronUp /> : <FaChevronDown />}
                                    {expandedTutors.has(assignment._id) ? 'Hide' : 'Show'} Students
                                </button>
                            </div>

                            {expandedTutors.has(assignment._id) && (
                                <div className={styles.studentsList}>
                                    {assignment.assignments.map((a) => {
                                        const students = studentDetails[assignment._id]?.filter(
                                            student => student.department === a.department && student.semester === a.semester
                                        ) || [];

                                        const pageKey = `${assignment._id}-${a.department}-${a.semester}`;
                                        const currentPage = studentPages[pageKey] || 1;
                                        const totalPages = Math.ceil(students.length / STUDENTS_PER_PAGE);
                                        const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
                                        const paginatedStudents = students.slice(startIndex, startIndex + STUDENTS_PER_PAGE);

                                        const handlePageChange = (newPage) => {
                                            setStudentPages(prev => ({
                                                ...prev,
                                                [pageKey]: newPage
                                            }));
                                        };

                                        return students.length > 0 ? (
                                            <div key={`${a.department}-${a.semester}`} className={styles.studentGroup}>
                                                <div className={styles.groupHeader}>
                                                    <div className={styles.groupTitle}>
                                                        {a.department} - Semester {a.semester}
                                                        <span className={styles.studentCount}>
                                                            {students.length} student{students.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    {totalPages > 1 && (
                                                        <div className={styles.pagination}>
                                                            <button
                                                                className={styles.pageButton}
                                                                onClick={() => handlePageChange(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                            >
                                                                <FaChevronLeft />
                                                            </button>
                                                            <span className={styles.pageInfo}>
                                                                Page {currentPage} of {totalPages}
                                                            </span>
                                                            <button
                                                                className={styles.pageButton}
                                                                onClick={() => handlePageChange(currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                            >
                                                                <FaChevronRight />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.studentCards}>
                                                    {paginatedStudents.map((student) => (
                                                        <div key={student._id} className={styles.studentCard}>
                                                            <div className={styles.studentAvatar}>
                                                                {getInitials(student.name)}
                                                            </div>
                                                            <div className={styles.studentInfo}>
                                                                <h4>{student.name}</h4>
                                                                <div className={styles.studentDetails}>
                                                                    <div className={styles.studentDetail}>
                                                                        <FaIdCard /> 
                                                                        <span className={styles.detailText}>
                                                                            {student.admissionNumber}
                                                                        </span>
                                                                    </div>
                                                                    <div className={styles.studentDetail}>
                                                                        <FaEnvelope />
                                                                        <span className={styles.detailText}>
                                                                            {student.email}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={`${a.department}-${a.semester}`} className={styles.noStudents}>
                                                No students found for {a.department} - Semester {a.semester}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {dialogOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {editingAssignment ? 'Edit Assignment' : 'New Assignment'}
                            </h2>
                            <button className={styles.closeButton} onClick={handleCloseDialog}>
                                ×
                            </button>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Select Tutor</label>
                            <select
                                className={styles.formSelect}
                                value={formData.tutorId}
                                onChange={(e) => setFormData(prev => ({ ...prev, tutorId: e.target.value }))}
                                disabled={!!editingAssignment}
                            >
                                <option value="">Select a tutor</option>
                                {tutors.map(tutor => (
                                    <option key={tutor._id} value={tutor._id}>
                                        {tutor.username} ({tutor.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formData.assignments.map((assignment, index) => (
                            <div key={index} className={styles.formGroup}>
                                <div className={styles.formLabel}>Department-Semester Combination {index + 1}</div>
                                <div className={styles.formRow}>
                                    <select
                                        className={styles.formSelect}
                                        value={assignment.department}
                                        onChange={(e) => handleAssignmentChange(index, 'department', e.target.value)}
                                    >
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    <select
                                        className={styles.formSelect}
                                        value={assignment.semester}
                                        onChange={(e) => handleAssignmentChange(index, 'semester', e.target.value)}
                                    >
                                        <option value="">Select Semester</option>
                                        {SEMESTERS.map(sem => (
                                            <option key={sem} value={sem}>Semester {sem}</option>
                                        ))}
                                    </select>
                                    {formData.assignments.length > 1 && (
                                        <button
                                            className={`${styles.actionButton} ${styles.delete}`}
                                            onClick={() => removeAssignment(index)}
                                            title="Remove Combination"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            className={styles.addCombinationButton}
                            onClick={addAssignment}
                        >
                            <FaPlus /> Add Another Combination
                        </button>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelButton} onClick={handleCloseDialog}>
                                Cancel
                            </button>
                            <button
                                className={styles.submitButton}
                                onClick={handleSubmit}
                                disabled={!formData.tutorId || formData.assignments.some(a => !a.department || !a.semester)}
                            >
                                {editingAssignment ? 'Update' : 'Create'} Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorAssignments; 