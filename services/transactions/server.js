const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const transactionRoute = require("./routes/transactionRoute");
const connectDB = require("./config/database");
const connectLockDB = require("./config/lockDatabase");

const app = express();

// ================= Middleware =================
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// ================= DB Connect & Server Start =================
connectDB();
connectLockDB();

const PORT = process.env.TRANSACTION_PORT || 5004;
app.listen(PORT, () => {
  console.log(`🚀 Transaction service running on port: ${PORT}`);
});

// ================= Routes =================

app.use('/', transactionRoute);

// ================= 404 Handler =================
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// ================= Error Handler =================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});



