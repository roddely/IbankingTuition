const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

// router.get("/signup", (req, res) => res.json({message: "Sign Up page (API)"}));
router.post('/transaction', transactionController.transaction);
//
router.post('/processTransaction', transactionController.processTransaction);
router.get('/:userId', transactionController.getTransactionByUserId);
// router.get("/login", (req, res) => res.json({ message: "Login page (API only)" }));
// router.post('/login', userController.login);

// router.get('/:id', authMiddleware, userController.getUserById);

module.exports = router;

