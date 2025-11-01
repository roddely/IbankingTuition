const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.get('/me', protect, userController.getMe);
router.get('/:id', protect, userController.getUserById);

router.post('/deposit', protect, userController.deposit);
router.post('/updateBalance', userController.updateBalance);

module.exports = router;

