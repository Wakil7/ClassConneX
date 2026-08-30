import React from 'react';
import { Calendar, User as UserIcon, ShieldAlert, BookOpen } from 'lucide-react';

const Header = ({ title, user }) => {
  // Format current date
  const formatDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      backgroundColor: 'rgba(11, 15, 25, 0.7)',
      backdropFilter: 'var(--glass-blur)',
      webkitBackdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      zIndex: 90
    }} className="header-mobile-adjust">
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
          <Calendar size={13} color="var(--text-muted)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {formatDate()}
          </span>
        </div>
      </div>

      {/* Role Badge and System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            fontSize: '0.8rem'
          }}>
            {user.role === 'cr' ? (
              <>
                <ShieldAlert size={14} color="var(--color-warning)" />
                <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>Class Representative Portal</span>
              </>
            ) : (
              <>
                <BookOpen size={14} color="var(--color-primary)" />
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Student Portal</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile styling overrides */}
      <style>{`
        @media (max-width: 768px) {
          .header-mobile-adjust {
            left: 0 !important;
            padding: 0 1rem !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
