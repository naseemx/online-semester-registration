// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
    // Attach user object to request
    req.user = req.session.user;
    next();
};

// Middleware to check user role
const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        if (!roles.includes(req.session.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Attach user object to request
        req.user = req.session.user;
        next();
    };
};

// Middleware to check if user is a student and owns the resource
const isOwnStudent = async (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    if (req.session.user.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized'
        });
    }

    // Check if the requested resource belongs to the authenticated student
    const requestedStudentId = req.params.studentId || req.body.studentId;
    if (requestedStudentId && requestedStudentId !== req.session.user.studentProfile) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this resource'
        });
    }

    next();
};

module.exports = {
    isAuthenticated,
    hasRole,
    isOwnStudent
}; 