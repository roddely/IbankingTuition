const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true }, // đã mã hóa
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  balance: { type: Number, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('User', UserSchema);