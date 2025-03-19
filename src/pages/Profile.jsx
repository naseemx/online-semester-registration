import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
    FaUser, 
    FaEnvelope, 
    FaIdCard, 
    FaUserTag,
    FaCalendarAlt,
    FaArrowLeft,
    FaPhone,
    FaMapMarkerAlt,
    FaUserCircle
} from 'react-icons/fa';
import styles from './Profile.module.css';

const InfoCard = ({ icon: Icon, label, value }) => {
    return (
        <motion.div 
            className={styles.infoCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.infoIcon}>
                <Icon />
            </div>
            <div className={styles.infoContent}>
                <span className={styles.infoLabel}>{label}</span>
                <span className={styles.infoValue}>{value || 'Not provided'}</span>
            </div>
        </motion.div>
    );
};

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    const getRoleLabel = (role) => {
        const labels = {
            student: 'Student',
            staff: 'Staff Member',
            tutor: 'Tutor',
            admin: 'Administrator'
        };
        return labels[role] || role;
    };

    return (
        <div className={styles.container}>
            <motion.button 
                className={styles.backButton}
                onClick={handleBack}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <FaArrowLeft />
                <span>Back</span>
            </motion.button>

            <div className={styles.profileWrapper}>
                <div className={styles.profileSidebar}>
                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>
                            <FaUserCircle />
                </div>
                        <h1 className={styles.userName}>{user?.name}</h1>
                        <span className={styles.userRole}>{getRoleLabel(user?.role)}</span>
                        <span className={styles.userEmail}>{user?.email}</span>
                    </div>
                </div>

                <div className={styles.profileContent}>
                    <div className={styles.contentSection}>
                        <h2 className={styles.sectionTitle}>Personal Information</h2>
                        <div className={styles.infoGrid}>
                            <InfoCard 
                                icon={FaIdCard}
                                label="Username"
                                value={user?.username}
                            />
                            <InfoCard 
                                icon={FaEnvelope}
                                label="Email"
                                value={user?.email}
                            />
                            <InfoCard 
                                icon={FaUserTag}
                                label="Role"
                                value={getRoleLabel(user?.role)}
                            />
                            <InfoCard 
                                icon={FaPhone}
                                label="Phone"
                                value={user?.phone}
                            />
                            {user?.role === 'student' && (
                                <>
                                    <InfoCard 
                                        icon={FaIdCard}
                                        label="Admission Number"
                                        value={user?.admissionNumber}
                                    />
                                    <InfoCard 
                                        icon={FaCalendarAlt}
                                        label="Batch"
                                        value={user?.batch}
                                    />
                                    <InfoCard 
                                        icon={FaUserTag}
                                        label="Department"
                                        value={user?.department}
                                    />
                                    <InfoCard 
                                        icon={FaMapMarkerAlt}
                                        label="Address"
                                        value={user?.address}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 