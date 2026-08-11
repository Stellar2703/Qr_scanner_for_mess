const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Route for admin to verify & record student QR scan
router.post('/verify', authenticateToken, requireRole('admin'), scanController.processQRScan);

// Route to check status without recording (open/public status check if needed)
router.get('/status/:qrToken', scanController.checkQRStatus);

module.exports = router;
