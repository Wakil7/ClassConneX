import React, { useState } from 'react';
import axios from 'axios';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Login = ({ onAuthSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await axios.post('/api/auth/login', { email, password });
      
      // Store user details in localStorage
      localStorage.setItem('classconnex_user', JSON.stringify(res.data));
      
      // Call parent success trigger
      onAuthSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        {/* Header Branding */}
        <div className="auth-header">
          <div className="auth-logo">
            <GraduationCap size={32} />
            <span>ClassConneX</span>
          </div>
          <p className="auth-subtitle">Centralized Student Notices & Document Hub</p>
        </div>

        {/* Error Feedback */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)' 
                }} 
              />
              <input 
                type="email" 

                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)' 
                }} 
              />
              <input 
                type="password" 

                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', height: '42px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Auth Footer Links */}
        <div className="auth-footer">
          Don't have an account?{' '}
          <button 
            onClick={onNavigateToRegister} 
            className="auth-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Create Account
          </button>
        </div>
      </div>

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

export default Login;
