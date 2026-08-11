-- Permanent Student QR Code Attendance System - MySQL Database Schema

CREATE DATABASE IF NOT EXISTS qr_attendance_db;
USE qr_attendance_db;

-- Table for Users (Students and Admins)
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

-- Table for Attendance Logs
-- Daily uniqueness constraint: ONE APPROVED record per student per scan_date
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
