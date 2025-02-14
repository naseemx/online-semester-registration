import { useState } from 'react';
import { tutorAPI } from '../../utils/api';
import { FaEnvelope, FaSpinner } from 'react-icons/fa';
import 'animate.css';

const SemesterEmail = () => {
    const [formData, setFormData] = useState({
        semester: '',
        lastDate: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [notification, setNotification] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSending(true);
            const response = await tutorAPI.sendSemesterEmail(formData);
            
            setNotification({
                type: 'success',
                message: response.data.message
            });
            
            // Reset form
            setFormData({
                semester: '',
                lastDate: '',
                message: ''
            });
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Error sending emails'
            });
        } finally {
            setSending(false);
            // Clear notification after 5 seconds
            setTimeout(() => setNotification(null), 5000);
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow animate__animated animate__fadeIn">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">
                        <FaEnvelope className="me-2" />
                        Send Semester Registration Email
                    </h4>
                </div>
                <div className="card-body">
                    {notification && (
                        <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} animate__animated animate__fadeIn`}>
                            {notification.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Semester</label>
                            <select
                                className="form-select"
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Semester</option>
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                                <option value="3">Semester 3</option>
                                <option value="4">Semester 4</option>
                                <option value="5">Semester 5</option>
                                <option value="6">Semester 6</option>
                                <option value="7">Semester 7</option>
                                <option value="8">Semester 8</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Last Date for Registration</label>
                            <input
                                type="date"
                                className="form-control"
                                name="lastDate"
                                value={formData.lastDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Message</label>
                            <textarea
                                className="form-control"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Enter the message to be sent to students..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={sending}
                        >
                            {sending ? (
                                <>
                                    <FaSpinner className="me-2 spin" />
                                    Sending Emails...
                                </>
                            ) : (
                                <>
                                    <FaEnvelope className="me-2" />
                                    Send Emails
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-4">
                        <h5>Email Information</h5>
                        <div className="alert alert-info">
                            <p className="mb-2">The email will include:</p>
                            <ul className="mb-0">
                                <li>Student's name and personalized greeting</li>
                                <li>Your custom message</li>
                                <li>Semester information</li>
                                <li>Last date for registration</li>
                                <li>Instructions to access the registration portal</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SemesterEmail; 