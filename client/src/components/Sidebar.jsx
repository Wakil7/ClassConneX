import React from 'react';
import { 
  LayoutDashboard, 
  Bell, 
  FileText, 
  LogOut, 
  GraduationCap, 
  User as UserIcon, 
  ShieldCheck 
} from 'lucide-react';

const Sidebar = ({ currentView, onViewChange, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notices', label: 'Notice Board', icon: Bell },
    { id: 'documents', label: 'Document Hub', icon: FileText }
  ];

  return (
    <aside className="sidebar-container" style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <GraduationCap size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Class<span style={{ color: 'var(--color-primary)' }}>ConneX</span>
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '-2px' }}>
            Centralized Student Hub
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <nav style={{ flexGrow: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.8rem 1rem',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.925rem',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                paddingLeft: isActive ? 'calc(1rem - 3px)' : '1rem'
              }}
              className={!isActive ? 'sidebar-btn-hover' : ''}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Info & Footer */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <UserIcon size={18} />
            </div>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ 
                  fontWeight: 600, 
                  fontSize: '0.85rem', 
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  maxWidth: '120px'
                }}>
                  {user.name}
                </span>
                {user.role === 'cr' && (
                  <ShieldCheck size={14} color="var(--color-success)" style={{ flexShrink: 0 }} title="Class Representative" />
                )}
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user.registerNumber}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.6rem',
            backgroundColor: 'rgba(248, 113, 113, 0.05)',
            border: '1px solid rgba(248, 113, 113, 0.1)',
            borderRadius: '6px',
            color: 'var(--color-danger)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-danger)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.05)';
            e.currentTarget.style.color = 'var(--color-danger)';
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      {/* Dynamic Hover Styles */}
      <style>{`
        .sidebar-btn-hover:hover {
          background-color: rgba(255, 255, 255, 0.03) !important;
          color: var(--text-primary) !important;
          padding-left: 1.25rem !important;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
