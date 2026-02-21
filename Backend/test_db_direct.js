const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const connectDB = async () => {
    try {
        const standardURI = "mongodb://vardhan_db_admin:vardhan_2004@ac-eiqorfe-shard-00-00.ctjcaw0.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority&directConnection=true";

        fs.writeFileSync('direct_test.log', `Testing Direct Connection to: ${standardURI}\n`);

        await mongoose.connect(standardURI, {
            serverSelectionTimeoutMS: 5000
        });
        fs.appendFileSync('direct_test.log', '✓ MongoDB Connected Successfully (Direct)\n');
        process.exit(0);
    } catch (error) {
        fs.appendFileSync('direct_test.log', `✗ MongoDB Connection Failed: ${error.message}\n`);
        process.exit(1);
    }
};

connectDB();
