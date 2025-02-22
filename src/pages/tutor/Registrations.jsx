import React, { useState, useEffect } from 'react';
import { tutorAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import {
    Table,
    Button,
    Tag,
    Input,
    Select,
    Space,
    Drawer,
    Descriptions,
    Typography,
    theme,
    ConfigProvider,
    Card,
    Spin
} from 'antd';
import {
    CheckCircleOutlined,
    MailOutlined,
    SearchOutlined,
    InfoCircleOutlined,
    FilterOutlined
} from '@ant-design/icons';
import styles from './Registrations.module.css';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { useToken } = theme;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

const Registrations = () => {
    const { token } = useToken();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [tutorAssignments, setTutorAssignments] = useState([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        fetchTutorAssignments();
    }, []);

    const fetchTutorAssignments = async () => {
        try {
            setLoading(true);
            const response = await tutorAPI.getTutorAssignments();
            if (response.data?.success) {
                setTutorAssignments(response.data.data?.assignments || []);
                await fetchStudents();
            } else {
                toast.error('Failed to fetch tutor assignments');
            }
        } catch (error) {
            console.error('Error fetching tutor assignments:', error);
            toast.error('Failed to fetch tutor assignments');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await tutorAPI.getRegistrations();
            if (response.data?.success) {
                setStudents(response.data.data || []);
            } else {
                toast.error('Failed to load student data');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (studentId) => {
        try {
            setActionLoading(prev => ({ ...prev, [studentId]: true }));
            const response = await tutorAPI.approveRegistration(studentId);
            if (response.data?.success) {
                toast.success('Registration approved successfully');
                await fetchStudents();
            } else {
                throw new Error(response.data?.message || 'Failed to approve registration');
            }
        } catch (error) {
            console.error('Approve error:', error);
            toast.error(error.response?.data?.message || 'Failed to approve registration');
        } finally {
            setActionLoading(prev => ({ ...prev, [studentId]: false }));
        }
    };

    const handleSendStatus = async (studentId) => {
        try {
            setActionLoading(prev => ({ ...prev, [studentId]: true }));
            const response = await tutorAPI.sendStatusEmail(studentId);
            if (response.data?.success) {
                toast.success('Status email sent successfully');
            } else {
                throw new Error(response.data?.message || 'Failed to send status email');
            }
        } catch (error) {
            console.error('Error sending status email:', error);
            toast.error('Failed to send status email');
        } finally {
            setActionLoading(prev => ({ ...prev, [studentId]: false }));
        }
    };

    const handleShowDetails = (student) => {
        setSelectedStudent(student);
        setDrawerVisible(true);
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'not started': 'default',
            'in progress': 'processing',
            'submitted': 'warning',
            'approved': 'success',
            'rejected': 'error'
        };
        return statusColors[status?.toLowerCase()] || 'default';
    };

    const getFineStatus = (fines) => {
        if (!fines) return { status: 'success', text: 'No Fines' };
        
        const hasPendingFines = Object.values(fines).some(fine => 
            fine.status === 'pending' && fine.amount > 0
        );
        
        return hasPendingFines 
            ? { status: 'error', text: 'Pending Fines' }
            : { status: 'success', text: 'Cleared' };
    };

    // Filter students based on search, department, and semester
    const filteredStudents = students.filter(student => {
        const matchesSearch = searchText.trim() === '' || 
            student.name.toLowerCase().includes(searchText.toLowerCase()) ||
            student.admissionNumber.toLowerCase().includes(searchText.toLowerCase());
            
        const matchesDepartment = selectedDepartment === 'all' || student.department === selectedDepartment;
        const matchesSemester = selectedSemester === 'all' || student.semester.toString() === selectedSemester;
        
        return matchesSearch && matchesDepartment && matchesSemester;
    });

    // Get unique departments and semesters
    const departments = [...new Set(tutorAssignments.map(a => a.department))].filter(Boolean);
    const semesters = [...new Set(tutorAssignments.map(a => a.semester))].filter(Boolean).sort((a, b) => a - b);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Button 
                    type="link" 
                    onClick={() => handleShowDetails(record)}
                    className={styles.nameLink}
                >
                    {text} <InfoCircleOutlined />
                </Button>
            )
        },
        {
            title: 'Admission Number',
            dataIndex: 'admissionNumber',
            key: 'admissionNumber'
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department'
        },
        {
            title: 'Semester',
            dataIndex: 'semester',
            key: 'semester'
        },
        {
            title: 'Registration Status',
            key: 'registrationStatus',
            render: (_, record) => (
                <Tag color={getStatusColor(record.registrationDetails?.status)} className={styles.tag}>
                    {record.registrationDetails?.status?.toUpperCase() || 'NOT STARTED'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        className={styles.actionButton}
                        icon={<MailOutlined />}
                        loading={actionLoading[record._id]}
                        onClick={() => handleSendStatus(record._id)}
                        title="Send Status Email"
                    >
                        Send Status
                    </Button>
                    <Button
                        type="primary"
                        className={styles.actionButton}
                        icon={<CheckCircleOutlined />}
                        loading={actionLoading[record._id]}
                        onClick={() => handleApprove(record._id)}
                        disabled={record.registrationDetails?.status !== 'submitted'}
                        title="Approve Registration"
                    >
                        Approve
                    </Button>
                </Space>
            )
        }
    ];

    const renderDrawerContent = () => {
        if (!selectedStudent) return null;

        const fineStatus = getFineStatus(selectedStudent.fines);

        return (
            <div className={styles.drawerContent}>
                <Descriptions
                    bordered
                    column={1}
                    className={styles.descriptions}
                >
                    <Descriptions.Item label="Name">{selectedStudent.name}</Descriptions.Item>
                    <Descriptions.Item label="Admission Number">{selectedStudent.admissionNumber}</Descriptions.Item>
                    <Descriptions.Item label="Department">{selectedStudent.department}</Descriptions.Item>
                    <Descriptions.Item label="Semester">{selectedStudent.semester}</Descriptions.Item>
                    <Descriptions.Item label="Registration Status">
                        <Tag color={getStatusColor(selectedStudent.registrationDetails?.status)} className={styles.tag}>
                            {selectedStudent.registrationDetails?.status?.toUpperCase() || 'NOT STARTED'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Fine Status">
                        <Tag color={fineStatus.status} className={styles.tag}>
                            {fineStatus.text}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>

                <div className={styles.drawerActions}>
                    <Space size="middle">
                        <Button
                            className={styles.actionButton}
                            icon={<MailOutlined />}
                            loading={actionLoading[selectedStudent._id]}
                            onClick={() => handleSendStatus(selectedStudent._id)}
                        >
                            Send Status
                        </Button>
                        <Button
                            type="primary"
                            className={styles.actionButton}
                            icon={<CheckCircleOutlined />}
                            loading={actionLoading[selectedStudent._id]}
                            onClick={() => handleApprove(selectedStudent._id)}
                            disabled={selectedStudent.registrationDetails?.status !== 'submitted'}
                        >
                            Approve
                        </Button>
                    </Space>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <Card className={styles.header}>
                <Title level={2} className={styles.headerTitle}>
                    Student Details
                </Title>
            </Card>

            <Card className={styles.filterSection}>
                <Space wrap>
                    <Search
                        placeholder="Search by name or admission number"
                        allowClear
                        onChange={e => setSearchText(e.target.value)}
                        className={styles.searchInput}
                        prefix={<SearchOutlined />}
                    />
                    <Select
                        placeholder="Select Department"
                        value={selectedDepartment}
                        onChange={setSelectedDepartment}
                        className={styles.select}
                    >
                        <Option value="all">All Departments</Option>
                        {departments.map(dept => (
                            <Option key={dept} value={dept}>{dept}</Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Select Semester"
                        value={selectedSemester}
                        onChange={setSelectedSemester}
                        className={styles.select}
                    >
                        <Option value="all">All Semesters</Option>
                        {semesters.map(sem => (
                            <Option key={sem} value={sem.toString()}>Semester {sem}</Option>
                        ))}
                    </Select>
                </Space>
            </Card>

            <Card className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={filteredStudents}
                    loading={loading}
                    rowKey="_id"
                    className={styles.table}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`
                    }}
                />
            </Card>

            <Drawer
                title={
                    <Text className={styles.drawerTitle}>
                        Student Details
                    </Text>
                }
                placement="right"
                onClose={() => setDrawerVisible(false)}
                visible={drawerVisible}
                width={480}
                className={styles.drawer}
            >
                {renderDrawerContent()}
            </Drawer>
        </div>
    );
};

export default Registrations; 