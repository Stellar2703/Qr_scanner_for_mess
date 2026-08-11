const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
