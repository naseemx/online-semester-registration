import React, { useState, useEffect } from 'react';
import { FaPlus, FaBell, FaEdit, FaChartBar, FaCalendarAlt, FaTrash, FaExclamationCircle, FaUserGraduate, FaSpinner } from 'react-icons/fa';
import { tutorAPI } from '../../utils/api';
import styles from './SemesterRegistration.module.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import 'animate.css';

const SemesterRegistration = () => {
    const [registrations, setRegistrations] = useState([]);
    const [tutorAssignments, setTutorAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        department: '',
        semester: '',
        deadline: new Date().toISOString().split('T')[0]
    });
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [registrationStats, setRegistrationStats] = useState({});
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState({
        department: '',
        semester: '',
        deadline: ''
    });
    const [statistics, setStatistics] = useState({});
    const [sendingReminders, setSendingReminders] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                await fetchRegistrations();
                await fetchTutorAssignments();
                setLoading(false);
            } catch (error) {
                setError('Failed to load initial data');
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching registrations...');
            const response = await tutorAPI.getSemesterRegistrations();
            
            if (response.data.success) {
                const registrationsData = response.data.data;
                console.log('Received registrations:', registrationsData);
                setRegistrations(registrationsData);
                
                // Fetch statistics for each registration
                for (const reg of registrationsData) {
                    console.log(`Fetching statistics for registration ${reg._id}:`, {
                        department: reg.department,
                        semester: reg.semester,
                        studentCount: reg.students?.length
                    });
                    
                    try {
                        const statsResponse = await tutorAPI.getSemesterRegistrationStats(reg._id);
                        console.log(`Statistics response for ${reg._id}:`, statsResponse.data);
                        
                        if (statsResponse.data.success) {
                            const stats = statsResponse.data.data;
                            console.log(`Setting statistics for ${reg._id}:`, stats);
                            
                            setStatistics(prev => {
                                const newStats = {
                                    ...prev,
                                    [reg._id]: {
                                        pending: stats.pending || 0,
                                        submitted: stats.submitted || 0,
                                        approved: stats.approved || 0,
                                        total: stats.totalStudents || reg.students?.length || 0
                                    }
                                };
                                console.log('Updated statistics state:', newStats);
                                return newStats;
                            });
                        }
                    } catch (err) {
                        console.error(`Error fetching statistics for registration ${reg._id}:`, err);
                        console.log('Using fallback statistics from registration data');
                        
                        const fallbackStats = {
                            pending: reg.students?.filter(s => s.status === 'pending').length || 0,
                            submitted: reg.students?.filter(s => s.status === 'submitted').length || 0,
                            approved: reg.students?.filter(s => s.status === 'approved').length || 0,
                            total: reg.students?.length || 0
                        };
                        
                        console.log(`Fallback statistics for ${reg._id}:`, fallbackStats);
                        setStatistics(prev => ({
                            ...prev,
                            [reg._id]: fallbackStats
                        }));
                    }
                }
            } else {
                throw new Error(response.data.message || 'Failed to fetch registrations');
            }
        } catch (err) {
            console.error('Fetch registrations error:', err);
            setError('Failed to load registrations. Please try again.');
            toast.error('Failed to load registrations');
        } finally {
            setLoading(false);
        }
    };

    const fetchTutorAssignments = async () => {
        try {
            const response = await tutorAPI.getTutorAssignments();
            if (response.data.success) {
                setTutorAssignments(response.data.data.assignments || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch assignments');
            }
        } catch (err) {
            console.error('Fetch assignments error:', err);
            toast.error('Failed to load tutor assignments');
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form data
            if (!formData.department || !formData.semester || !formData.deadline) {
                throw new Error('Please fill in all required fields');
            }

            // Format data for submission
            const submissionData = {
                department: formData.department,
                semester: parseInt(formData.semester, 10),
                deadline: new Date(formData.deadline).toISOString()
            };

            console.log('Submitting form data:', submissionData);
            const response = await tutorAPI.createSemesterRegistration(submissionData);
            
            if (response.data.success) {
                toast.success('New semester registration created successfully!');
                setShowCreateForm(false);
                fetchRegistrations();
            }
        } catch (error) {
            console.error('Create registration error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create registration';
            console.log('Error message:', errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this registration?')) {
            try {
                const response = await tutorAPI.deleteSemesterRegistration(id);
                if (response.data.success) {
                    toast.success('Registration deleted successfully');
                    fetchRegistrations();
                }
            } catch (error) {
                console.error('Delete registration error:', error);
                toast.error('Failed to delete registration');
            }
        }
    };

    const handleUpdateRegistration = async (id, data) => {
        try {
            const response = await tutorAPI.updateSemesterRegistration(id, data);
            if (response.data.success) {
                toast.success('Registration updated successfully');
                setShowEditForm(false);
                fetchRegistrations();
            }
        } catch (error) {
            console.error('Update registration error:', error);
            toast.error('Failed to update registration');
        }
    };

    const handleSendReminders = async (registrationId) => {
        try {
            setSendingReminders(registrationId);
            const response = await tutorAPI.sendSemesterReminders(registrationId);
            if (response.data.success) {
                toast.success('Email reminders sent successfully to all pending students!');
                // Refresh statistics after sending reminders
                fetchStatistics(registrationId);
            }
        } catch (error) {
            console.error('Send reminders error:', error);
            toast.error('Failed to send reminders. Please try again.');
        } finally {
            setSendingReminders(null);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'department') {
            setFormData({
                ...formData,
                department: value,
                semester: '' // Reset semester when department changes
            });
        } else if (name === 'semester') {
            setFormData({
                ...formData,
                semester: parseInt(value, 10) // Ensure semester is a number
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleEdit = (registration) => {
        setEditFormData({
            department: registration.department,
            semester: registration.semester,
            deadline: new Date(registration.deadline).toISOString().split('T')[0]
        });
        setSelectedRegistration(registration);
        setShowEditForm(true);
    };

    const handleEditFormChange = (e) => {
        if (e.target.name === 'department') {
            setEditFormData({
                ...editFormData,
                department: e.target.value,
                semester: '' // Reset semester when department changes
            });
        } else {
            setEditFormData({
                ...editFormData,
                [e.target.name]: e.target.value
            });
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await tutorAPI.updateSemesterRegistration(selectedRegistration._id, editFormData);
            if (response.data.success) {
                toast.success('Registration updated successfully');
                setShowEditForm(false);
                setSelectedRegistration(null);
                fetchRegistrations(); // Refresh the list
            } else {
                throw new Error(response.data.message || 'Failed to update registration');
            }
        } catch (err) {
            console.error('Update registration error:', err);
            toast.error(err.message || 'Failed to update registration');
        }
    };

    const fetchStatistics = async (id) => {
        try {
            console.log('\n=== Fetching Statistics ===');
            console.log(`Fetching statistics for registration ${id}`);
            
            const registration = registrations.find(reg => reg._id === id);
            if (!registration) {
                console.log(`Registration ${id} not found in state`);
                return;
            }

            console.log('Current registration data:', {
                id: registration._id,
                department: registration.department,
                semester: registration.semester,
                rawStudentCount: registration.students?.length || 0,
                students: registration.students?.map(s => ({
                    id: s.student?._id,
                    status: s.status
                }))
            });

            const response = await tutorAPI.getSemesterRegistrationStats(id);
            console.log('Raw API Response:', response);
            console.log('Statistics response data:', response.data);

            if (response.data.success) {
                const stats = response.data.data;
                console.log('Received statistics:', stats);
                
                // Ensure we have all required fields with fallbacks
                const processedStats = {
                    pending: stats.pending ?? 0,
                    submitted: stats.submitted ?? 0,
                    approved: stats.approved ?? 0,
                    total: stats.totalStudents ?? registration.students?.length ?? 0
                };
                
                console.log('Processed statistics:', processedStats);
                
                setStatistics(prev => {
                    const newStats = {
                        ...prev,
                        [id]: processedStats
                    };
                    console.log('New statistics state:', newStats);
                    return newStats;
                });
            } else {
                throw new Error(response.data.message || 'Failed to fetch statistics');
            }
        } catch (err) {
            console.error('Fetch statistics error:', err);
            
            // Fallback to registration data
            const registration = registrations.find(reg => reg._id === id);
            if (registration) {
                console.log('Using fallback statistics from registration data');
                const fallbackStats = {
                    pending: registration.students?.filter(s => s.status === 'pending')?.length ?? 0,
                    submitted: registration.students?.filter(s => s.status === 'submitted')?.length ?? 0,
                    approved: registration.students?.filter(s => s.status === 'approved')?.length ?? 0,
                    total: registration.students?.length ?? 0
                };
                
                console.log('Fallback statistics:', fallbackStats);
                setStatistics(prev => ({
                    ...prev,
                    [id]: fallbackStats
                }));
            }
            toast.error('Failed to load statistics');
        }
        console.log('=== End Fetching Statistics ===\n');
    };

    // Add new function to get assigned semesters for a department
    const getAssignedSemesters = (department) => {
        const assignment = tutorAssignments.find(a => a.department === department);
        return assignment ? [assignment.semester] : [];
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <FaExclamationCircle />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>
                    <FaCalendarAlt />
                    Semester Registration Management
                </h2>
                <button
                    className={styles.createButton}
                    onClick={() => setShowCreateForm(true)}
                >
                    <FaPlus />
                    New Registration
                </button>
            </div>

            {showCreateForm && (
                <div className={styles.formCard}>
                    <h3>Create New Registration</h3>
                    <form onSubmit={handleCreateSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="">Select Department</option>
                                {tutorAssignments.map(assignment => (
                                    <option key={assignment.department} value={assignment.department}>
                                        {assignment.department}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Semester</label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleFormChange}
                                required
                                disabled={!formData.department}
                            >
                                <option value="">Select Semester</option>
                                {formData.department && getAssignedSemesters(formData.department).map(sem => (
                                    <option key={sem} value={sem}>
                                        Semester {sem}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Registration Deadline</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleFormChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => setShowCreateForm(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className={styles.submitButton}>
                                Create Registration
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showEditForm && (
                <div className={styles.formCard}>
                    <h3>Edit Registration</h3>
                    <form onSubmit={handleEditSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Department</label>
                            <select
                                name="department"
                                value={editFormData.department}
                                onChange={handleEditFormChange}
                                required
                            >
                                <option value="">Select Department</option>
                                {tutorAssignments.map(assignment => (
                                    <option key={assignment.department} value={assignment.department}>
                                        {assignment.department}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Semester</label>
                            <select
                                name="semester"
                                value={editFormData.semester}
                                onChange={handleEditFormChange}
                                required
                                disabled={!editFormData.department}
                            >
                                <option value="">Select Semester</option>
                                {editFormData.department && getAssignedSemesters(editFormData.department).map(sem => (
                                    <option key={sem} value={sem}>
                                        Semester {sem}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Deadline</label>
                            <input
                                type="date"
                                name="deadline"
                                value={editFormData.deadline}
                                onChange={handleEditFormChange}
                                required
                            />
                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => {
                                    setShowEditForm(false);
                                    setSelectedRegistration(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className={styles.submitButton}>
                                Update Registration
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showCreateForm && (
                <div className={styles.registrationsList}>
                    {registrations.length === 0 ? (
                        <div className={styles.empty}>
                            <FaCalendarAlt />
                            <p>No registrations found. Create a new one to get started.</p>
                        </div>
                    ) : (
                        registrations.map(registration => (
                            <div key={registration._id} className={styles.registrationCard}>
                                <div className={styles.registrationHeader}>
                                    <div className={styles.registrationTitle}>
                                        <h3>{registration.department} - Semester {registration.semester}</h3>
                                        <span className={`${styles.status} ${styles[registration.status]}`}>
                                            {registration.status}
                                        </span>
                                    </div>
                                    <div className={styles.registrationActions}>
                                        <button
                                            onClick={() => handleEdit(registration)}
                                            className={`${styles.actionButton} ${styles.editButton}`}
                                            title="Edit Registration"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(registration._id)}
                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                            title="Delete Registration"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.registrationInfo}>
                                    <div className={styles.infoItem}>
                                        <FaCalendarAlt />
                                        <p>Deadline: {new Date(registration.deadline).toLocaleDateString()}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <FaUserGraduate />
                                        <p>Total Students: {statistics[registration._id]?.total || registration.students?.length || 0}</p>
                                    </div>
                                </div>

                                <div className={styles.statistics}>
                                    <div className={styles.statItem}>
                                        <strong>{statistics[registration._id]?.total || registration.students?.length || 0}</strong>
                                        <span>Total Students</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <strong>{statistics[registration._id]?.pending || 0}</strong>
                                        <span>Pending</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <strong>{statistics[registration._id]?.submitted || 0}</strong>
                                        <span>Submitted</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <strong>{statistics[registration._id]?.approved || 0}</strong>
                                        <span>Approved</span>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <button
                                        onClick={() => handleSendReminders(registration._id)}
                                        className={styles.actionButton}
                                        disabled={sendingReminders === registration._id}
                                        title="Send Reminders"
                                    >
                                        {sendingReminders === registration._id ? (
                                            <div className={styles.spinnerContainer}>
                                                <FaSpinner className={`${styles.spinner} animate__animated animate__rotateIn`} />
                                                <span className={styles.buttonText}>Sending...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <FaBell className="animate__animated animate__bounceIn" />
                                                <span className={styles.buttonText}>Send Reminders</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => fetchStatistics(registration._id)}
                                        className={styles.actionButton}
                                        title="Refresh Statistics"
                                    >
                                        <FaChartBar className="animate__animated animate__bounceIn" />
                                        <span className={styles.buttonText}>Refresh Stats</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SemesterRegistration; 