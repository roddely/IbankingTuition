const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    transactionId: { type: String, required: true },
    otpCode: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Otp', OtpSchema);