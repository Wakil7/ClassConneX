import React from 'react';
import { Download, Trash2, FileCode, FileType, Layers, BookOpen, HardDrive, Calendar } from 'lucide-react';

const DocumentCard = ({ document: doc, currentUser, onDelete }) => {
  const isCR = currentUser && currentUser.role === 'cr';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryDetails = (cat) => {
    switch (cat) {
      case 'notes':
        return { label: 'Lecture Notes', style: 'badge-notes' };
      case 'assignment':
        return { label: 'Assignment', style: 'badge-assignment' };
      case 'study_material':
        return { label: 'Study Material', style: 'badge-study_material' };
      case 'pyq':
        return { label: 'PYQ (Previous Paper)', style: 'badge-pyq' };
      default:
        return { label: 'Document', style: 'badge-notes' };
    }
  };

  const catDetails = getCategoryDetails(doc.category);

  return (
    <div 
      className="glass-panel glass-panel-hover" 
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}
    >
      {/* Category Badge & CR Delete Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`badge ${catDetails.style}`}>
          {catDetails.label}
        </span>
        
        {isCR && (
          <button 
            onClick={() => onDelete(doc._id)}
            style={{
              padding: '0.35rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'color 0.2s ease',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            title="Delete Document"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Main Details */}
      <div>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: 600, 
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          marginBottom: '0.25rem' 
        }}>
          {doc.title}
        </h3>
        
        {doc.description && (
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            marginBottom: '0.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {doc.description}
          </p>
        )}
      </div>

      {/* Course Info */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.6rem 0.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
          <BookOpen size={13} color="var(--color-primary)" />
          <span style={{ fontWeight: 550, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doc.subjectName}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Code:</span>
          <span>{doc.subjectCode}</span>
        </div>
      </div>

      {/* Metadata (File Size & Upload Date) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        marginTop: '0.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <HardDrive size={12} color="var(--text-muted)" />
          <span>{doc.fileSize || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={12} color="var(--text-muted)" />
          <span>{formatDate(doc.createdAt)}</span>
        </div>
      </div>

      {/* Download Action Wrapper */}
      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '0.75rem', 
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          CR: {doc.uploadedBy?.name || 'Class Rep'}
        </span>

        <a 
          href={doc.fileUrl} 
          download={doc.fileName || 'document'} 
          className="btn btn-primary btn-small"
          style={{ gap: '0.3rem' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download size={13} />
          Get File
        </a>
      </div>
    </div>
  );
};

export default DocumentCard;
