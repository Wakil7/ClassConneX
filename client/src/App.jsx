import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notices from './pages/Notices';
import Documents from './pages/Documents';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Loader2 } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Data States
  const [notices, setNotices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  // Initialize and check local storage session on mount
  useEffect(() => {
    const localUser = localStorage.getItem('classconnex_user');
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        setUser(parsed);
        setCurrentView('dashboard');
      } catch (e) {
        localStorage.removeItem('classconnex_user');
      }
    }
    setIsAuthLoading(false);
  }, []);

  // Set up API request header interceptor when user state updates
  useEffect(() => {
    if (user && user.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      fetchNotices();
      fetchDocuments();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // Fetch notices
  const fetchNotices = async () => {
    try {
      setNoticesLoading(true);
      const res = await axios.get('/api/notices');
      setNotices(res.data);
    } catch (err) {
      console.error('Error fetching notices:', err.message);
    } finally {
      setNoticesLoading(false);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const res = await axios.get('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Error fetching documents:', err.message);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Handle Authentication Success
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('classconnex_user');
    setUser(null);
    setCurrentView('login');
  };

  // Render view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            notices={notices} 
            documents={documents} 
            onViewChange={setCurrentView} 
          />
        );
      case 'notices':
        return (
          <Notices 
            user={user} 
            notices={notices} 
            onRefresh={fetchNotices} 
            loading={noticesLoading} 
          />
        );
      case 'documents':
        return (
          <Documents 
            user={user} 
            documents={documents} 
            onRefresh={fetchDocuments} 
            loading={documentsLoading} 
          />
        );
      default:
        return <Dashboard user={user} notices={notices} documents={documents} onViewChange={setCurrentView} />;
    }
  };

  // Return Header Title based on view
  const getHeaderTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'notices':
        return 'Notice Board';
      case 'documents':
        return 'Document Hub';
      default:
        return 'ClassConneX';
    }
  };

  if (isAuthLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-main)',
        color: '#fff',
        gap: '1rem'
      }}>
        <Loader2 size={38} className="animate-spin" color="var(--color-primary)" />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Verifying Session...</span>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    if (currentView === 'register') {
      return (
        <Register 
          onAuthSuccess={handleAuthSuccess} 
          onNavigateToLogin={() => setCurrentView('login')} 
        />
      );
    }
    return (
      <Login 
        onAuthSuccess={handleAuthSuccess} 
        onNavigateToRegister={() => setCurrentView('register')} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Layout Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title={getHeaderTitle()} user={user} />
        
        <main className="main-content">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
