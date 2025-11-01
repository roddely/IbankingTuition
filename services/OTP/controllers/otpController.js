const otpService = require('../services/otpService');

const createOTP = async (req, res) => {
    const { transactionId, recipientEmail } = req.body;

    if (!transactionId || !recipientEmail) return res.status(400).json({ message: "Missing transactionId or recipientEmail!"}); 

    try {
        const otpCode = await otpService.createdOTP(transactionId, recipientEmail);
        res.status(200).json({ 
            success: true,
            message: 'OTP generated and sent to email successfully.',
            // Thêm otpCode_DEV_ONLY chỉ để dễ debug
            otpCode_DEV_ONLY: otpCode 
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error while processing OTP generation.' });
    }
}

const verifyOTP = async (req, res) => {
    const { transactionId, otpCode} = req.body;
    if ( !transactionId || !otpCode) return res.status(400).json({ message: "Missing transactionId or otpCode!"});

    try {
        const result = await otpService.verifyOTP(transactionId, otpCode);

        if (result.success) {
            res.status(200).json( result );
        } else {
            res.status(401).json( result );
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error during verification.' });
    }
}

module.exports = {
    createOTP,
    verifyOTP,
}