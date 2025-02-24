import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaMoneyBill, 
    FaChartLine, 
    FaCalendarAlt, 
    FaExclamationCircle,
    FaCheckCircle,
    FaClock,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';
import { staffAPI } from '../../utils/api';
import styles from './StudentFinesDashboard.module.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

const StatCard = ({ title, value, icon: Icon, trend, isAmount }) => {
    const formattedValue = isAmount ? formatCurrency(value) : value;
    return (
        <motion.div 
            className={styles.statCard}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.statIcon}>
                <Icon />
            </div>
            <div className={styles.statInfo}>
                <h3>{title}</h3>
                <p className={styles.statValue}>{formattedValue}</p>
                {trend && (
                    <div className={`${styles.trend} ${trend > 0 ? styles.positive : styles.negative}`}>
                        {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const FINE_CATEGORIES = {
    tuition: {
        label: 'Tuition Fee',
        order: 1,
        icon: FaMoneyBill
    },
    hostelFees: {
        label: 'Hostel Fee',
        order: 2,
        icon: FaMoneyBill
    },
    transportation: {
        label: 'Transportation Fee',
        order: 3,
        icon: FaMoneyBill
    },
    labFines: {
        label: 'Lab Fine',
        order: 4,
        icon: FaMoneyBill
    },
    libraryFines: {
        label: 'Library Fine',
        order: 5,
        icon: FaMoneyBill
    }
};

const FineBreakdownChart = ({ fineData }) => {
    // Filter out non-fine fields and only keep valid fine categories
    const validFineData = Object.entries(fineData)
        .filter(([category]) => FINE_CATEGORIES[category])
        .reduce((acc, [category, data]) => ({
            ...acc,
            [category]: {
                ...data,
                category,
                label: FINE_CATEGORIES[category].label,
                order: FINE_CATEGORIES[category].order
            }
        }), {});

    const totalFines = Object.values(validFineData)
        .reduce((sum, fine) => sum + (fine?.amount || 0), 0);

    // Sort fines by amount in descending order
    const sortedFines = Object.values(validFineData)
        .sort((a, b) => (b?.amount || 0) - (a?.amount || 0));
    
    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3>Fine Breakdown</h3>
                <div className={styles.chartLegend}>
                    <div className={styles.legendItem}>
                        <div className={`${styles.legendDot} ${styles.paid}`}></div>
                        <span>Paid</span>
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.legendDot} ${styles.pending}`}></div>
                        <span>Pending</span>
                    </div>
                </div>
            </div>
            <div className={styles.chart}>
                {sortedFines.map((data) => {
                    const percentage = totalFines > 0 ? ((data?.amount || 0) / totalFines) * 100 : 0;
                    return (
                        <motion.div 
                            key={data.category}
                            className={styles.chartBar}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '100%', opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className={styles.barHeader}>
                                <div className={styles.barLabel}>
                                    <span className={styles.categoryLabel}>{data.label}</span>
                                    <span className={styles.categoryAmount}>{formatCurrency(data?.amount || 0)}</span>
                                </div>
                                <div className={styles.percentageLabel}>
                                    {percentage.toFixed(1)}%
                                </div>
                            </div>
                            <div className={styles.barWrapper}>
                                <motion.div 
                                    className={`${styles.barFill} ${data?.status === 'paid' ? styles.paid : styles.pending}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.7, delay: 0.2 }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            <div className={styles.chartFooter}>
                <div className={styles.totalFines}>
                    <span>Total Fines:</span>
                    <span className={styles.totalAmount}>{formatCurrency(totalFines)}</span>
                </div>
            </div>
        </div>
    );
};

const StudentFinesDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalFines: 0,
        pendingFines: 0,
        paidFines: 0,
        studentCount: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await staffAPI.getAllStudentFines();
            const studentsData = response.data.data;
            
            // Calculate dashboard statistics
            const statistics = studentsData.reduce((acc, student) => {
                const fines = Object.values(student).filter(fine => 
                    typeof fine === 'object' && fine?.amount
                );
                
                const totalAmount = fines.reduce((sum, fine) => sum + fine.amount, 0);
                const pendingAmount = fines
                    .filter(fine => fine.status === 'pending')
                    .reduce((sum, fine) => sum + fine.amount, 0);
                const paidAmount = totalAmount - pendingAmount;

                return {
                    totalFines: acc.totalFines + totalAmount,
                    pendingFines: acc.pendingFines + pendingAmount,
                    paidFines: acc.paidFines + paidAmount,
                    studentCount: acc.studentCount + 1
                };
            }, {
                totalFines: 0,
                pendingFines: 0,
                paidFines: 0,
                studentCount: 0
            });

            setStats(statistics);
            setStudents(studentsData);
        } catch (err) {
            setError('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <motion.div
                    animate={{
                        rotate: 360
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <FaClock size={40} />
                </motion.div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <FaExclamationCircle size={40} />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <header className={styles.dashboardHeader}>
                <h1>Student Fines Dashboard</h1>
                <p>Overview of all student fines and payments</p>
            </header>

            <div className={styles.statsGrid}>
                <StatCard 
                    title="Total Fines"
                    value={stats.totalFines}
                    icon={FaMoneyBill}
                    isAmount={true}
                />
                <StatCard 
                    title="Pending Fines"
                    value={stats.pendingFines}
                    icon={FaClock}
                    trend={10}
                    isAmount={true}
                />
                <StatCard 
                    title="Collected Fines"
                    value={stats.paidFines}
                    icon={FaCheckCircle}
                    trend={-5}
                    isAmount={true}
                />
                <StatCard 
                    title="Students with Fines"
                    value={stats.studentCount}
                    icon={FaChartLine}
                />
            </div>

            <div className={styles.dashboardContent}>
                <div className={styles.chartSection}>
                    <FineBreakdownChart 
                        fineData={students[0] || {}}
                    />
                </div>

                <div className={styles.recentActivity}>
                    <h3>Recent Fine Activities</h3>
                    <div className={styles.activityList}>
                        <AnimatePresence>
                            {students.slice(0, 5).map((student, index) => (
                                <motion.div 
                                    key={student.student._id}
                                    className={styles.activityItem}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className={styles.activityInfo}>
                                        <h4>{student.student.name}</h4>
                                        <p>{student.student.admissionNumber}</p>
                                    </div>
                                    <div className={styles.activityAmount}>
                                        {formatCurrency(
                                            Object.values(student)
                                                .filter(fine => typeof fine === 'object' && fine?.amount)
                                                .reduce((sum, fine) => sum + fine.amount, 0)
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentFinesDashboard; 