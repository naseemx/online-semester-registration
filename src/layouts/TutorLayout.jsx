import React from 'react';
import { FaGraduationCap, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';
import DashboardLayout from './DashboardLayout';

const TutorLayout = ({ children }) => {
    const navItems = [
        {
            path: '/tutor/registrations',
            icon: <FaGraduationCap />,
            label: 'Student Details'
        },
        {
            path: '/tutor/semester-registration',
            icon: <FaCalendarAlt />,
            label: 'Semester Registration'
        },
        {
            path: '/tutor/reports',
            icon: <FaFileAlt />,
            label: 'Reports'
        }
    ];

    return (
        <DashboardLayout 
            navItems={navItems}
            logo="SR System"
            logoLink="/tutor/registrations"
        >
            {children}
        </DashboardLayout>
    );
};

export default TutorLayout; 