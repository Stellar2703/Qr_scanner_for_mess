import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { QrCode, Lock, Mail, UserCheck, Shield, ArrowRight } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '540156826923-qmj3q22nh67t2s18vq2v0per4n0i6bvh.apps.googleusercontent.com';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState('student'); // 'student' or 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize Google Sign-In SDK for Student & Admin Login
  useEffect(() => {
    const setupGoogleSDK = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
              if (response.credential) {
                setSubmitting(true);
                setError('');
                const res = await loginWithGoogle(response.credential, null, activeRoleTab);
                setSubmitting(false);
                if (!res.success) {
                  setError(res.message);
                }
              }
            }
          });

          const btnContainerId = activeRoleTab === 'student' ? 'google-btn-container-student' : 'google-btn-container-admin';
          const btnContainer = document.getElementById(btnContainerId);
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(btnContainer, {
              theme: activeRoleTab === 'admin' ? 'filled_black' : 'filled_blue',
              size: 'large',
              type: 'standard',
              shape: 'rectangular',
              text: 'signin_with',
              logo_alignment: 'left',
              width: 380
            });
          }
        } catch (e) {
          console.error('Google GIS Init error:', e);
        }
      }
    };

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setTimeout(setupGoogleSDK, 150);
      document.body.appendChild(script);
    } else {
      setTimeout(setupGoogleSDK, 150);
    }
  }, [activeRoleTab]);

  const handleTabChange = (role) => {
    setActiveRoleTab(role);
    setError('');
    setIdentifier('');
    setPassword('');
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(identifier, password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.message);
    }
  };


  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary), #a5b4fc)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <QrCode size={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Smart QR Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Permanent QR Attendance & Verification System
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          {/* Role Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <button
              type="button"
              onClick={() => handleTabChange('student')}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: activeRoleTab === 'student' ? 'var(--primary)' : 'transparent',
                color: activeRoleTab === 'student' ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              <UserCheck size={18} />
              Student Portal (OAuth)
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: activeRoleTab === 'admin' ? 'var(--warning)' : 'transparent',
                color: activeRoleTab === 'admin' ? '#0f172a' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              <Shield size={18} />
              Admin Portal
            </button>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

          {/* Student Tab: Google OAuth Authentication */}
          {activeRoleTab === 'student' ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Student Google OAuth Sign-In
                </p>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                  Sign in with your registered college Google email account.
                </p>
              </div>

              {/* Official Google Sign-In Button Wrapper */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', minHeight: '44px' }}>
                <div id="google-btn-container-student" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
              </div>
            </div>
          ) : (
            /* Admin Tab: Google OAuth + Password Authentication */
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Admin Sign-In
                </p>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                  Sign in with your Admin Google Account or Credentials
                </p>
              </div>

              {/* Official Google Sign-In Button Wrapper for Admin */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', minHeight: '44px' }}>
                <div id="google-btn-container-admin" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR PASSWORD LOGIN</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              </div>

              <form onSubmit={handleAdminSubmit}>
                <div className="form-group">
                  <label>Admin Email / Roll No</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="input-control"
                      style={{ width: '100%', paddingLeft: '2.5rem' }}
                      placeholder="admin or admin@college.edu"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                    <Mail
                      size={18}
                      style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="input-control"
                      style={{ width: '100%', paddingLeft: '2.5rem' }}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Lock
                      size={18}
                      style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)'
                  }}
                  disabled={submitting}
                >
                  <span>{submitting ? 'Authenticating...' : 'Login as Admin'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
