const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgotpassword', require('../controllers/authController').forgotPassword);
router.put('/resetpassword/:resetToken', require('../controllers/authController').resetPassword);

module.exports = router;
