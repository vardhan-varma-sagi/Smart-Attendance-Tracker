const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const connectDB = async () => {
    try {
        // Construct standard URI from the SRV details
        // cluster0.ctjcaw0.mongodb.net resolves to these shards usually
        // We will try to connect to the primary shard directly
        const standardURI = "mongodb://vardhan_db_admin:vardhan_2004@ac-eiqorfe-shard-00-00.ctjcaw0.mongodb.net:27017,ac-eiqorfe-shard-00-01.ctjcaw0.mongodb.net:27017,ac-eiqorfe-shard-00-02.ctjcaw0.mongodb.net:27017/test?ssl=true&replicaSet=atlas-2xaz9z-shard-0&authSource=admin&retryWrites=true&w=majority";

        fs.writeFileSync('standard_uri_test.log', `Testing Standard URI connection...\n`);

        await mongoose.connect(standardURI, {
            serverSelectionTimeoutMS: 5000
        });
        fs.appendFileSync('standard_uri_test.log', '✓ MongoDB Connected Successfully (Standard URI)\n');
        process.exit(0);
    } catch (error) {
        fs.appendFileSync('standard_uri_test.log', `✗ MongoDB Connection Failed: ${error.message}\n`);
        process.exit(1);
    }
};

connectDB();
