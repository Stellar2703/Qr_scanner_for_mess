const db = require('../config/db');

async function processQRScan(req, res) {
  try {
    const { qrToken } = req.body;
    const adminId = req.user ? req.user.id : null;

    if (!qrToken) {
      return res.status(400).json({ success: false, message: 'QR Code payload or token is required.' });
    }

    // Lookup student by permanent QR token or roll number
    const student = await db.getUserByQRToken(qrToken.trim());

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        status: 'NOT_FOUND',
        message: 'Invalid QR Code. No student associated with this code.'
      });
    }

    const todayDate = db.getTodayString();
    const scanTime = db.getTimeString();

    // Check & Record scan in database
    const result = await db.recordScan({
      studentId: student.id,
      adminId,
      scanDate: todayDate,
      scanTime
    });

    const { password, ...studentInfo } = student;

    if (!result.isSuccess) {
      return res.status(409).json({
        success: false,
        status: 'ALREADY_SCANNED',
        message: result.message,
        student: studentInfo,
        scanTime: result.existingScan ? result.existingScan.scan_time : null,
        scanDate: todayDate
      });
    }

    res.json({
      success: true,
      status: 'APPROVED',
      message: 'Attendance approved and marked successfully for today!',
      student: studentInfo,
      scanTime,
      scanDate: todayDate
    });
  } catch (err) {
    console.error('QR Scan error:', err);
    res.status(500).json({ success: false, message: 'Error processing QR code verification.' });
  }
}

async function checkQRStatus(req, res) {
  try {
    const { qrToken } = req.params;
    const student = await db.getUserByQRToken(qrToken.trim());

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const todayDate = db.getTodayString();
    const todayScan = await db.getTodayScanForStudent(student.id, todayDate);

    res.json({
      success: true,
      studentName: student.name,
      rollNo: student.roll_no,
      isScannedToday: !!todayScan,
      scanTime: todayScan ? todayScan.scan_time : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to check status.' });
  }
}

module.exports = {
  processQRScan,
  checkQRStatus
};
