import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add any request preprocessing here
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is a network error or 5xx error, and we haven't retried yet
        if ((error.message.includes('Network Error') || (error.response?.status >= 500 && error.response?.status <= 599)) && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Wait for 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry the request
            return api(originalRequest);
        }

        // Handle unauthorized access
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }

        // Format error message
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        error.formattedMessage = errorMessage;

        return Promise.reject(error);
    }
);

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
    getRegistrations: () => api.get('/tutor/registrations'),
    getRegistrationStudents: (registrationId) => api.get(`/tutor/registrations/${registrationId}/students`),
    sendStatusEmail: (studentId) => api.post(`/tutor/registrations/${studentId}/send-status`),
    approveRegistration: (studentId) => api.post(`/tutor/registrations/${studentId}/approve`),
    getTutorAssignments: () => api.get('/tutor/assignments/me'),
    getSemesterRegistrations: () => api.get('/tutor/semester-registrations'),
    createSemesterRegistration: (data) => api.post('/tutor/semester-registrations', data),
    updateSemesterRegistration: (id, data) => api.put(`/tutor/semester-registrations/${id}`, data),
    deleteSemesterRegistration: (id) => api.delete(`/tutor/semester-registrations/${id}`),
    getSemesterRegistrationStats: (id) => api.get(`/tutor/semester-registrations/${id}/statistics`),
    sendSemesterReminders: (id) => api.post(`/tutor/semester-registrations/${id}/reminders`),
    generateReport: (type) => api.get(`/tutor/reports/${type}`, { 
        responseType: 'arraybuffer',
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    })
};

// Admin API calls
export const adminAPI = {
    getDashboardStats: () => api.get('/admin/dashboard/stats'),
    getUsers: (filters = {}) => api.get('/admin/users', { params: filters }),
    createUser: (userData) => api.post('/admin/users', userData),
    updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    getSystemLogs: () => api.get('/admin/logs'),
    getLogs: () => api.get('/admin/logs'),
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (settings) => api.put('/admin/settings', settings),
    // Student management endpoints
    getStudents: (filters = {}) => api.get('/admin/students', { params: filters }),
    createStudent: (studentData) => api.post('/admin/students', studentData),
    updateStudent: (studentId, studentData) => api.put(`/admin/students/${studentId}`, studentData),
    deleteStudent: (studentId) => api.delete(`/admin/students/${studentId}`),
    // Tutor assignment management endpoints
    getTutorAssignments: () => api.get('/admin/tutor-assignments'),
    getTutorAssignmentStudents: (assignmentId) => api.get(`/admin/tutor-assignments/${assignmentId}/students`),
    createTutorAssignment: (assignmentData) => api.post('/admin/tutor-assignments', assignmentData),
    updateTutorAssignment: (assignmentId, assignmentData) => api.put(`/admin/tutor-assignments/${assignmentId}`, assignmentData),
    deleteTutorAssignment: (assignmentId) => api.delete(`/admin/tutor-assignments/${assignmentId}`)
};

// Notification API calls
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    getUnread: () => api.get('/notifications/unread'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    delete: (id) => api.delete(`/notifications/${id}`),
    send: (data) => api.post('/notifications', data)
};