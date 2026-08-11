const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticateToken, requireRole('student'), studentController.getStudentDashboard);

module.exports = router;
