const mongoose = require('mongoose');

// Schema for Distributed Lock
const LockSchema = new mongoose.Schema({
  // _id sẽ đóng vai trò là tên khóa (ví dụ: 'global_transaction_lock').
  // Vì _id là duy nhất, chỉ có thể có 1 document với _id này tồn tại.
  _id: { type: String, required: true },

  // expiresAt là trường quan trọng cho cơ chế TTL (Time-To-Live).
  // MongoDB sẽ tự động xóa document này sau thời gian expires.
  expiresAt: {
    type: Date,
    required: true,
    // Khai báo index TTL. Tham số 'expires: 0' là cú pháp của Mongoose 
    // để chỉ định đây là trường TTL.
    index: { expires: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Lock', LockSchema);
