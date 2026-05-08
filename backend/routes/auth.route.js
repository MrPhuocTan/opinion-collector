const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/request-otp', AuthController.requestOTP);
router.post('/reset-password', AuthController.resetPassword);
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;
