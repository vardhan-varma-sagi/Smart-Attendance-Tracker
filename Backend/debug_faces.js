const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const debugFaces = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const users = await User.find({ role: 'student' });
        console.log(`Found ${users.length} students.`);

        users.forEach(user => {
            console.log(`\nStudent: ${user.name} (${user.email})`);
            console.log(`Face Images Count: ${user.faceImages ? user.faceImages.length : 0}`);
            if (user.faceImages && user.faceImages.length > 0) {
                user.faceImages.forEach((img, idx) => {
                    if (img) {
                        const isBase64 = img.startsWith('data:image');
                        const length = img.length;
                        console.log(`  Image ${idx + 1}: Length=${length}, IsDataURI=${isBase64}, Prefix=${img.substring(0, 30)}...`);
                    } else {
                        console.log(`  Image ${idx + 1}: NULL/UNDEFINED`);
                    }
                });
            }
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugFaces();
