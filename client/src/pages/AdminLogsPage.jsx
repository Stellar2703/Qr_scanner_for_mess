import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Search, Download, Calendar, Filter, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/logs';
      if (filterDate) {
        url += `?date=${filterDate}`;
      }
      const res = await axios.get(url);
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterDate]);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = log.student_name ? log.student_name.toLowerCase().includes(term) : false;
    const rollMatch = log.roll_no ? log.roll_no.toLowerCase().includes(term) : false;
    const deptMatch = log.department ? log.department.toLowerCase().includes(term) : false;
    return nameMatch || rollMatch || deptMatch;
  });

  const exportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Log ID', 'Student Roll No', 'Student Name', 'Department', 'Scan Date', 'Scan Time', 'Status'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.roll_no}"`,
      `"${l.student_name}"`,
      `"${l.department}"`,
      l.scan_date,
      l.scan_time,
      l.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Scan_Logs_${filterDate || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Attendance Scan History Logs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Complete audit trail of all approved daily student QR scans
          </p>
        </div>

        <button className="btn-primary" onClick={exportCSV} disabled={filteredLogs.length === 0}>
          <Download size={18} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            className="input-control"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
            placeholder="Search by student name, roll number, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} className="text-muted" />
          <input
            type="date"
            className="input-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button className="btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setFilterDate('')}>
              Clear Date
            </button>
          )}
        </div>

        <button className="btn-secondary" onClick={fetchLogs}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="text-primary spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '0.75rem' }}>Loading log records...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Log ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Roll No</th>
                <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                <th style={{ padding: '0.75rem 1rem' }}>Scan Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Scan Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>#{log.id}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                        {log.student_name ? log.student_name.charAt(0) : 'S'}
                      </div>
                      <span>{log.student_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{log.roll_no}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{log.department}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>{log.scan_date}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-main)' }}>{log.scan_time}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="badge-status approved">
                      <CheckCircle2 size={14} /> APPROVED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <History size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>No Scan Records Found</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
              No attendance logs match your current search or date filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
