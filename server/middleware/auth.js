// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    console.log('Checking authentication...');
    console.log('Session:', req.session);
    console.log('Session user:', req.session?.user);

    if (!req.session.user) {
        console.log('No user in session - not authenticated');
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    // Attach user object to request
    req.user = {
        _id: req.session.user.id,
        username: req.session.user.username,
        role: req.session.user.role,
        email: req.session.user.email
    };
    console.log('User attached to request:', req.user);
    next();
};

// Middleware to check user role
const hasRole = (roles) => {
    return (req, res, next) => {
        console.log('Checking roles:', roles);
        console.log('User role:', req.user?.role);

        if (!req.session.user) {
            console.log('No user in session - not authenticated');
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        if (!roles.includes(req.session.user.role)) {
            console.log('User role not authorized:', req.session.user.role);
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

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