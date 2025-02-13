import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Authentication API calls
export const authAPI = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    logout: () => api.post('/auth/logout'),
    checkStatus: () => api.get('/auth/status')
};

// Student API calls
export const studentAPI = {
    getStatus: () => api.get('/student/status'),
    applyRegistration: () => api.post('/student/registration/apply'),
    getVerificationStatus: () => api.get('/student/verification-status')
};

// Staff API calls
export const staffAPI = {
    updateFines: (studentId, fines) => api.put(`/staff/fines/${studentId}`, fines),
    getStudentFines: (studentId) => api.get(`/staff/fines/${studentId}`),
    getAllStudentFines: () => api.get('/staff/fines')
};

// Tutor API calls
export const tutorAPI = {
    getRegistrations: (status) => api.get('/tutor/registrations', { params: { status } }),
    approveRegistration: (studentId) => api.post(`/tutor/registrations/${studentId}/approve`),
    generateReport: (type) => api.get(`/tutor/reports/${type}`)
};

// Admin API calls
export const adminAPI = {
    getDashboardStats: () => api.get('/admin/dashboard/stats'),
    getUsers: () => api.get('/admin/users'),
    createUser: (userData) => api.post('/admin/users', userData),
    updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    getStudents: () => api.get('/admin/students'),
    createStudent: (studentData) => api.post('/admin/students', studentData),
    updateStudent: (studentId, studentData) => api.put(`/admin/students/${studentId}`, studentData),
    deleteStudent: (studentId) => api.delete(`/admin/students/${studentId}`),
    
    // Settings endpoints
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (settings) => api.put('/admin/settings', settings),
    
    // Log endpoints
    getLogs: (params) => api.get('/admin/logs', { params }),
    clearLogs: (before) => api.delete('/admin/logs', { params: { before } }),
    exportLogs: (params) => api.get('/admin/logs/export', { params }),
    
    // Notification endpoints
    getNotifications: (status) => api.get(`/admin/notifications${status ? `?status=${status}` : ''}`),
    sendNotification: (data) => api.post('/admin/notifications', data),
    markNotificationAsRead: (id) => api.put(`/admin/notifications/${id}/read`),
    deleteNotification: (id) => api.delete(`/admin/notifications/${id}`)
};

// Error handler interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 