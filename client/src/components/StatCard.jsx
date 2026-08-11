import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'primary', subtext }) {
  const colorStyles = {
    primary: { iconBg: 'rgba(99, 102, 241, 0.15)', iconColor: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
    success: { iconBg: 'rgba(16, 185, 129, 0.15)', iconColor: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    danger: { iconBg: 'rgba(239, 68, 68, 0.15)', iconColor: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    warning: { iconBg: 'rgba(245, 158, 11, 0.15)', iconColor: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' }
  };

  const currentStyle = colorStyles[color] || colorStyles.primary;

  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.5rem', borderColor: currentStyle.border }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.25rem 0', fontFamily: 'var(--font-heading)' }}>
            {value}
          </h3>
          {subtext && <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{subtext}</p>}
        </div>
        {Icon && (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: currentStyle.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentStyle.iconColor
            }}
          >
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
