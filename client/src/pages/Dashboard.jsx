import React from 'react';
import { 
  Bell, 
  FileText, 
  Clock, 
  Download, 
  Calendar, 
  GraduationCap, 
  ShieldAlert, 
  BookOpen,
  ChevronRight
} from 'lucide-react';
import NoticeCard from '../components/NoticeCard';
import DocumentCard from '../components/DocumentCard';

const Dashboard = ({ user, notices, documents, onViewChange }) => {
  // Calculations
  const totalNotices = notices.length;
  const totalDocs = documents.length;
  const deadlines = notices.filter(n => n.category === 'deadline');
  const upcomingDeadlines = deadlines
    .filter(n => n.deadlineDate && new Date(n.deadlineDate) >= new Date())
    .sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate));
    
  const lectureNotesCount = documents.filter(d => d.category === 'notes').length;
  const assignmentsCount = documents.filter(d => d.category === 'assignment').length;
  const studyMaterialsCount = documents.filter(d => d.category === 'study_material').length;
  const pyqsCount = documents.filter(d => d.category === 'pyq').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Message Card */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>
            Welcome back, {user?.name}! 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', maxWidth: '600px', lineHeight: 1.5 }}>
            You are logged in as a <strong>{user?.role === 'cr' ? 'Class Representative (CR)' : 'Student'}</strong>. 
            Keep track of class announcements, document archives, course notes, and assignments here.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => onViewChange('notices')} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <Bell size={15} />
            Check Board
          </button>
          <button onClick={() => onViewChange('documents')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <FileText size={15} />
            Explore Hub
          </button>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Notices */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <Bell size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Announcements</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2px' }}>{totalNotices}</h3>
          </div>
        </div>

        {/* Deadlines */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(248, 113, 113, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-danger)'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Deadlines</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2px' }}>{upcomingDeadlines.length}</h3>
          </div>
        </div>

        {/* Notes & Slides */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa'
          }}>
            <BookOpen size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lectures & Slides</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2px' }}>{lectureNotesCount}</h3>
          </div>
        </div>

        {/* PYQs */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(236, 72, 153, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f472b6'
          }}>
            <FileText size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PYQ Papers</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2px' }}>{pyqsCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Dashboard Panel Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '1.5rem'
      }} className="dashboard-grid-mobile">
        
        {/* Left Side: Recent Notices Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--color-primary)" />
              Recent Announcements
            </h3>
            <button 
              onClick={() => onViewChange('notices')} 
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.1rem'
              }}
            >
              See All Board
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notices.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active announcements right now. Check back later!
              </div>
            ) : (
              notices.slice(0, 3).map((notice) => (
                <NoticeCard 
                  key={notice._id} 
                  notice={notice} 
                  currentUser={user} 
                  onDelete={() => onViewChange('notices')} 
                />
              ))
            )}
          </div>
        </div>

        {/* Right Side: Upcoming Deadlines & Quick Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Deadlines Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--color-danger)" />
              Upcoming Deadlines
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingDeadlines.length === 0 ? (
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  🎉 No pending deadlines! You are all caught up.
                </div>
              ) : (
                upcomingDeadlines.slice(0, 4).map((dl) => (
                  <div 
                    key={dl._id}
                    className="glass-panel"
                    style={{
                      padding: '1rem',
                      borderLeft: '3px solid var(--color-danger)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dl.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {dl.content.substring(0, 60)}{dl.content.length > 60 ? '...' : ''}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: 'var(--color-danger)',
                      backgroundColor: 'var(--color-danger-bg)',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      {new Date(dl.deadlineDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts / Subjects summary */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Quick Info & Shortcuts
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Assignments pending:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{assignmentsCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Available study notes:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lectureNotesCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Previous Question Papers:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pyqsCount}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .dashboard-grid-mobile {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
