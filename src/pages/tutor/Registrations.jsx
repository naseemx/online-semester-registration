import React, { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaEnvelope, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import { tutorAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import styles from './Registrations.module.css';

const Registrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [sendingEmail, setSendingEmail] = useState(null);
    const [selectedRegistration, setSelectedRegistration] = useState(null);

    const departments = ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Civil'];
    const statuses = ['All Statuses', 'Not Started', 'In Progress', 'Completed', 'Rejected'];

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const response = await tutorAPI.getRegistrations();
            if (response.data.success) {
                const registrationsWithStudents = await Promise.all(
                    response.data.data.map(async (reg) => {
                        const studentsResponse = await tutorAPI.getRegistrationStudents(reg._id);
                        return {
                            ...reg,
                            students: studentsResponse.data.success ? studentsResponse.data.data : []
                        };
                    })
                );
                setRegistrations(registrationsWithStudents);
            } else {
                toast.error(response.data.message || 'Failed to fetch registrations');
            }
        } catch (error) {
            console.error('Fetch registrations error:', error);
            toast.error(error.response?.data?.message || 'Error fetching registrations');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMail = async (studentId, email) => {
        try {
            setSendingEmail(studentId);
            const response = await tutorAPI.sendStatusEmail(studentId);
            if (!response.data.success) {
                throw new Error('Failed to send email');
            }
            toast.success('Status email sent successfully');
        } catch (err) {
            console.error('Error sending email:', err.formattedMessage || err.message);
            toast.error(err.formattedMessage || 'Failed to send email');
        } finally {
            setSendingEmail(null);
        }
    };

    const handleViewStudents = (registration) => {
        setSelectedRegistration(registration);
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = (reg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reg.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reg.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All Statuses' || reg.registrationStatus === statusFilter;
        const matchesDepartment = selectedDepartment === 'All' || reg.department === selectedDepartment;
        
        return matchesSearch && matchesStatus && matchesDepartment;
    });
    
    console.log('Filtered registrations count:', filteredRegistrations.length);

    if (loading && !registrations.length) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinner} />
                <p>Loading registrations...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Student Registrations</h2>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name, ID or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <FaFilter className={styles.filterIcon} />
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className={styles.filterSelect}
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                                </select>
                    </div>
                </div>
                        </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                            <thead>
                                <tr>
                            <th>Student Details</th>
                            <th>Academic Info</th>
                                    <th>Verification Status</th>
                                    <th>Registration Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                        {filteredRegistrations.length === 0 ? (
                            <tr>
                                <td colSpan="5" className={styles.noData}>
                                    No registrations found
                                </td>
                            </tr>
                        ) : (
                            filteredRegistrations.map((reg) => (
                                <tr key={reg._id} className={styles.tableRow}>
                                    <td>
                                        <div className={styles.studentInfo}>
                                            <div className={styles.studentName}>
                                                {reg.name}
                                            </div>
                                            <div className={styles.studentDetails}>
                                                <div className={styles.studentId}>
                                                    ID: {reg.admissionNumber}
                                                </div>
                                                <div className={styles.studentEmail}>
                                                    {reg.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.academicInfo}>
                                            <div className={styles.department}>
                                                {reg.department}
                                            </div>
                                            <div className={styles.semester}>
                                                Semester {reg.semester}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.verificationStatus}>
                                            <div className={styles.statusItem}>
                                                <span className={`${styles.statusIcon} ${reg.libraryStatus === 'clear' ? styles.verified : styles.pending}`}>
                                                    {reg.libraryStatus === 'clear' ? <FaCheckCircle /> : <FaExclamationCircle />}
                                                </span>
                                                <span className={styles.statusLabel}>
                                                    Library: {reg.libraryStatus === 'clear' ? 'Cleared' : 'Pending'}
                                                </span>
                                            </div>
                                            <div className={styles.statusItem}>
                                                <span className={`${styles.statusIcon} ${reg.labStatus === 'clear' ? styles.verified : styles.pending}`}>
                                                    {reg.labStatus === 'clear' ? <FaCheckCircle /> : <FaExclamationCircle />}
                                                </span>
                                                <span className={styles.statusLabel}>
                                                    Lab: {reg.labStatus === 'clear' ? 'Cleared' : 'Pending'}
                                                </span>
                                            </div>
                                            <div className={styles.statusItem}>
                                                <span className={`${styles.statusIcon} ${reg.officeStatus === 'clear' ? styles.verified : styles.pending}`}>
                                                    {reg.officeStatus === 'clear' ? <FaCheckCircle /> : <FaExclamationCircle />}
                                                </span>
                                                <span className={styles.statusLabel}>
                                                    Office: {reg.officeStatus === 'clear' ? 'Cleared' : 'Pending'}
                                                </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                        <span className={`${styles.status} ${styles[reg.registrationStatus?.toLowerCase().replace(' ', '') || 'notstarted']}`}>
                                            {reg.registrationStatus || 'Not Started'}
                                        </span>
                                        </td>
                                        <td>
                                            <button
                                            className={styles.actionButton}
                                            onClick={() => handleSendMail(reg._id, reg.email)}
                                            disabled={sendingEmail === reg._id}
                                            title="Send Status Email"
                                        >
                                            {sendingEmail === reg._id ? (
                                                <FaSpinner className={styles.spinner} />
                                            ) : (
                                                <FaEnvelope />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                            ))
                                )}
                            </tbody>
                        </table>
                    </div>

            <div className={styles.registrationsList}>
                {registrations.map((registration) => (
                    <div key={registration._id} className={styles.registrationCard}>
                        <div className={styles.registrationHeader}>
                            <h3>{registration.department} - Semester {registration.semester}</h3>
                            <span className={styles.status}>{registration.status}</span>
                        </div>
                        <div className={styles.registrationDetails}>
                            <p>Created: {new Date(registration.createdAt).toLocaleDateString()}</p>
                            <p>Deadline: {new Date(registration.deadline).toLocaleDateString()}</p>
                            <p>Students Registered: {registration.students?.length || 0}</p>
                        </div>
                        <button
                            className={styles.viewButton}
                            onClick={() => handleViewStudents(registration)}
                        >
                            View Students
                        </button>
                        {selectedRegistration?._id === registration._id && (
                            <div className={styles.studentsList}>
                                <h4>Registered Students</h4>
                                {registration.students?.length > 0 ? (
                                    <ul>
                                        {registration.students.map((student) => (
                                            <li key={student._id}>
                                                {student.name} ({student.rollNumber})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No students registered yet</p>
                                )}
                            </div>
                        )}
                </div>
                ))}
            </div>
        </div>
    );
};

export default Registrations; 