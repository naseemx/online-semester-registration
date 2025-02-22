import React, { useState, useEffect } from 'react';
import { 
    Card, Table, Button, Select, Tag, Space, Modal, 
    Form, Input, Typography, Divider, message, Tooltip
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    UserOutlined, BookOutlined, NumberOutlined
} from '@ant-design/icons';
import { adminAPI } from '../../utils/api';
import styles from './TutorAssignments.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

const DEPARTMENTS = ['CSE', 'ECE', 'CE', 'ME', 'SFE', 'CSCS', 'CSBS', 'AI&DS'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const TutorAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [form] = Form.useForm();

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
                setAssignments(assignmentsResponse.data.data || []);
            }
            
            if (tutorsResponse.data?.success) {
                setTutors(tutorsResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (assignment) => {
        setEditingAssignment(assignment);
        form.setFieldsValue({
            tutorId: assignment.tutor._id,
            assignments: assignment.assignments.map(a => ({
                department: a.department,
                semester: a.semester
            }))
        });
        setModalVisible(true);
    };

    const handleDelete = async (assignmentId) => {
        try {
            const response = await adminAPI.deleteTutorAssignment(assignmentId);
            if (response.data?.success) {
                message.success('Assignment deleted successfully');
                setAssignments(prev => prev.filter(a => a._id !== assignmentId));
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            message.error('Failed to delete assignment');
        }
    };

    const handleSubmit = async (values) => {
        try {
            let response;
            if (editingAssignment) {
                response = await adminAPI.updateTutorAssignment(editingAssignment._id, values);
            } else {
                response = await adminAPI.createTutorAssignment(values);
            }

            if (response.data?.success) {
                message.success(`Assignment ${editingAssignment ? 'updated' : 'created'} successfully`);
                fetchData();
                setModalVisible(false);
                form.resetFields();
                setEditingAssignment(null);
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            if (error.response?.data?.message?.includes('already assigned')) {
                message.error('Some department-semester combinations are already assigned to another tutor');
            } else {
                message.error('Failed to save assignment');
            }
        }
    };

    const columns = [
        {
            title: 'Tutor',
            dataIndex: ['tutor', 'username'],
            key: 'tutor',
            render: (text, record) => (
                <Space>
                    <UserOutlined />
                    <span>{text}</span>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        ({record.tutor.email})
                    </Text>
                </Space>
            )
        },
        {
            title: 'Assignments',
            dataIndex: 'assignments',
            key: 'assignments',
            render: (assignments) => (
                <Space wrap>
                    {assignments.map((a, index) => (
                        <Tag 
                            key={index} 
                            color="blue"
                            style={{ padding: '4px 8px', borderRadius: '4px' }}
                        >
                            <Space>
                                <BookOutlined />
                                {a.department}
                                <Divider type="vertical" />
                                <NumberOutlined />
                                Sem {a.semester}
                            </Space>
                        </Tag>
                    ))}
                </Space>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit Assignment">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            ghost
                        />
                    </Tooltip>
                    <Tooltip title="Delete Assignment">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => Modal.confirm({
                                title: 'Delete Assignment',
                                content: 'Are you sure you want to delete this assignment?',
                                okText: 'Yes',
                                cancelText: 'No',
                                onOk: () => handleDelete(record._id)
                            })}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <Card>
                <div className={styles.header}>
                    <Title level={2}>Tutor Assignments</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingAssignment(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                    >
                        New Assignment
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={assignments}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} assignments`
                    }}
                />
            </Card>

            <Modal
                title={editingAssignment ? 'Edit Assignment' : 'New Assignment'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingAssignment(null);
                    form.resetFields();
                }}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        name="tutorId"
                        label="Select Tutor"
                        rules={[{ required: true, message: 'Please select a tutor' }]}
                    >
                        <Select
                            placeholder="Choose a tutor"
                            disabled={!!editingAssignment}
                            showSearch
                            optionFilterProp="children"
                        >
                            {tutors.map(tutor => (
                                <Option key={tutor._id} value={tutor._id}>
                                    {tutor.username} ({tutor.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.List
                        name="assignments"
                        rules={[
                            {
                                validator: async (_, assignments) => {
                                    if (!assignments || assignments.length === 0) {
                                        return Promise.reject(new Error('Please add at least one assignment'));
                                    }
                                }
                            }
                        ]}
                    >
                        {(fields, { add, remove }, { errors }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'department']}
                                            rules={[{ required: true, message: 'Missing department' }]}
                                        >
                                            <Select placeholder="Department" style={{ width: 120 }}>
                                                {DEPARTMENTS.map(dept => (
                                                    <Option key={dept} value={dept}>{dept}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'semester']}
                                            rules={[{ required: true, message: 'Missing semester' }]}
                                        >
                                            <Select placeholder="Semester" style={{ width: 120 }}>
                                                {SEMESTERS.map(sem => (
                                                    <Option key={sem} value={sem}>Semester {sem}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Button type="text" danger onClick={() => remove(name)}>
                                            <DeleteOutlined />
                                        </Button>
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        icon={<PlusOutlined />}
                                        style={{ width: '100%' }}
                                    >
                                        Add Department-Semester Combination
                                    </Button>
                                    <Form.ErrorList errors={errors} />
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingAssignment ? 'Update' : 'Create'} Assignment
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                setEditingAssignment(null);
                                form.resetFields();
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TutorAssignments;