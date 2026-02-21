const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
    console.log("\n=== MongoDB Connection Diagnostic ===\n");
    
    // Step 1: Verify MONGO_URI exists
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        console.error('❌ MONGO_URI is not defined in .env file');
        process.exit(1);
    }
    
    console.log('✓ MONGO_URI found');
    console.log(`✓ Connecting to: ${mongoURI.split('@')[1] || 'MongoDB Atlas'}\n`);

    try {
        console.log("⏳ Attempting to connect to MongoDB...");
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            tls: true,
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('✓ MongoDB Connected Successfully!\n');

        // Test query
        console.log("⏳ Testing database query...");
        const email = "vardhan.sagi1234@gmail.com";
        const user = await User.findOne({ email });

        if (user) {
            console.log("✓ SUCCESS: User Found in DB");
            console.log(`  Email: ${user.email}`);
            console.log(`  Role: ${user.role}\n`);
        } else {
            console.log(`⚠️  No user found with email: ${email}\n`);
        }
        
        console.log("=== All checks passed! ===\n");
        
    } catch (error) {
        console.error('\n❌ CONNECTION FAILED\n');
        console.error('Error Details:', error.message);
        
        // Provide specific guidance based on error type
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Issue: Connection refused');
            console.error('   This usually means the server is not running or wrong port');
        } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
            console.error('\n💡 Issue: Cannot resolve MongoDB host');
            console.error('   Check your internet connection and MONGO_URI format');
        } else if (error.message.includes('authentication failed')) {
            console.error('\n💡 Issue: Authentication failed');
            console.error('   Check your MongoDB username and password');
        } else if (error.message.includes('IP whitelist') || error.message.includes('not whitelisted')) {
            console.error('\n💡 Issue: IP not whitelisted in MongoDB Atlas');
            console.error('   Solution: Add your IP to MongoDB Atlas Network Access');
            console.error('   URL: https://cloud.mongodb.com/v2/network/access');
        } else {
            console.error('\n💡 Possible causes:');
            console.error('   1. IP address not whitelisted in MongoDB Atlas');
            console.error('   2. MongoDB credentials (username/password) incorrect');
            console.error('   3. Network firewall blocking MongoDB connection');
            console.error('   4. MongoDB Atlas cluster is paused or deleted');
        }
        
        console.error('\n🔧 TROUBLESHOOTING STEPS:');
        console.error('   1. Go to: https://cloud.mongodb.com/v2/network/access');
        console.error('   2. Click "+ Add IP Address"');
        console.error('   3. Select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)');
        console.error('   4. Click "Confirm"');
        console.error('   5. Wait 1-2 minutes for changes to propagate');
        console.error('   6. Run this script again\n');
        
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }
};

checkUser();
