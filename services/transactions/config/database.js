const mongoose = require("mongoose");

const connectDB = async () => {
  try {
  await mongoose.connect(process.env.MONGO_URI_TRANSACTION);
    console.log("✅ MongoDB connected:", process.env.MONGO_URI_TRANSACTION);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};


module.exports = connectDB;
