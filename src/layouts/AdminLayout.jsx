import React from 'react';
import { FaChartBar, FaUsers, FaUserGraduate, FaHistory, FaBell, FaUserFriends } from 'react-icons/fa';
import DashboardLayout from './DashboardLayout';

const AdminLayout = ({ children }) => {
    const navItems = [
        {
            path: '/admin/dashboard',
            icon: <FaChartBar />,
            label: 'Dashboard'
        },
        {
            path: '/admin/users',
            icon: <FaUsers />,
            label: 'Users'
        },
        {
            path: '/admin/students',
            icon: <FaUserGraduate />,
            label: 'Students'
        },
        {
            path: '/admin/tutor-assignments',
            icon: <FaUserFriends />,
            label: 'Tutor Assignments'
        },
        {
            path: '/admin/logs',
            icon: <FaHistory />,
            label: 'Logs'
        },
        {
            path: '/admin/notifications',
            icon: <FaBell />,
            label: 'Notifications'
        }
    ];

    return (
        <DashboardLayout 
            navItems={navItems}
            logo="SR System"
            logoLink="/admin/dashboard"
        >
                    {children}
        </DashboardLayout>
    );
};

export default AdminLayout;