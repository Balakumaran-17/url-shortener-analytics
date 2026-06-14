const express = require('express');
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const { registerLimiter, loginLimiter } = require('../middleware/rateLimiter');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

// Public registration route with limiter and validator
router.post('/register', registerLimiter, registerValidator, validate, authController.register);

// Public login route with limiter and validator
router.post('/login', loginLimiter, loginValidator, validate, authController.login);

// Token rotation endpoint
router.post('/refresh', authController.refresh);

// Protected logout session
router.post('/logout', authenticateJWT, authController.logout);

// Fetch authenticated profile info
router.get('/me', authenticateJWT, authController.me);

module.exports = router;
