import React from 'react';
import { Calendar, Trash2, Download, FileText, Clock, AlertTriangle } from 'lucide-react';

const NoticeCard = ({ notice, currentUser, onDelete }) => {
  const isCR = currentUser && currentUser.role === 'cr';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getNoticeTheme = () => {
    switch (notice.category) {
      case 'deadline':
        return { border: 'rgba(248, 113, 113, 0.3)', badge: 'badge-deadline', icon: Clock };
      case 'event':
        return { border: 'rgba(251, 191, 36, 0.3)', badge: 'badge-event', icon: Calendar };
      default:
        return { border: 'rgba(99, 102, 241, 0.3)', badge: 'badge-announcement', icon: FileText };
    }
  };

  const theme = getNoticeTheme();
  const IconComponent = theme.icon;

  return (
    <div 
      className="glass-panel glass-panel-hover" 
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        borderLeft: `4px solid ${notice.category === 'deadline' ? 'var(--color-danger)' : notice.category === 'event' ? 'var(--color-warning)' : 'var(--color-primary)'}`,
        position: 'relative'
      }}
    >
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span className={`badge ${theme.badge}`} style={{ width: 'fit-content' }}>
            {notice.category}
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            {notice.title}
          </h3>
        </div>

        {isCR && (
          <button 
            onClick={() => onDelete(notice._id)}
            style={{
              padding: '0.4rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'color 0.2s ease',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            title="Delete Announcement"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <p style={{ 
        fontSize: '0.9rem', 
        color: 'var(--text-secondary)', 
        lineHeight: 1.6,
        whiteSpace: 'pre-line' 
      }}>
        {notice.content}
      </p>

      {/* Conditional date details (e.g. deadline date / event date) */}
      {(notice.category === 'deadline' && notice.deadlineDate) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 0.8rem',
          backgroundColor: 'rgba(248, 113, 113, 0.08)',
          border: '1px solid rgba(248, 113, 113, 0.15)',
          borderRadius: '6px',
          color: 'var(--color-danger)',
          fontSize: '0.85rem',
          fontWeight: 600,
          width: 'fit-content'
        }}>
          <AlertTriangle size={14} />
          <span>Deadline: {formatDate(notice.deadlineDate)}</span>
        </div>
      )}

      {(notice.category === 'event' && notice.eventDate) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 0.8rem',
          backgroundColor: 'rgba(251, 191, 36, 0.08)',
          border: '1px solid rgba(251, 191, 36, 0.15)',
          borderRadius: '6px',
          color: 'var(--color-warning)',
          fontSize: '0.85rem',
          fontWeight: 600,
          width: 'fit-content'
        }}>
          <Calendar size={14} />
          <span>Event Date: {formatDate(notice.eventDate)}</span>
        </div>
      )}

      {/* Attachment Section */}
      {notice.fileUrl && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          marginTop: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <FileText size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <span style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {notice.fileName || 'Attachment'}
            </span>
          </div>
          
          <a 
            href={notice.fileUrl}
            download={notice.fileName || 'Attachment'}
            className="btn btn-secondary btn-small"
            style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={12} />
            Download
          </a>
        </div>
      )}

      {/* Footer Info */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <span>Posted by: {notice.createdBy?.name || 'CR'}</span>
        <span>{formatDate(notice.createdAt)}</span>
      </div>
    </div>
  );
};

export default NoticeCard;
