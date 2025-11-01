const mongoose = require("mongoose");
const connectLockDB = async () => {
  try {
  await mongoose.createConnection(process.env.MONGO_URI_TRANSACTION_LOCK);
    console.log("✅ MongoDB connected:", process.env.MONGO_URI_TRANSACTION_LOCK);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectLockDB;