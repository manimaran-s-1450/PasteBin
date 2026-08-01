const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/auth/google - Initiate Google OAuth Account Picker
router.get('/google', authController.initiateGoogleAuth);

// GET /api/auth/google/callback - Google OAuth Callback Endpoint
router.get('/google/callback', authController.handleGoogleCallback);

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/profile
router.get('/profile', authenticateToken, authController.getProfile);
router.get('/me', authenticateToken, authController.getProfile);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
