import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Camera,
  Search,
  History,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function AdminScannerPage() {
  const [manualToken, setManualToken] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentScans, setRecentScans] = useState([]);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastScanRef = useRef({ text: '', time: 0 });

  // Web Audio synth for instant beep feedback
  const playBeep = (type = 'success') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio playback policy may require user interaction
    }
  };

  // Initialize html5 camera scanner (Continuous Mode)
  useEffect(() => {
    let html5QrcodeScanner = null;

    if (cameraActive) {
      const timer = setTimeout(() => {
        html5QrcodeScanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        html5QrcodeScanner.render(
          (decodedText) => {
            const now = Date.now();
            if (isProcessingRef.current) return;
            // Ignore same QR payload if scanned less than 2.5s ago
            if (lastScanRef.current.text === decodedText && (now - lastScanRef.current.time < 2500)) {
              return;
            }
            lastScanRef.current = { text: decodedText, time: now };
            handleVerifyQR(decodedText);
            // Continuous scanning: DO NOT stop camera or clear scanner!
          },
          (errorMessage) => {
            // Ignore frame scan errors
          }
        );

        scannerRef.current = html5QrcodeScanner;
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (e) {}
        }
      };
    }
  }, [cameraActive]);

  const handleVerifyQR = async (tokenToVerify) => {
    if (!tokenToVerify || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setLoading(true);

    try {
      const res = await axios.post('/api/scan/verify', { qrToken: tokenToVerify });
      if (res.data.success) {
        const result = {
          id: Date.now(),
          type: 'APPROVED',
          message: res.data.message,
          student: res.data.student,
          scanTime: res.data.scanTime,
          scanDate: res.data.scanDate,
          rawToken: tokenToVerify
        };
        setScanResult(result);
        setRecentScans((prev) => [result, ...prev.slice(0, 19)]);
        playBeep('success');
      }
    } catch (err) {
      let result = null;
      if (err.response?.data) {
        const data = err.response.data;
        if (data.status === 'ALREADY_SCANNED') {
          result = {
            id: Date.now(),
            type: 'ALREADY_SCANNED',
            message: data.message,
            student: data.student,
            scanTime: data.scanTime,
            scanDate: data.scanDate,
            rawToken: tokenToVerify
          };
        } else if (data.status === 'NOT_FOUND') {
          result = {
            id: Date.now(),
            type: 'NOT_FOUND',
            message: data.message || 'Invalid QR Code. No student record found.',
            rawToken: tokenToVerify
          };
        } else {
          result = {
            id: Date.now(),
            type: 'ERROR',
            message: data.message || 'Verification error.',
            rawToken: tokenToVerify
          };
        }
      } else {
        result = {
          id: Date.now(),
          type: 'ERROR',
          message: 'Server error processing scan verification.',
          rawToken: tokenToVerify
        };
      }
      setScanResult(result);
      setRecentScans((prev) => [result, ...prev.slice(0, 19)]);
      playBeep('error');
    } finally {
      setLoading(false);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleVerifyQR(manualToken.trim());
    setManualToken('');
  };

  return (
    <div className="container main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Continuous QR Scanner</h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: 'var(--radius-full)',
                padding: '0.2rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></span>
              AUTO CONTINUOUS MODE
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Scan student permanent QR codes rapidly one after another without pressing start each time.
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Audio Beep' : 'Enable Audio Beep'}
            style={{ padding: '0.5rem 0.85rem' }}
          >
            {soundEnabled ? <Volume2 size={18} className="text-primary" /> : <VolumeX size={18} className="text-muted" />}
            <span style={{ fontSize: '0.85rem' }}>{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Scanner Station & Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ScanLine className="text-primary scanner-active" />
                <span>Live Camera Viewport</span>
              </h2>

              <button
                className={cameraActive ? 'btn-secondary' : 'btn-primary'}
                onClick={() => setCameraActive(!cameraActive)}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', minHeight: '38px' }}
              >
                <Camera size={16} />
                <span>{cameraActive ? 'Pause Camera' : 'Start Camera'}</span>
              </button>
            </div>

            {/* Camera Viewport */}
            {cameraActive ? (
              <div style={{ marginBottom: '1.25rem', background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', padding: '0.5rem', border: '1px solid var(--border-accent)' }}>
                <div id="qr-reader" style={{ width: '100%' }}></div>
                <div style={{ textAlign: 'center', padding: '0.4rem 0', fontSize: '0.78rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', marginTop: '0.5rem', borderRadius: '4px' }}>
                  ⚡ Scanner is active. Point student QR codes directly at camera.
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed var(--border-accent)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.4)',
                  marginBottom: '1.25rem'
                }}
              >
                <ScanLine size={48} className="text-muted" style={{ margin: '0 auto 1rem auto', display: 'block', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.05rem' }}>
                  Camera Paused
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Click "Start Camera" to resume continuous QR auto-scanning.
                </p>
                <button className="btn-primary" onClick={() => setCameraActive(true)}>
                  <Camera size={16} /> Start Camera Scanner
                </button>
              </div>
            )}

            {/* Manual Token Form */}
            <form onSubmit={handleManualSubmit}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.85rem' }}>Manual Entry / Barcode Gun Input</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="input-control"
                    style={{ flex: '1 1 200px', padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                    placeholder="Enter Student Roll No or Permanent QR Payload"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                  />
                  <button type="submit" className="btn-primary" disabled={loading || !manualToken.trim()} style={{ padding: '0.6rem 1rem', flex: '1 1 90px' }}>
                    {loading ? <RefreshCw size={16} className="spinner" /> : 'Verify'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Latest Scan Feedback + Continuous Session Log Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Verification Card for Latest Scan */}
          <div className="glass-card" style={{ padding: '1.5rem', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!scanResult ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem' }}>
                <Search size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>Ready for Scans</h3>
                <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                  Show QR codes to the camera. Verification results will display here instantly and continuously.
                </p>
              </div>
            ) : scanResult.type === 'APPROVED' ? (
              <div
                style={{
                  background: 'var(--success-bg)',
                  border: '2px solid var(--success-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  animation: 'fadeIn 0.25s ease-in-out'
                }}
              >
                <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
                <h2 style={{ color: '#34d399', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  APPROVED & VERIFIED!
                </h2>
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  Attendance recorded successfully for today.
                </p>

                {scanResult.student && (
                  <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                      {scanResult.student.avatar ? (
                        <img src={scanResult.student.avatar} alt="avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                          {scanResult.student.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{scanResult.student.name}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{scanResult.student.roll_no} • {scanResult.student.department}</p>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      Timestamp: <strong>{scanResult.scanTime}</strong> ({scanResult.scanDate})
                    </div>
                  </div>
                )}
              </div>
            ) : scanResult.type === 'ALREADY_SCANNED' ? (
              <div
                style={{
                  background: 'var(--danger-bg)',
                  border: '2px solid var(--danger-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  animation: 'fadeIn 0.25s ease-in-out'
                }}
              >
                <XCircle size={54} color="#ef4444" style={{ margin: '0 auto 0.75rem auto' }} />
                <h2 style={{ color: '#f87171', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  ALREADY SCANNED TODAY!
                </h2>
                <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  ⚠️ Student has already been scanned today.
                </p>

                {scanResult.student && (
                  <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca5a5', fontWeight: 700, fontSize: '1.1rem' }}>
                        {scanResult.student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{scanResult.student.name}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{scanResult.student.roll_no} • {scanResult.student.department}</p>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#fca5a5', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      First scanned at: <strong>{scanResult.scanTime || 'Earlier today'}</strong>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <AlertTriangle size={54} color="#f59e0b" style={{ margin: '0 auto 0.75rem auto' }} />
                <h2 style={{ color: '#fbbf24', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  INVALID QR CODE
                </h2>
                <p style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>{scanResult.message}</p>
              </div>
            )}
          </div>

          {/* Continuous Session Scan Log Feed */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={18} className="text-primary" />
                <span>Live Continuous Session Log</span>
              </h3>
              <span className="badge-status pending" style={{ fontSize: '0.75rem' }}>
                {recentScans.length} Scanned
              </span>
            </div>

            {recentScans.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
                {recentScans.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.8rem',
                      background: idx === 0 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-md)',
                      border: idx === 0 ? '1px solid var(--primary-glow)' : '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: item.type === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: item.type === 'APPROVED' ? '#34d399' : '#f87171',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        {item.student?.name ? item.student.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                          {item.student?.name || 'Unknown Student'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.student?.roll_no || item.rawToken}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        className={`badge-status ${item.type === 'APPROVED' ? 'approved' : 'already-scanned'}`}
                        style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
                      >
                        {item.type}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                        {item.scanTime || 'Just now'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No codes scanned yet in this session. Start scanning QR codes continuously.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
