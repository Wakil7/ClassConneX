import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Search, Calendar, FileText, Loader2, X, PlusCircle, AlertTriangle, Paperclip } from 'lucide-react';
import NoticeCard from '../components/NoticeCard';

const Notices = ({ user, notices, onRefresh, loading }) => {
  const isCR = user && user.role === 'cr';

  // Filters state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('announcement');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [file, setFile] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Create notice handler
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!title || !content || !category) {
      setFormError('Please fill in title, content and category');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      
      if (category === 'deadline' && deadlineDate) {
        formData.append('deadlineDate', deadlineDate);
      }
      if (category === 'event' && eventDate) {
        formData.append('eventDate', eventDate);
      }
      if (file) {
        formData.append('file', file);
      }

      // Fetch user token
      const localUserData = localStorage.getItem('classconnex_user');
      const token = localUserData ? JSON.parse(localUserData).token : '';

      await axios.post('/api/notices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Clear Form & Close Modal
      setTitle('');
      setContent('');
      setCategory('announcement');
      setDeadlineDate('');
      setEventDate('');
      setFile(null);
      setIsModalOpen(false);

      // Refresh list
      onRefresh();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create notice. Try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete notice handler
  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      const localUserData = localStorage.getItem('classconnex_user');
      const token = localUserData ? JSON.parse(localUserData).token : '';

      await axios.delete(`/api/notices/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete notice.');
    }
  };

  // Filter notices
  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.content.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || n.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Notice Board Actions Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left Side: Filter Toggles */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'announcement', 'deadline', 'event'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn btn-small ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {cat === 'all' ? 'All Notices' : cat}
            </button>
          ))}
        </div>

        {/* Right Side: Post Action for CR */}
        {isCR && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem' }}
          >
            <Plus size={16} />
            Post Notice
          </button>
        )}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', width: '100%' }}>
        <Search 
          size={18} 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)' 
          }} 
        />
        <input
          type="text"
          placeholder="Search announcements, event details, or deadlines..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.6rem' }}
        />
      </div>

      {/* Notice List Feed */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', flexDirection: 'column', gap: '0.5rem' }}>
          <Loader2 size={32} className="animate-spin" color="var(--color-primary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading notices...</span>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No notices found matching your criteria.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredNotices.map((notice) => (
            <NoticeCard 
              key={notice._id}
              notice={notice}
              currentUser={user}
              onDelete={handleDeleteNotice}
            />
          ))}
        </div>
      )}

      {/* CREATE NOTICE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            {/* Modal Header */}
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={20} color="var(--color-primary)" />
                Post Announcement
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateNotice}>
              <div className="modal-body">
                {formError && <div className="alert alert-danger">{formError}</div>}

                <div className="form-group">
                  <label className="form-label">Notice Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Mid-Sem Exam Timetable Released"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notice Content</label>
                  <textarea 
                    placeholder="Provide details about dates, requirements, rooms, or other criteria..."
                    className="form-control"
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notice Category</label>
                  <select 
                    className="form-control" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="announcement">General Announcement</option>
                    <option value="deadline">Submission / Deadline</option>
                    <option value="event">Class Event / Activity</option>
                  </select>
                </div>

                {/* Conditional Deadline Date Field */}
                {category === 'deadline' && (
                  <div className="form-group" style={{ animation: 'slideUp 0.15s ease-out' }}>
                    <label className="form-label" style={{ color: 'var(--color-danger)' }}>Due Date</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                      style={{ borderColor: 'rgba(248, 113, 113, 0.4)' }}
                      required
                    />
                  </div>
                )}

                {/* Conditional Event Date Field */}
                {category === 'event' && (
                  <div className="form-group" style={{ animation: 'slideUp 0.15s ease-out' }}>
                    <label className="form-label" style={{ color: 'var(--color-warning)' }}>Event Date</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      style={{ borderColor: 'rgba(251, 191, 36, 0.4)' }}
                      required
                    />
                  </div>
                )}

                {/* Optional File Attachment */}
                <div className="form-group">
                  <label className="form-label">Attachment (Optional)</label>
                  <div style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                  }}>
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <Paperclip size={20} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {file ? file.name : 'Click to select or drag file here'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      (PDF, Docx, Slides, Images up to 50MB)
                    </span>
                  </div>
                </div>

              </div>

              {/* Modal Footer actions */}
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Publishing...
                    </>
                  ) : 'Publish Notice'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Notices;
