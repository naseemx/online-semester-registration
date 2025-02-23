# Semester Registration System

A MERN stack application for managing semester registration for students with automatic verification status checks and role-based access control.

## Features

- **Role-based Authentication**
  - Student: Apply for semester registration and view verification status
  - Staff: Update student fines/dues
  - Tutor: Issue semester registration and export student lists
  - Admin: Manage all users and student data

- **Real-time Status Updates**
  - Automatic verification status checks
  - 5-second polling for status updates
  - Email notifications on registration completion

- **Fine Management**
  - Track multiple types of fines/dues
  - Unified form for staff to update fine status
  - Automatic verification based on fine status

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Community Server
- Gmail account (for email notifications)
- npm (Node Package Manager)

## Requirements for Running the Project

1. **Node.js**: Ensure you have Node.js installed. You can download it from [Node.js official website](https://nodejs.org/).
2. **MongoDB**: Install MongoDB Community Server from [MongoDB official website](https://www.mongodb.com/try/download/community).
3. **Gmail Account**: Create a Gmail account if you don't have one. You will need to enable "Less secure app access" or use an App Password for Nodemailer.
4. **npm**: npm is included with Node.js, but ensure it's updated by running:
   ```bash
   npm install -g npm
   ```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meme
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the server directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/semester_registration
     SESSION_SECRET=your-secret-key-here
     EMAIL_USER=your-gmail@gmail.com
     EMAIL_PASS=your-gmail-app-password
     NODE_ENV=development
     ```

4. **Seed the database**
   ```bash
   cd server
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Start the server (development mode)
   cd server
   npm run dev

   # Start the client (in a new terminal)
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:5000](http://localhost:5000)

## Default Users

After seeding the database, you can log in with these credentials:

- **Admin**
  - Username: admin
  - Password: admin123

- **Tutor**
  - Username: tutor1
  - Password: tutor123

- **Staff**
  - Username: staff1
  - Password: staff123

- **Student**
  - Username: ADM001
  - Password: student123

## Project Structure

```
meme/
├── client/                # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Different pages/dashboards
│       ├── App.js
│       └── index.js
├── server/                # Express backend
│   ├── controllers/       # Logic for handling routes
│   ├── models/            # Mongoose models
│   ├── routes/            # Express route definitions
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   ├── app.js             # Main Express app
│   └── server.js          # Server startup script
└── README.md              # Project documentation
```

## Technologies Used

- **Frontend**
  - React.js
  - Bootstrap 5
  - Animate.css
  - Axios for API calls

- **Backend**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - Express Session for authentication
  - Nodemailer for email notifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 