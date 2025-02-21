require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Fine = require('../models/Fine');
const TutorAssignment = require('../models/TutorAssignment');
const connectDB = require('../config/db');

// Valid departments
const VALID_DEPARTMENTS = ['CSE', 'ECE', 'CE', 'ME', 'SFE', 'CSCS', 'CSBS', 'AI&DS'];

// Sample data for seeding
const sampleStudents = [
    {
        name: 'John Doe',
        admissionNumber: 'ADM001',
        universityRegisterNumber: 'URN001',
        semester: 4,
        department: 'CSE',
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
        department: 'ECE',
        email: 'jane.smith@example.com',
        libraryStatus: 'fine pending',
        labStatus: 'clear',
        officeStatus: 'fine pending'
    },
    {
        name: 'Alice Johnson',
        admissionNumber: 'ADM003',
        universityRegisterNumber: 'URN003',
        semester: 5,
        department: 'CE',
        email: 'alice.j@example.com',
        libraryStatus: 'clear',
        labStatus: 'clear',
        officeStatus: 'clear'
    },
    {
        name: 'Bob Wilson',
        admissionNumber: 'ADM004',
        universityRegisterNumber: 'URN004',
        semester: 6,
        department: 'ME',
        email: 'bob.w@example.com',
        libraryStatus: 'clear',
        labStatus: 'fine pending',
        officeStatus: 'clear'
    },
    {
        name: 'Emma Davis',
        admissionNumber: 'ADM005',
        universityRegisterNumber: 'URN005',
        semester: 4,
        department: 'SFE',
        email: 'emma.d@example.com',
        libraryStatus: 'clear',
        labStatus: 'clear',
        officeStatus: 'clear'
    },
    {
        name: 'Michael Brown',
        admissionNumber: 'ADM006',
        universityRegisterNumber: 'URN006',
        semester: 3,
        department: 'CSCS',
        email: 'michael.b@example.com',
        libraryStatus: 'clear',
        labStatus: 'clear',
        officeStatus: 'clear'
    },
    {
        name: 'Sarah Miller',
        admissionNumber: 'ADM007',
        universityRegisterNumber: 'URN007',
        semester: 5,
        department: 'CSBS',
        email: 'sarah.m@example.com',
        libraryStatus: 'clear',
        labStatus: 'clear',
        officeStatus: 'clear'
    },
    {
        name: 'David Clark',
        admissionNumber: 'ADM008',
        universityRegisterNumber: 'URN008',
        semester: 4,
        department: 'AI&DS',
        email: 'david.c@example.com',
        libraryStatus: 'clear',
        labStatus: 'clear',
        officeStatus: 'clear'
    }
];

const sampleUsers = [
    // Admin Users
    {
        username: 'admin1',
        password: 'admin123',
        role: 'admin',
        email: 'admin1@example.com'
    },
    {
        username: 'admin2',
        password: 'admin123',
        role: 'admin',
        email: 'admin2@example.com'
    },
    // Tutor Users
    {
        username: 'tutor1',
        password: 'tutor123',
        role: 'tutor',
        email: 'tutor1@example.com'
    },
    {
        username: 'tutor2',
        password: 'tutor123',
        role: 'tutor',
        email: 'tutor2@example.com'
    },
    {
        username: 'tutor3',
        password: 'tutor123',
        role: 'tutor',
        email: 'tutor3@example.com'
    },
    // Staff Users
    {
        username: 'staff1',
        password: 'staff123',
        role: 'staff',
        email: 'staff1@example.com'
    },
    {
        username: 'staff2',
        password: 'staff123',
        role: 'staff',
        email: 'staff2@example.com'
    },
    {
        username: 'staff3',
        password: 'staff123',
        role: 'staff',
        email: 'staff3@example.com'
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
        await TutorAssignment.deleteMany();

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
        const createdUsers = await User.create([...sampleUsers, ...studentUsers]);
        console.log('Sample users created');

        // Find tutor1 and tutor2 users
        const tutor1 = createdUsers.find(user => user.username === 'tutor1');
        const tutor2 = createdUsers.find(user => user.username === 'tutor2');

        // Create tutor assignments
        const sampleTutorAssignments = [
            {
                tutor: tutor1._id,
                assignments: [
                    { department: 'CSE', semester: 4 },  // Matches John Doe
                    { department: 'ME', semester: 6 },   // Matches Bob Wilson
                    { department: 'SFE', semester: 4 }   // Matches Emma Davis
                ]
            },
            {
                tutor: tutor2._id,
                assignments: [
                    { department: 'CSE', semester: 4 },  // Matches John Doe
                    { department: 'ECE', semester: 3 },  // Matches Jane Smith
                    { department: 'CE', semester: 5 }    // Matches Alice Johnson
                ]
            }
        ];

        await TutorAssignment.create(sampleTutorAssignments);
        console.log('Sample tutor assignments created');

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