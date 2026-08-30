import React, { useState } from 'react';
import axios from 'axios';
import { Search, Plus, Filter, BookOpen, FileUp, X, Loader2, FileCode, CheckCircle } from 'lucide-react';
import DocumentCard from '../components/DocumentCard';

const Documents = ({ user, documents, onRefresh, loading }) => {
  const isCR = user && user.role === 'cr';

  // Filters state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [category, setCategory] = useState('notes');
  const [file, setFile] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Handle file select
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload document handler
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!title || !subjectName || !subjectCode || !category) {
      setFormError('Please fill in title, subject details, and category');
      return;
    }

    if (!file) {
      setFormError('Please select a document file to upload');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subjectName', subjectName);
      formData.append('subjectCode', subjectCode);
      formData.append('category', category);
      formData.append('file', file);

      // Fetch user token
      const localUserData = localStorage.getItem('classconnex_user');
      const token = localUserData ? JSON.parse(localUserData).token : '';

      await axios.post('/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Clear Form & Close Modal
      setTitle('');
      setDescription('');
      setSubjectName('');
      setSubjectCode('');
      setCategory('notes');
      setFile(null);
      setIsModalOpen(false);

      // Refresh list
      onRefresh();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to upload document. Try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete document handler
  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this document?')) return;

    try {
      const localUserData = localStorage.getItem('classconnex_user');
      const token = localUserData ? JSON.parse(localUserData).token : '';

      await axios.delete(`/api/documents/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || 
                          d.description.toLowerCase().includes(search.toLowerCase()) || 
                          d.subjectName.toLowerCase().includes(search.toLowerCase()) || 
                          d.subjectCode.toLowerCase().includes(search.toLowerCase());
    
    const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Category Tabs & Upload Trigger */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Files' },
            { id: 'notes', label: 'Lecture Notes' },
            { id: 'assignment', label: 'Assignments' },
            { id: 'study_material', label: 'Study Material' },
            { id: 'pyq', label: 'PYQs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`btn btn-small ${categoryFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload Trigger for CR */}
        {isCR && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem' }}
          >
            <Plus size={16} />
            Upload File
          </button>
        )}
      </div>

      {/* Search Input bar */}
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
          placeholder="Search by title, subject, code, or description..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.6rem' }}
        />
      </div>

      {/* Document Grid Container */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', flexDirection: 'column', gap: '0.5rem' }}>
          <Loader2 size={32} className="animate-spin" color="var(--color-primary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading files...</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No documents uploaded yet for this selection.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredDocuments.map((doc) => (
            <DocumentCard 
              key={doc._id}
              document={doc}
              currentUser={user}
              onDelete={handleDeleteDocument}
            />
          ))}
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            {/* Modal Header */}
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileUp size={20} color="var(--color-primary)" />
                Upload Document
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleUploadDocument}>
              <div className="modal-body">
                {formError && <div className="alert alert-danger">{formError}</div>}

                <div className="form-group">
                  <label className="form-label">Document Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Computer Networks Lecture 5 slides"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Briefly describe file contents..."
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Subject name & code */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Subject Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Computer Networks"
                      className="form-control"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g., CS-602"
                      className="form-control"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Category Selector */}
                <div className="form-group">
                  <label className="form-label">File Category</label>
                  <select 
                    className="form-control" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="notes">Lecture Notes</option>
                    <option value="assignment">Assignment File</option>
                    <option value="study_material">General Study Material</option>
                    <option value="pyq">PYQ (Previous Year Paper)</option>
                  </select>
                </div>

                {/* File Attachment field */}
                <div className="form-group">
                  <label className="form-label">Select File to Upload</label>
                  <div style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: '8px',
                    padding: '1.25rem',
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
                      required
                    />
                    <FileUp size={22} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {file ? file.name : 'Choose file or drag & drop here'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      (Supports PDFs, DOCX, PPTX, TXT, Images, ZIP up to 50MB)
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
                      Uploading File...
                    </>
                  ) : 'Upload File'}
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

export default Documents;
