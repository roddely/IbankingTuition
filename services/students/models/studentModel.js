const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, required: true }, // MSSV
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, unique: true, required: true },

  // Học phí
  tuitionFee: { type: Number, required: true },  // Tổng số tiền phải đóng
  // Số dư hiện tại
  balance: { type: Number, default: 0 },
  // Trạng thái học phí
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Student', StudentSchema);
