const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/lab_equipment_booking';

console.log("Testing MongoDB connection to:", MONGODB_URI);

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("✅ Successfully connected to MongoDB!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Failed to connect to MongoDB:");
        console.error(err.message);
        process.exit(1);
    });
