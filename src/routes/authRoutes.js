const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// router.post('/signup', authController.signup); // Disabled public signup
router.post('/login', authController.login);
router.post('/request-reset-password', authController.requestResetPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);
router.get('/activate/:token', authController.activateAccount);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
