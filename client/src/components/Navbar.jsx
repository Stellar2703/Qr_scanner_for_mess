import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { QrCode, LayoutDashboard, ScanLine, History, Users, LogOut, ShieldCheck, User, Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="nav-brand">
          <QrCode size={28} className="text-primary" />
          <span>SmartQR Portal</span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="nav-links desktop-nav">
          {user.role === 'admin' ? (
            <>
              <button
                className={`nav-link ${activeTab === 'scanner' ? 'active' : ''}`}
                onClick={() => handleNavClick('scanner')}
              >
                <ScanLine size={18} />
                <span>QR Scanner</span>
              </button>

              <button
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button
                className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={() => handleNavClick('logs')}
              >
                <History size={18} />
                <span>Scan Logs</span>
              </button>
            </>
          ) : (
            <button
              className={`nav-link ${activeTab === 'student-dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('student-dashboard')}
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

        {/* Mobile Menu Toggle Icon Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Animated Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="user-badge" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
            {user.role === 'admin' ? <ShieldCheck size={16} className="text-warning" /> : <User size={16} className="text-primary" />}
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name}</span>
            <span className={`role-pill ${user.role}`}>{user.role}</span>
          </div>

          {user.role === 'admin' ? (
            <>
              <button
                className={`nav-link ${activeTab === 'scanner' ? 'active' : ''}`}
                onClick={() => handleNavClick('scanner')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <ScanLine size={18} />
                <span>QR Scanner</span>
              </button>

              <button
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('dashboard')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button
                className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={() => handleNavClick('logs')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <History size={18} />
                <span>Scan Logs</span>
              </button>
            </>
          ) : (
            <button
              className={`nav-link ${activeTab === 'student-dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('student-dashboard')}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <QrCode size={18} />
              <span>My Permanent QR</span>
            </button>
          )}

          <button
            className="btn-logout"
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}

