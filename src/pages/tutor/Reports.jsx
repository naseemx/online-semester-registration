import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tutorAPI } from '../../utils/api';
import { 
    FaDownload, 
    FaSpinner, 
    FaCheckCircle, 
    FaExclamationCircle,
    FaFileExcel,
    FaUserGraduate,
    FaHourglassHalf,
    FaMoneyBill
} from 'react-icons/fa';
import styles from './Reports.module.css';

const ReportCard = ({ title, description, type, icon: Icon, color, downloading, onDownload }) => {
    return (
        <motion.div 
            className={styles.reportCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`${styles.reportIcon} ${styles[color]}`}>
                <Icon size={24} />
            </div>
            <div className={styles.reportContent}>
                <h3 className={styles.reportTitle}>{title}</h3>
                <p className={styles.reportDescription}>{description}</p>
                <motion.button
                    className={`${styles.downloadButton} ${styles[color]}`}
                    onClick={() => onDownload(type)}
                    disabled={downloading === type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {downloading === type ? (
                        <>
                            <FaSpinner className={styles.spinner} />
                            <span>Downloading...</span>
                        </>
                    ) : (
                        <>
                            <FaDownload />
                            <span>Download Report</span>
                        </>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
};

const Reports = () => {
    const [downloading, setDownloading] = useState(null);
    const [error, setError] = useState('');

    const handleDownload = async (type) => {
        try {
            setDownloading(type);
            setError('');

            const response = await tutorAPI.generateReport(type);
            
            // Create a blob from the response data
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_report.xlsx`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download error:', err);
            setError('Error downloading report');
        } finally {
            setDownloading(null);
        }
    };

    const reports = [
        {
            title: 'Completed Registrations',
            description: 'List of students who have completed their semester registration',
            type: 'completed',
            icon: FaUserGraduate,
            color: 'success'
        },
        {
            title: 'Pending Registrations',
            description: 'List of students with pending or incomplete registrations',
            type: 'pending',
            icon: FaHourglassHalf,
            color: 'warning'
        },
        {
            title: 'Pending Fines Report',
            description: 'List of students with pending fines and dues',
            type: 'fines',
            icon: FaMoneyBill,
            color: 'danger'
        }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Generate Reports</h1>
                <p className={styles.subtitle}>Download detailed reports in Excel format</p>
            </header>

            <AnimatePresence>
                    {error && (
                    <motion.div 
                        className={styles.error}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <FaExclamationCircle />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.reportsGrid}>
                {reports.map((report) => (
                    <ReportCard
                        key={report.type}
                        {...report}
                        downloading={downloading}
                        onDownload={handleDownload}
                    />
                ))}
                        </div>

            <div className={styles.infoSection}>
                <h2 className={styles.infoTitle}>
                    <FaFileExcel />
                    <span>Report Information</span>
                </h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <h3>Completed Registrations Report</h3>
                        <p>Contains details of students who have successfully completed their semester registration, including verification statuses and registration date.</p>
                                </div>
                    <div className={styles.infoCard}>
                        <h3>Pending Registrations Report</h3>
                        <p>Lists students with incomplete registrations, including their current verification status and any pending requirements.</p>
                    </div>
                    <div className={styles.infoCard}>
                        <h3>Pending Fines Report</h3>
                        <p>Provides information about students with outstanding fines or dues, including the amount and category of each fine.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports; 