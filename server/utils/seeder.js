require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Fine = require('../models/Fine');
const connectDB = require('../config/db');

// Sample data for seeding
const sampleStudents = [
    {
        name: 'John Doe',
        admissionNumber: 'ADM001',
        universityRegisterNumber: 'URN001',
        semester: 4,
        department: 'Computer Science',
        email: 'john.doe@example.com',
        libraryStatus: 'clear',
        labStatus: 'clear',
        officeStatus: 'clear'
    },
    {
        name: 'Jane Smith',
        admissionNumber: 'ADM002',
        universityRegisterNumber: 'URN002',
        semester: 3,
        department: 'Electrical Engineering',
        email: 'jane.smith@example.com',
        libraryStatus: 'fine pending',
        labStatus: 'clear',
        officeStatus: 'fine pending'
    },
    // Add more sample students here...
];

const sampleUsers = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        email: 'admin@example.com'
    },
    {
        username: 'tutor1',
        password: 'tutor123',
        role: 'tutor',
        email: 'tutor@example.com'
    },
    {
        username: 'staff1',
        password: 'staff123',
        role: 'staff',
        email: 'staff@example.com'
    }
];

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Student.deleteMany();
        await Fine.deleteMany();

        console.log('Existing data cleared');

        // Create students
        const createdStudents = await Student.create(sampleStudents);
        console.log('Sample students created');

        // Create student users
        const studentUsers = createdStudents.map(student => ({
            username: student.admissionNumber,
            password: 'student123',
            role: 'student',
            email: student.email,
            studentProfile: student._id
        }));

        // Create all users
        await User.create([...sampleUsers, ...studentUsers]);
        console.log('Sample users created');

        // Create fines for students
        const sampleFines = createdStudents.map(student => ({
            student: student._id,
            tuition: {
                amount: Math.floor(Math.random() * 1000),
                status: Math.random() > 0.5 ? 'paid' : 'pending'
            },
            transportation: {
                amount: Math.floor(Math.random() * 200),
                status: Math.random() > 0.5 ? 'paid' : 'pending'
            },
            hostelFees: {
                amount: Math.floor(Math.random() * 500),
                status: Math.random() > 0.5 ? 'paid' : 'pending'
            },
            labFines: {
                amount: Math.floor(Math.random() * 100),
                status: Math.random() > 0.5 ? 'paid' : 'pending'
            },
            libraryFines: {
                amount: Math.floor(Math.random() * 50),
                status: Math.random() > 0.5 ? 'paid' : 'pending'
            }
        }));

        await Fine.create(sampleFines);
        console.log('Sample fines created');

        console.log('Database seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 