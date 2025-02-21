import axios from './axios';

export const getAllAssignments = async () => {
    try {
        const response = await axios.get('/tutor-assignments');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createAssignment = async (tutorId, assignments) => {
    try {
        const response = await axios.post('/tutor-assignments', {
            tutorId,
            assignments
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateAssignment = async (id, assignments) => {
    try {
        const response = await axios.put(`/tutor-assignments/${id}`, {
            assignments
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteAssignment = async (id) => {
    try {
        const response = await axios.delete(`/tutor-assignments/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAssignmentStudents = async (id) => {
    try {
        const response = await axios.get(`/tutor-assignments/${id}/students`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 