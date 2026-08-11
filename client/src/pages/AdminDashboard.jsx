import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import { Users, UserCheck, UserX, Percent, RefreshCw, Calendar, ArrowRight, ScanLine, RotateCcw, AlertCircle, UserPlus, QrCode, X, CheckCircle, Trash2, Search, Mail } from 'lucide-react';

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [resetMessage, setResetMessage] = useState('');

  // Student directory state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Add student state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    roll_no: '',
    name: '',
    email: '',
    department: 'Computer Science',
    password: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [createdStudent, setCreatedStudent] = useState(null);

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await axios.get('/api/admin/students');
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Failed to fetch students list:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchDashboardStats = async (dateParam) => {
    setLoading(true);
    setError('');
    try {
      const targetDate = dateParam || selectedDate;
      const res = await axios.get(`/api/admin/dashboard?date=${targetDate}`);
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchStudents();
  }, [selectedDate]);

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student "${studentName}"? This action cannot be undone and will delete all associated scan logs.`)) {
      return;
    }

    try {
      const res = await axios.delete(`/api/admin/students/${studentId}`);
      if (res.data.success) {
        setResetMessage(`Student "${studentName}" deleted successfully.`);
        fetchStudents();
        fetchDashboardStats();
        setTimeout(() => setResetMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    setCreatedStudent(null);

    try {
      const res = await axios.post('/api/admin/students', formData);
      if (res.data.success) {
        setCreatedStudent(res.data.student);
        fetchDashboardStats();
        fetchStudents();
        setFormData({
          roll_no: '',
          name: '',
          email: '',
          department: 'Computer Science',
          password: ''
        });
      }
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add student.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all scan logs for testing? This will restore all permanent QR codes as non-scanned for today.')) {
      return;
    }
    try {
      const res = await axios.post('/api/admin/reset-demo');
      if (res.data.success) {
        setResetMessage('Logs reset successfully! All QR codes are fresh for testing.');
        fetchDashboardStats();
        setTimeout(() => setResetMessage(''), 4000);
      }
    } catch (err) {
      alert('Reset failed.');
    }
  };

  if (loading && !stats) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <RefreshCw size={36} className="text-primary spinner" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading analytics dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container main-content">
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Admin Dashboard & Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Daily QR scan monitoring and student presence metrics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Calendar size={16} className="text-muted" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <button
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            onClick={() => {
              setShowAddModal(true);
              setCreatedStudent(null);
              setAddError('');
            }}
          >
            <UserPlus size={18} />
            <span>Add Student</span>
          </button>

          <button className="btn-primary" onClick={() => onNavigate('scanner')}>
            <ScanLine size={18} />
            <span>Open Scanner</span>
          </button>
        </div>
      </div>

      {resetMessage && <div className="alert alert-success">{resetMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <>
          {/* Stat Cards Row */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <StatCard
              title="Total Registered Students"
              value={stats.totalStudents}
              icon={Users}
              color="primary"
              subtext="Enrolled across all departments"
            />
            <StatCard
              title="Present Today"
              value={stats.presentCount}
              icon={UserCheck}
              color="success"
              subtext="Scanned permanent QR code today"
            />
            <StatCard
              title="Absent Today"
              value={stats.absentCount}
              icon={UserX}
              color="danger"
              subtext="Pending scan for today"
            />
            <StatCard
              title="Attendance Rate"
              value={`${stats.attendancePercentage}%`}
              icon={Percent}
              color="warning"
              subtext={`Target date: ${stats.targetDate}`}
            />
          </div>

          {/* Analytics Visuals & Activity */}
          <div className="grid-2">
            {/* Department-wise Attendance Breakdown */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Department Presence Breakdown
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {Object.entries(stats.deptStats || {}).map(([dept, dStat]) => {
                  const pct = dStat.total > 0 ? Math.round((dStat.present / dStat.total) * 100) : 0;
                  return (
                    <div key={dept}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{dept}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {dStat.present} / {dStat.total} Present ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: pct === 100 ? 'var(--success)' : 'linear-gradient(90deg, #6366f1, #38bdf8)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease-in-out'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Today's Scan Activity Timeline */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Today's Live Scan Activity</h2>
                <button
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => onNavigate('logs')}
                >
                  View All Logs <ArrowRight size={14} />
                </button>
              </div>

              {stats.todayLogs && stats.todayLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
                  {stats.todayLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontWeight: 700 }}>
                          {log.student_name ? log.student_name.charAt(0) : 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.student_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.roll_no} • {log.department}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className="badge-status approved" style={{ fontSize: '0.75rem' }}>APPROVED</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                          {log.scan_time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <AlertCircle size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.9rem' }}>No QR scans recorded yet for {stats.targetDate}.</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    Open scanner to mark student attendance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Registered Students Directory Section */}
          <div className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} className="text-primary" />
                  <span>Registered Students Directory</span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '0.15rem 0.6rem', borderRadius: '1rem', fontWeight: 600 }}>
                    {students.length} Total
                  </span>
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  View, add, and delete enrolled students and permanent QR code records
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Search name, roll no, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.25rem', fontSize: '0.85rem', height: '38px' }}
                  />
                </div>

                <button
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', height: '38px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setShowAddModal(true);
                    setCreatedStudent(null);
                    setAddError('');
                  }}
                >
                  <UserPlus size={16} />
                  <span>Add Student</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            {studentsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Loading students directory...</p>
              </div>
            ) : (
              (() => {
                const filteredStudents = students.filter(s =>
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (s.department && s.department.toLowerCase().includes(searchTerm.toLowerCase()))
                );

                if (filteredStudents.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      <Users size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                      <p style={{ fontSize: '0.9rem' }}>No students found matching "{searchTerm}"</p>
                    </div>
                  );
                }

                return (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Roll No</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Email / Department</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Permanent QR Token</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Today's Status</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((s) => (
                          <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s ease' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                              {s.roll_no}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                                  {s.name ? s.name.charAt(0) : 'S'}
                                </div>
                                <span>{s.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                              <div>{s.email}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{s.department || 'General'}</div>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.82rem', color: '#38bdf8' }}>
                              <span style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                {s.permanent_qr_token ? s.permanent_qr_token.substring(0, 16) + '...' : 'N/A'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              {s.isScannedToday ? (
                                <span className="badge-status approved" style={{ fontSize: '0.75rem' }}>
                                  PRESENT ({s.scanTime})
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 600 }}>
                                  ABSENT
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              <button
                                type="button"
                                title="Delete Student"
                                onClick={() => handleDeleteStudent(s.id, s.name)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#f87171',
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#ef4444';
                                  e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                  e.currentTarget.style.color = '#f87171';
                                }}
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()
            )}
          </div>
        </>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                  <UserPlus size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add New Student</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Permanent QR code will be generated randomly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setCreatedStudent(null);
                  setAddError('');
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {addError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{addError}</div>}

            {createdStudent ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  Student Registered Successfully!
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {createdStudent.name} ({createdStudent.roll_no}) • {createdStudent.department}
                </p>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Randomly Generated Permanent QR Token:
                  </div>
                  <div style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <QrCode size={18} />
                    <span>{createdStudent.permanent_qr_token}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setCreatedStudent(null)}
                  >
                    Add Another Student
                  </button>
                  <button
                    className="btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setShowAddModal(false);
                      setCreatedStudent(null);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddStudentSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>Roll Number *</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. STU-108"
                    value={formData.roll_no}
                    onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>Full Name *</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Rahul Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>Google Email Address *</label>
                  <input
                    type="email"
                    className="input-control"
                    placeholder="e.g. rahul@student.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>Department</label>
                  <select
                    className="input-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', color: '#fff' }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>Password (Optional)</label>
                  <input
                    type="password"
                    className="input-control"
                    placeholder="Default: password123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    disabled={addLoading}
                  >
                    <UserPlus size={18} />
                    <span>{addLoading ? 'Generating QR...' : 'Add Student & Generate QR'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
