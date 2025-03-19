import React from 'react';
import { FaClipboardList, FaCheckCircle, FaUserGraduate } from 'react-icons/fa';
import DashboardLayout from './DashboardLayout';

const StudentLayout = ({ children }) => {
    const navItems = [
        {
            path: '/student/registration',
            icon: <FaClipboardList />,
            label: 'Registration'
        },
        {
            path: '/student/status',
            icon: <FaCheckCircle />,
            label: 'Status'
        },
        {
            path: '/profile',
            icon: <FaUserGraduate />,
            label: 'Profile'
        }
    ];

    return (
        <DashboardLayout 
            navItems={navItems}
            logo="SR System"
            logoLink="/student/registration"
        >
            {children}
        </DashboardLayout>
    );
};

export default StudentLayout; 