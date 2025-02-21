import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authAPI.getCurrentUser();
            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (err) {
            console.error('Auth check error:', err);
            setError('Failed to check authentication status');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authAPI.login(credentials);
            if (response.data.success) {
                setUser(response.data.data);
                return { success: true };
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed');
            return { success: false, error: err.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);
            await authAPI.logout();
            setUser(null);
            return { success: true };
        } catch (err) {
            console.error('Logout error:', err);
            setError('Failed to logout');
            return { success: false, error: 'Failed to logout' };
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authAPI.updateProfile(data);
            if (response.data.success) {
                setUser(prev => ({ ...prev, ...response.data.data }));
                return { success: true };
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
            return { success: false, error: err.response?.data?.message || 'Failed to update profile' };
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (data) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authAPI.changePassword(data);
            return { success: true };
        } catch (err) {
            console.error('Password change error:', err);
            setError(err.response?.data?.message || 'Failed to change password');
            return { success: false, error: err.response?.data?.message || 'Failed to change password' };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        updateProfile,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 