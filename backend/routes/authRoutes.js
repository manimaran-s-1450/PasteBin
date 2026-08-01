const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/profile (or /me)
router.get('/profile', authenticateToken, authController.getProfile);
router.get('/me', authenticateToken, authController.getProfile);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
