const nodemailer = require('nodemailer');
const otpModel = require('../models/otpModel');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

const generateOTPCode = () => {
    return Math.floor(Math.random() * 900000 + 100000).toString(); 
}

const sendOTPEmail = async (recipientEmail, otpCode, transactionId) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: recipientEmail,
        subject: `Mã OTP xác nhận giao dịch (${transactionId})`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Xác nhận Giao dịch Thanh toán Học phí</h2>
                <p>Mã OTP của bạn cho giao dịch **${transactionId}** là:</p>
                <h1 style="color: #4CAF50; background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center;">${otpCode}</h1>
                <p>Mã này sẽ hết hạn sau **3 phút**.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${recipientEmail} for TX: ${transactionId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message};
    }
}

// Tạo và gửi OTP
const createdOTP = async (transactionId, recipientEmail) => {
    const otpCode = generateOTPCode();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    const newOTP = new otpModel({
        transactionId,
        otpCode,
        expiresAt,
    });

    await newOTP.save();

    const mailResult = await sendOTPEmail(recipientEmail, otpCode, transactionId);
    if(!mailResult.success) {
        console.warn(`[Warning] OTP created but mail failed to send to ${recipientEmail}`);
    }

    return otpCode;
}

const verifyOTP = async (transactionId, otpCode) => {
    const otpRecord = await otpModel.findOne({
        transactionId,
        otpCode,
        isUsed: false,
        expiresAt: { $gt: new Date() } 
    });

    if (!otpRecord) {
        return { success: false, message: 'Invalid, expired, or used OTP.' };
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    return { success: true, message: 'OTP verified successfully.' };
};

module.exports = {
    createdOTP,
    verifyOTP,
}