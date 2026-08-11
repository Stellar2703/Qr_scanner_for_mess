const db = require('../config/db');

async function getDashboard(req, res) {
  try {
    const { date } = req.query;
    const targetDate = date || db.getTodayString();

    const stats = await db.getAdminDashboardStats(targetDate);

    res.json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('Error loading admin dashboard stats:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard statistics.' });
  }
}

async function getLogs(req, res) {
  try {
    const { date } = req.query;
    const logs = await db.getAllLogs(date);
    res.json({
      success: true,
      logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance logs.' });
  }
}

async function getStudentsList(req, res) {
  try {
    const students = await db.getAllStudents();
    const todayDate = db.getTodayString();

    // Map each student with today's status
    const listWithStatus = await Promise.all(
      students.map(async (s) => {
        const todayScan = await db.getTodayScanForStudent(s.id, todayDate);
        return {
          ...s,
          isScannedToday: !!todayScan,
          scanTime: todayScan ? todayScan.scan_time : null
        };
      })
    );

    res.json({
      success: true,
      students: listWithStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch students list.' });
  }
}

async function resetDemoData(req, res) {
  try {
    await db.resetLogsForTesting();
    res.json({
      success: true,
      message: 'Attendance logs reset successfully. All permanent QR codes renewed for testing.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset demo data.' });
  }
}

async function createStudent(req, res) {
  try {
    const { roll_no, name, email, department, password } = req.body;
    if (!roll_no || !name || !email) {
      return res.status(400).json({ success: false, message: 'Roll number, name, and email are required.' });
    }

    const existingEmail = await db.getUserByEmail(email.trim());
    if (existingEmail) {
      return res.status(400).json({ success: false, message: `A student with email "${email}" already exists.` });
    }
    const existingRoll = await db.getUserByRollNo(roll_no.trim());
    if (existingRoll) {
      return res.status(400).json({ success: false, message: `A student with roll number "${roll_no}" already exists.` });
    }

    const newStudent = await db.createStudent({
      roll_no: roll_no.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department ? department.trim() : 'General',
      password
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully with a unique randomly generated QR code!',
      student: newStudent
    });
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ success: false, message: 'Failed to create student record: ' + err.message });
  }
}

module.exports = {
  getDashboard,
  getLogs,
  getStudentsList,
  resetDemoData,
  createStudent
};
