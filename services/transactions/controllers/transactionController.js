const transactionService = require("../services/transactionService");
const mongoose = require("mongoose");
const Lock = require("../models/lockModel");

const LOCK_ID = "global_transaction_lock";
const LOCK_TTL_SECONDS = 10;

const processTransaction = async (req, res) => {
    try {
        const { userId, studentId, amount } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log("Invalid userId");
            return res.status(400).json({ message: "Invalid userId" });
        }
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            console.log("Invalid studentId");
            return res.status(400).json({ message: "Invalid studentId" });
        }
        const result = await transactionService.processTransaction(userId, studentId, amount);
        return res.status(200).json(result);

    } catch (error) {
        console.log("Error processing transaction:", error);
        return res.status(400).json({ message: error.message });
    }
}

const transaction = async (req, res) => {
    try {
        try {
            const expiresAt = new Date(Date.now() + LOCK_TTL_SECONDS * 1000);

            // THAO TÁC NGUYÊN TỬ: Cố gắng tạo một document khóa.
            // Nếu document với cùng _id đã tồn tại (khóa đang được giữ), 
            // MongoDB sẽ ném lỗi E11000 (duplicate key error).
            await Lock.create({
                _id: LOCK_ID,
                expiresAt: expiresAt
            });

            lockAcquired = true;
            console.log("Distributed lock acquired.");

        } catch (error) {const transactionService = require("../services/transactionService");
        const mongoose = require("mongoose");
        const Lock = require("../models/lockModel");
        
        const LOCK_ID = "global_transaction_lock";
        const LOCK_TTL_SECONDS = 10;
        
        const processTransaction = async (req, res) => {
            try {
                const { userId, studentId, amount } = req.body;
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    console.log("Invalid userId");
                    return res.status(400).json({ message: "Invalid userId" });
                }
                if (!mongoose.Types.ObjectId.isValid(studentId)) {
                    console.log("Invalid studentId");
                    return res.status(400).json({ message: "Invalid studentId" });
                }
                const result = await transactionService.processTransaction(userId, studentId, amount);
                return res.status(200).json(result);
        
            } catch (error) {
                console.log("Error processing transaction:", error);
                return res.status(400).json({ message: error.message });
            }
        }
        
        const transaction = async (req, res) => {
            try {
        
                try {
                    const expiresAt = new Date(Date.now() + LOCK_TTL_SECONDS * 1000);
        
                    // THAO TÁC NGUYÊN TỬ: Cố gắng tạo một document khóa.
                    // Nếu document với cùng _id đã tồn tại (khóa đang được giữ), 
                    // MongoDB sẽ ném lỗi E11000 (duplicate key error).
                    await Lock.create({
                        _id: LOCK_ID,
                        expiresAt: expiresAt
                    });
        
                    lockAcquired = true;
                    console.log("Distributed lock acquired.");
        
                } catch (error) {
                    // Lỗi E11000: Khóa đang được giữ bởi instance khác
                    if (error.code === 11000) {
                        console.log("Lock is held by another instance. Aborting transaction.");
                        // Trả về lỗi 429 (Too Many Requests)
                        return res.status(429).json({
                            message: "Another transaction is currently being processed. Please try again shortly."
                        });
                    }
                    // Ném lại các lỗi khác
                    throw error;
                }
        
                const { userId, studentId, amount } = req.body;
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    console.log("Invalid userId");
                    return res.status(400).json({ message: "Invalid userId" });
                }
                if (!mongoose.Types.ObjectId.isValid(studentId)) {
                    console.log("Invalid studentId");
                    return res.status(400).json({ message: "Invalid studentId" });
                }
                const saveResult = await transactionService.saveTransaction(userId, studentId, amount);
                // console.log("Transaction saved:", result);
                const processResult = await transactionService.processTransaction(userId, studentId, amount);
                const finalResult = {
                    saveResult,
                    processResult
                }
                return res.status(200).json(finalResult);
            } catch (error) {
                return res.status(400).json({ message: error.message });
            } finally {
                if (lockAcquired) {
                    // Xóa document khóa để giải phóng khóa cho instance khác
                    await Lock.deleteOne({ _id: LOCK_ID });
                    console.log("Distributed lock released.");
                }
            }
        };
        
        const getTransactionByUserId = async (req, res) => {
            try {
                const transactionHistory = await transactionService.getTransactionByUserId(req.params.userId);
                if (!transactionHistory) {
                    return res.status(404).json({ message: "Transaction history not found!" });
                }
                return res.status(200).json(transactionHistory);
            } catch (error) {
                return res.status(400).json({ message: error.message });
            }
        };
        
        module.exports = { transaction, processTransaction, getTransactionByUserId };
            // Lỗi E11000: Khóa đang được giữ bởi instance khác
            if (error.code === 11000) {
                console.log("Lock is held by another instance. Aborting transaction.");
                // Trả về lỗi 429 (Too Many Requests)
                return res.status(429).json({
                    message: "Another transaction is currently being processed. Please try again shortly."
                });
            }
            // Ném lại các lỗi khác
            throw error;
        }

        const { userId, studentId, amount } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log("Invalid userId");
            return res.status(400).json({ message: "Invalid userId" });
        }
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            console.log("Invalid studentId");
            return res.status(400).json({ message: "Invalid studentId" });
        }
        const saveResult = await transactionService.saveTransaction(userId, studentId, amount);
        // console.log("Transaction saved:", result);
        const processResult = await transactionService.processTransaction(userId, studentId, amount);
        const finalResult = {
            saveResult,
            processResult
        }
        return res.status(200).json(finalResult);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    } finally {
        if (lockAcquired) {
            // Xóa document khóa để giải phóng khóa cho instance khác
            await Lock.deleteOne({ _id: LOCK_ID });
            console.log("Distributed lock released.");
        }
    }
};

const getTransactionByUserId = async (req, res) => {
    try {
        const transactionHistory = await transactionService.getTransactionByUserId(req.params.userId);
        if (!transactionHistory) {
            return res.status(404).json({ message: "Transaction history not found!" });
        }
        return res.status(200).json(transactionHistory);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = { transaction, processTransaction, getTransactionByUserId };