import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, CheckCircle2, Clock, Info, ShieldCheck, Download, RefreshCw, User, Mail, GraduationCap, Building } from 'lucide-react';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/student/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const downloadQR = () => {
    const canvas = document.getElementById('student-qr-canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${data.student.roll_no}_Permanent_QR.png`;
    link.href = url;
    link.click();
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <RefreshCw size={36} className="text-primary spinner" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading student profile & permanent QR code...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="alert alert-error">{error || 'Unable to retrieve dashboard data.'}</div>
        <button className="btn-secondary" onClick={fetchDashboard}>Try Again</button>
      </div>
    );
  }

  const { student, permanent_qr_token, todayStatus } = data;

  return (
    <div className="container main-content">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome back, {student.name}!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Roll No: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{student.roll_no}</span> | Dept: {student.department}
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchDashboard}>
          <RefreshCw size={16} />
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="grid-2">
        {/* Permanent QR Code Card */}
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <QrCode size={22} className="text-primary" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Your Permanent QR Code</h2>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Show this QR code to the Admin scanner once every day for attendance verification.
          </p>

          {/* QR Code Container */}
          <div
            style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'inline-block',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
              border: '4px solid #6366f1'
            }}
          >
            <QRCodeCanvas
              id="student-qr-canvas"
              value={permanent_qr_token}
              size={220}
              level="H"
              includeMargin={true}
            />
          </div>

          <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={downloadQR}>
            <Download size={18} />
            <span>Download Permanent QR Code</span>
          </button>
        </div>

        {/* Attendance Status & Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Daily Status Banner */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Today's Attendance Status</h3>

            {todayStatus.isScannedToday ? (
              <div
                style={{
                  background: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}
              >
                <CheckCircle2 size={32} color="#10b981" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#34d399', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Attendance Approved For Today!
                  </h4>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    Scanned at: <strong style={{ color: '#fff' }}>{todayStatus.scanTime}</strong> on {todayStatus.date}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    ✅ Your scan is registered for today. Additional scans today will show as already scanned.
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--warning-bg)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}
              >
                <Clock size={32} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Pending Daily Verification
                  </h4>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    You have not scanned your QR code yet today ({todayStatus.date}).
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Please present your QR code to the Admin scanner to get approved.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* How Permanent Validity Works Box */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', marginBottom: '0.75rem' }}>
              <Info size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>How Your Permanent QR Code Works</h3>
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <li><strong>One Code Forever:</strong> Your QR code remains unchanged for your entire academic tenure.</li>
              <li><strong>Single Scan Daily:</strong> Once scanned by Admin today, it becomes completed/exhausted for today.</li>
              <li><strong>Auto Renewal:</strong> Tomorrow, the system automatically renews validity for this exact same QR code.</li>
            </ul>
          </div>

          {/* Student Profile Overview */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Student Profile Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Full Name</span>
                <strong style={{ color: 'var(--text-main)', wordBreak: 'break-word' }}>{student.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Roll Number</span>
                <strong style={{ color: 'var(--text-main)', wordBreak: 'break-word' }}>{student.roll_no}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Email Address</span>
                <strong style={{ color: 'var(--text-main)', wordBreak: 'break-word' }}>{student.email}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Department</span>
                <strong style={{ color: 'var(--text-main)', wordBreak: 'break-word' }}>{student.department}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
