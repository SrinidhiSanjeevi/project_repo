const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    console.error("Tip: Make sure your IP is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0 for anywhere).");
    process.exit(1);
  }
};

module.exports = connectDB;