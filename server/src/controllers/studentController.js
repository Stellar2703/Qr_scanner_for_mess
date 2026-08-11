const db = require('../config/db');
const QRCode = require('qrcode');

async function getStudentDashboard(req, res) {
  try {
    const student = await db.getUserByRollNo(req.user.roll_no);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const todayDate = db.getTodayString();
    const todayScan = await db.getTodayScanForStudent(student.id, todayDate);

    // Generate Base64 Data URL for permanent QR Code
    const qrDataUrl = await QRCode.toDataURL(student.permanent_qr_token, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff'
      }
    });

    const { password, ...studentProfile } = student;

    res.json({
      success: true,
      student: studentProfile,
      permanent_qr_token: student.permanent_qr_token,
      qrDataUrl,
      todayStatus: {
        date: todayDate,
        isScannedToday: !!todayScan,
        status: todayScan ? 'APPROVED' : 'NOT_SCANNED',
        scanTime: todayScan ? todayScan.scan_time : null,
        remarks: todayScan ? todayScan.remarks : 'Pending daily scan'
      }
    });
  } catch (err) {
    console.error('Error fetching student dashboard:', err);
    res.status(500).json({ success: false, message: 'Failed to load student dashboard.' });
  }
}

module.exports = {
  getStudentDashboard
};
