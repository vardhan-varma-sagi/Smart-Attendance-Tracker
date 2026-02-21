const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        fs.writeFileSync('ipv4_test.log', `Testing IPv4 connection to: ${mongoURI}\n`);

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            family: 4 // Force IPv4
        });
        fs.appendFileSync('ipv4_test.log', '✓ MongoDB Connected Successfully (IPv4)\n');
        process.exit(0);
    } catch (error) {
        fs.appendFileSync('ipv4_test.log', `✗ MongoDB Connection Failed: ${error.message}\n`);
        process.exit(1);
    }
};

connectDB();
