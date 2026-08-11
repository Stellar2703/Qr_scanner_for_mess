import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminScannerPage from './pages/AdminScannerPage';
import AdminLogsPage from './pages/AdminLogsPage';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'dashboard', 'logs', 'student-dashboard'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={40} className="text-primary" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Initializing Smart QR Attendance System...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={user.role === 'student' ? 'student-dashboard' : activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1 }}>
        {user.role === 'student' ? (
          <StudentDashboard />
        ) : (
          <>
            {activeTab === 'dashboard' && <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />}
            {activeTab === 'scanner' && <AdminScannerPage />}
            {activeTab === 'logs' && <AdminLogsPage />}
          </>
        )}
      </main>
    </div>
  );
}
