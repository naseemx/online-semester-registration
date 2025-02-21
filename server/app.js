const tutorAssignmentRoutes = require('./routes/tutorAssignmentRoutes');

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/tutor-assignments', tutorAssignmentRoutes); 