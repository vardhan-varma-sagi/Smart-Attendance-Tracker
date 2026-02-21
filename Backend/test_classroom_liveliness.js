const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Classroom = require('./models/Classroom'); // Adjust path as needed

dotenv.config();

const runTest = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const testName = "TEST-LIVELINESS-" + Date.now();

        // 1. Create Classroom
        console.log("Creating test classroom...");
        const classroom = new Classroom({
            name: testName,
            building: "Test Building",
            floor: "1"
        });
        await classroom.save();
        console.log("Classroom created:", classroom._id);

        // 2. Add Reference Images
        console.log("Adding reference images...");
        const images = [
            "data:image/png;base64,dummy1",
            "data:image/png;base64,dummy2",
            "data:image/png;base64,dummy3",
            "data:image/png;base64,dummy4",
            "data:image/png;base64,dummy5",
            "data:image/png;base64,dummy6"
        ];

        classroom.referenceImages = images;
        await classroom.save();
        console.log("Images saved.");

        // 3. Verify Retrieval
        console.log("Verifying retrieval...");
        const fetchedClassroom = await Classroom.findById(classroom._id);
        if (fetchedClassroom.referenceImages.length === 6) {
            console.log("SUCCESS: 6 images found in database.");
        } else {
            console.error(`FAILURE: Expected 6 images, found ${fetchedClassroom.referenceImages.length}`);
        }

        // 4. Cleanup
        console.log("Cleaning up...");
        await Classroom.findByIdAndDelete(classroom._id);
        console.log("Cleanup complete.");

        process.exit(0);

    } catch (error) {
        console.error("Test Failed:", error);
        process.exit(1);
    }
};

runTest();
