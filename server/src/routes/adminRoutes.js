const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/logs', adminController.getLogs);
router.get('/students', adminController.getStudentsList);
router.post('/students', adminController.createStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.post('/reset-demo', adminController.resetDemoData);

module.exports = router;
