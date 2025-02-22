const tutorAssignmentRoutes = require('./routes/tutorAssignmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/tutor-assignments', tutorAssignmentRoutes);
app.use('/api/notifications', notificationRoutes); 