const mongoose = require('mongoose');

const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`Connection attempt ${i + 1} failed: ${error.message}`);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('Failed to connect to MongoDB after multiple attempts');
                process.exit(1);
            }
        }
    }
};

const connectDB = async () => {
    try {
        await connectWithRetry();

        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
            connectWithRetry();
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });
    } catch (error) {
        console.error(`Error in database connection: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 