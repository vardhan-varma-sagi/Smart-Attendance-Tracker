const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        console.log('Testing connection to:', mongoURI);

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✓ MongoDB Connected Successfully');
        process.exit(0);
    } catch (error) {
        console.error('✗ MongoDB Connection Failed:', error.message);
        console.error('Error Code:', error.code);
        console.error('Error Name:', error.name);
        if (error.reason) console.error('Reason:', error.reason);
        process.exit(1);
    }
};

connectDB();
