import React from 'react';
import { useAuth } from '../context/AuthContext';
import { QrCode, LayoutDashboard, ScanLine, History, Users, LogOut, ShieldCheck, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="nav-brand">
          <QrCode size={28} className="text-primary" />
          <span>SmartQR Portal</span>
        </div>

        <div className="nav-links">
          {user.role === 'admin' ? (
            <>
              <button
                className={`nav-link ${activeTab === 'scanner' ? 'active' : ''}`}
                onClick={() => setActiveTab('scanner')}
              >
                <ScanLine size={18} />
                <span>QR Scanner</span>
              </button>

              <button
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button
                className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={() => setActiveTab('logs')}
              >
                <History size={18} />
                <span>Scan Logs</span>
              </button>
            </>
          ) : (
            <button
              className={`nav-link ${activeTab === 'student-dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('student-dashboard')}
            >
              <QrCode size={18} />
              <span>My Permanent QR</span>
            </button>
          )}

          <div className="user-badge">
            {user.role === 'admin' ? <ShieldCheck size={16} className="text-warning" /> : <User size={16} className="text-primary" />}
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name}</span>
            <span className={`role-pill ${user.role}`}>{user.role}</span>
          </div>

          <button className="btn-logout" onClick={logout} title="Logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
