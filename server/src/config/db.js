const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');

// Ensure environment variables are loaded regardless of process CWD
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

let pool = null;

// Helper to format date to YYYY-MM-DD
function getTodayString(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format time to HH:MM:SS
function getTimeString(dateObj = new Date()) {
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const mins = String(dateObj.getMinutes()).padStart(2, '0');
  const secs = String(dateObj.getSeconds()).padStart(2, '0');
  return `${hours}:${mins}:${secs}`;
}

async function seedInitialData(connection) {
  const defaultStudentPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('BIT@321', 10);
  
  const seedUsers = [
    {
      roll_no: 'admin',
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: adminPassword,
      role: 'admin',
      department: 'Administration',
      permanent_qr_token: 'QR-ADMIN-KEY-001',
      avatar: null
    },
    {
      roll_no: 'STU-101',
      name: 'Aarav Patel',
      email: 'aarav@student.edu',
      password: defaultStudentPassword,
      role: 'student',
      department: 'Computer Science',
      permanent_qr_token: 'STU-QR-2026-CS101-PERMANENT',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
    },
    {
      roll_no: 'STU-102',
      name: 'Ananya Sharma',
      email: 'ananya@student.edu',
      password: defaultStudentPassword,
      role: 'student',
      department: 'Computer Science',
      permanent_qr_token: 'STU-QR-2026-CS102-PERMANENT',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    },
    {
      roll_no: 'STU-103',
      name: 'Rohan Verma',
      email: 'rohan@student.edu',
      password: defaultStudentPassword,
      role: 'student',
      department: 'Information Technology',
      permanent_qr_token: 'STU-QR-2026-IT103-PERMANENT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
      roll_no: 'STU-104',
      name: 'Priya Das',
      email: 'priya@student.edu',
      password: defaultStudentPassword,
      role: 'student',
      department: 'Electronics',
      permanent_qr_token: 'STU-QR-2026-ECE104-PERMANENT',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    {
      roll_no: 'STU-105',
      name: 'Vikram Singh',
      email: 'vikram@student.edu',
      password: defaultStudentPassword,
      role: 'student',
      department: 'Mechanical Engineering',
      permanent_qr_token: 'STU-QR-2026-ME105-PERMANENT',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    },
    {
      roll_no: 'STU-106',
      name: 'Kavya Sharma',
      email: 'kavya@student.edu',
      password: defaultStudentPassword,
      role: 'student',
      department: 'Data Science',
      permanent_qr_token: 'STU-QR-2026-DS106-PERMANENT',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
    },
    {
      roll_no: 'STU-107',
      name: 'Aditya Verma',
      email: 'aditya@student.edu',
      password: defaultStudentPassword,
      role: 'student',
      department: 'Artificial Intelligence',
      permanent_qr_token: 'STU-QR-2026-AI107-PERMANENT',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
    }
  ];

  for (const user of seedUsers) {
    await connection.query(
      `INSERT INTO users (roll_no, name, email, password, role, department, permanent_qr_token, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password), name = VALUES(name), role = VALUES(role)`,
      [user.roll_no, user.name, user.email, user.password, user.role, user.department, user.permanent_qr_token, user.avatar]
    );
  }
  console.log('✅ Seed data (Admin + 7 Students) updated/verified in database.');
}

async function initDB() {
  try {
    // First try connecting to MySQL without database to create DB if needed
    const tempConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'qr_attendance_db';
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await tempConn.end();

    // Now initialize connection pool
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        roll_no VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) DEFAULT NULL,
        role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
        department VARCHAR(100) DEFAULT 'General',
        permanent_qr_token VARCHAR(255) NOT NULL UNIQUE,
        avatar VARCHAR(255) DEFAULT NULL,
        google_id VARCHAR(255) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        scan_date DATE NOT NULL,
        scan_time TIME NOT NULL,
        scanned_by_admin_id INT DEFAULT NULL,
        status ENUM('APPROVED', 'INVALID_REDUNDANT') NOT NULL DEFAULT 'APPROVED',
        remarks VARCHAR(255) DEFAULT 'Daily Attendance Scan',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (scanned_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_daily_student_scan (student_id, scan_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await seedInitialData(pool);
    console.log('✅ Connected to MySQL database:', dbName);
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    throw err;
  }
}

// Universal DB abstraction wrapper for MySQL
const db = {
  getTodayString,
  getTimeString,
  initDB,

  // User queries
  async getUserByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async getUserByRollNo(roll_no) {
    const [rows] = await pool.query('SELECT * FROM users WHERE roll_no = ?', [roll_no]);
    return rows[0] || null;
  },

  async getUserByQRToken(token) {
    const [rows] = await pool.query('SELECT * FROM users WHERE permanent_qr_token = ? OR roll_no = ?', [token, token]);
    return rows[0] || null;
  },

  async getAllStudents() {
    const [rows] = await pool.query('SELECT id, roll_no, name, email, role, department, permanent_qr_token, avatar, created_at FROM users WHERE role = "student"');
    return rows;
  },

  async createStudent({ roll_no, name, email, department, password }) {
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const permanent_qr_token = `STU-QR-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    
    const [result] = await pool.query(
      `INSERT INTO users (roll_no, name, email, password, role, department, permanent_qr_token)
       VALUES (?, ?, ?, ?, 'student', ?, ?)`,
      [roll_no, name, email, hashedPassword, department || 'General', permanent_qr_token]
    );

    return {
      id: result.insertId,
      roll_no,
      name,
      email,
      role: 'student',
      department: department || 'General',
      permanent_qr_token
    };
  },

  // Attendance check
  async getTodayScanForStudent(studentId, targetDate = getTodayString()) {
    const [rows] = await pool.query('SELECT * FROM attendance_logs WHERE student_id = ? AND scan_date = ?', [studentId, targetDate]);
    return rows[0] || null;
  },

  // Process QR Scan
  async recordScan({ studentId, adminId, scanDate = getTodayString(), scanTime = getTimeString() }) {
    const existing = await this.getTodayScanForStudent(studentId, scanDate);
    
    if (existing) {
      return {
        isSuccess: false,
        status: 'ALREADY_SCANNED',
        message: `QR code already scanned today at ${existing.scan_time}!`,
        existingScan: existing
      };
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO attendance_logs (student_id, scan_date, scan_time, scanned_by_admin_id, status, remarks)
         VALUES (?, ?, ?, ?, 'APPROVED', 'Daily Attendance Scan')`,
        [studentId, scanDate, scanTime, adminId || null]
      );
      const newLog = {
        id: result.insertId,
        student_id: studentId,
        scan_date: scanDate,
        scan_time: scanTime,
        scanned_by_admin_id: adminId || null,
        status: 'APPROVED'
      };
      return {
        isSuccess: true,
        status: 'APPROVED',
        message: 'Attendance approved and recorded successfully for today!',
        scan: newLog
      };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return {
          isSuccess: false,
          status: 'ALREADY_SCANNED',
          message: 'Duplicate scan entry detected for today.'
        };
      }
      throw err;
    }
  },

  // Reset/Clear logs for testing
  async resetLogsForTesting() {
    await pool.query('DELETE FROM attendance_logs');
    return true;
  },

  // Delete student and associated logs
  async deleteStudent(studentId) {
    await pool.query('DELETE FROM attendance_logs WHERE student_id = ?', [studentId]);
    const [result] = await pool.query('DELETE FROM users WHERE id = ? AND role = "student"', [studentId]);
    return result.affectedRows > 0;
  },

  // Admin Analytics & Dashboard Data
  async getAdminDashboardStats(targetDate = getTodayString()) {
    const students = await this.getAllStudents();
    const totalStudents = students.length;

    const [rows] = await pool.query(
      `SELECT l.*, s.name as student_name, s.roll_no, s.department, s.avatar 
       FROM attendance_logs l 
       JOIN users s ON l.student_id = s.id 
       WHERE l.scan_date = ? 
       ORDER BY l.id DESC`,
      [targetDate]
    );
    const todayLogs = rows;

    const presentCount = todayLogs.length;
    const absentCount = Math.max(0, totalStudents - presentCount);
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    // Dept stats breakdown
    const deptStats = {};
    students.forEach(s => {
      const dept = s.department || 'General';
      if (!deptStats[dept]) {
        deptStats[dept] = { total: 0, present: 0 };
      }
      deptStats[dept].total += 1;
    });

    todayLogs.forEach(l => {
      const dept = l.department || 'General';
      if (deptStats[dept]) {
        deptStats[dept].present += 1;
      }
    });

    return {
      targetDate,
      totalStudents,
      presentCount,
      absentCount,
      attendancePercentage,
      deptStats,
      todayLogs
    };
  },

  async getAllLogs(filterDate) {
    let sql = `SELECT l.*, s.name as student_name, s.roll_no, s.department, s.email, s.avatar, a.name as admin_name
               FROM attendance_logs l
               JOIN users s ON l.student_id = s.id
               LEFT JOIN users a ON l.scanned_by_admin_id = a.id`;
    const params = [];
    if (filterDate) {
      sql += ` WHERE l.scan_date = ?`;
      params.push(filterDate);
    }
    sql += ` ORDER BY l.id DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  }
};

module.exports = db;

