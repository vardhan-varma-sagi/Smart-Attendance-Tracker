const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        fs.writeFileSync('error.log', `Testing connection to: ${mongoURI}\n`);

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000
        });
        fs.appendFileSync('error.log', '✓ MongoDB Connected Successfully\n');
        process.exit(0);
    } catch (error) {
        fs.appendFileSync('error.log', `✗ MongoDB Connection Failed: ${error.message}\n`);
        fs.appendFileSync('error.log', `Error Name: ${error.name}\n`);
        fs.appendFileSync('error.log', `Error Code: ${error.code}\n`);
        if (error.reason) fs.appendFileSync('error.log', `Reason: ${JSON.stringify(error.reason, null, 2)}\n`);
        process.exit(1);
    }
};

connectDB();
