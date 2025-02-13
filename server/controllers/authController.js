const User = require('../models/User');

// Login controller
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username })
            .select('+password')
            .populate('studentProfile');
            
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password (plain text comparison as per requirements)
        if (password !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create session
        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
            studentProfile: user.role === 'student' ? user.studentProfile?._id : undefined
        };

        // Send response
        res.json({
            success: true,
            user: {
                username: user.username,
                role: user.role,
                email: user.email,
                studentProfile: user.role === 'student' ? user.studentProfile?._id : undefined
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
};

// Logout controller
const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error logging out'
                });
            }
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during logout'
        });
    }
};

// Get current user status
const getStatus = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const user = await User.findById(req.session.user.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                username: user.username,
                role: user.role,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while checking status'
        });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        // Find user
        const user = await User.findById(req.session.user.id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        if (currentPassword !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update email
        user.email = email;

        // Update password if provided
        if (newPassword) {
            user.password = newPassword;
        }

        await user.save();

        // Update session
        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role,
            email: user.email
        };

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

module.exports = {
    login,
    logout,
    getStatus,
    updateProfile
}; 