import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    useTheme,
    Tooltip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Numbers as NumbersIcon
} from '@mui/icons-material';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const DEPARTMENTS = ['CSE', 'ECE', 'CE', 'ME', 'SFE', 'CSCS', 'CSBS', 'AI&DS'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const TutorAssignments = () => {
    const theme = useTheme();
    const [assignments, setAssignments] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [formData, setFormData] = useState({
        tutorId: '',
        assignments: [{ department: '', semester: '' }]
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignmentsResponse, tutorsResponse] = await Promise.all([
                adminAPI.getTutorAssignments(),
                adminAPI.getUsers({ role: 'tutor' })
            ]);

            if (assignmentsResponse.data?.success) {
                setAssignments(assignmentsResponse.data.data || []);
            }
            
            if (tutorsResponse.data?.success) {
                setTutors(tutorsResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (assignment) => {
        setEditingAssignment(assignment);
        setFormData({
            tutorId: assignment.tutor._id,
            assignments: assignment.assignments.map(a => ({
                department: a.department,
                semester: a.semester
            }))
        });
        setDialogOpen(true);
    };

    const handleDelete = async (assignmentId) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        
        try {
            const response = await adminAPI.deleteTutorAssignment(assignmentId);
            if (response.data?.success) {
                toast.success('Assignment deleted successfully');
                setAssignments(prev => prev.filter(a => a._id !== assignmentId));
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            toast.error('Failed to delete assignment');
        }
    };

    const handleSubmit = async () => {
        try {
            let response;
            if (editingAssignment) {
                response = await adminAPI.updateTutorAssignment(editingAssignment._id, formData);
            } else {
                response = await adminAPI.createTutorAssignment(formData);
            }

            if (response.data?.success) {
                toast.success(`Assignment ${editingAssignment ? 'updated' : 'created'} successfully`);
                fetchData();
                handleCloseDialog();
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            if (error.response?.data?.message?.includes('already assigned')) {
                toast.error('Some department-semester combinations are already assigned to another tutor');
            } else {
                toast.error('Failed to save assignment');
            }
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingAssignment(null);
        setFormData({
            tutorId: '',
            assignments: [{ department: '', semester: '' }]
        });
    };

    const addAssignment = () => {
        setFormData(prev => ({
            ...prev,
            assignments: [...prev.assignments, { department: '', semester: '' }]
        }));
    };

    const removeAssignment = (index) => {
        setFormData(prev => ({
            ...prev,
            assignments: prev.assignments.filter((_, i) => i !== index)
        }));
    };

    const handleAssignmentChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            assignments: prev.assignments.map((a, i) => 
                i === index ? { ...a, [field]: value } : a
            )
        }));
    };

    return (
        <Box sx={{ p: 3, minHeight: '100vh' }}>
            <Paper 
                elevation={2} 
                sx={{ 
                    p: 3,
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h1">
                        Tutor Assignments
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                    >
                        New Assignment
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tutor</TableCell>
                                    <TableCell>Assignments</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assignments
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((assignment) => (
                                    <TableRow key={assignment._id}>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <PersonIcon />
                                                <Box>
                                                    <Typography>{assignment.tutor.username}</Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {assignment.tutor.email}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {assignment.assignments.map((a, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={`${a.department} - Sem ${a.semester}`}
                                                        color="primary"
                                                        variant="outlined"
                                                        icon={<SchoolIcon />}
                                                    />
                                                ))}
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton 
                                                    onClick={() => handleEdit(assignment)}
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    onClick={() => handleDelete(assignment._id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={assignments.length}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </TableContainer>
                )}
            </Paper>

            <Dialog 
                open={dialogOpen} 
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editingAssignment ? 'Edit Assignment' : 'New Assignment'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Select Tutor</InputLabel>
                            <Select
                                value={formData.tutorId}
                                onChange={(e) => setFormData(prev => ({ ...prev, tutorId: e.target.value }))}
                                disabled={!!editingAssignment}
                                label="Select Tutor"
                            >
                                {tutors.map(tutor => (
                                    <MenuItem key={tutor._id} value={tutor._id}>
                                        {tutor.username} ({tutor.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {formData.assignments.map((assignment, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                <FormControl sx={{ flex: 1 }}>
                                    <InputLabel>Department</InputLabel>
                                    <Select
                                        value={assignment.department}
                                        onChange={(e) => handleAssignmentChange(index, 'department', e.target.value)}
                                        label="Department"
                                    >
                                        {DEPARTMENTS.map(dept => (
                                            <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ flex: 1 }}>
                                    <InputLabel>Semester</InputLabel>
                                    <Select
                                        value={assignment.semester}
                                        onChange={(e) => handleAssignmentChange(index, 'semester', e.target.value)}
                                        label="Semester"
                                    >
                                        {SEMESTERS.map(sem => (
                                            <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {formData.assignments.length > 1 && (
                                    <IconButton 
                                        onClick={() => removeAssignment(index)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </Box>
                        ))}

                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addAssignment}
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            Add Department-Semester Combination
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={!formData.tutorId || formData.assignments.some(a => !a.department || !a.semester)}
                    >
                        {editingAssignment ? 'Update' : 'Create'} Assignment
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TutorAssignments; 