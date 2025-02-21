import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import Students from '../pages/admin/Students';
import Settings from '../pages/admin/Settings';
import Logs from '../pages/admin/Logs';
import Notifications from '../pages/admin/Notifications';
import TutorAssignments from '../pages/admin/TutorAssignments';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/students" element={<Students />} />
            <Route path="/tutor-assignments" element={<TutorAssignments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/notifications" element={<Notifications />} />
        </Routes>
    );
};

export default AdminRoutes; 