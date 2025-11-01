const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // người nộp tiền
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true }, // MSSV được nộp
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "otp_sent", "otp_verified", "success", "failed", "expired"], 
    default: "success" 
  },
}, {
  timestamps: { createdAt: 'created_at', completedAt: 'updated_at' } 
});


module.exports = mongoose.model('Transaction', TransactionSchema);