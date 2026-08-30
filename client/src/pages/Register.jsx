import React, { useState } from 'react';
import axios from 'axios';
import { GraduationCap, Mail, Lock, User as UserIcon, ShieldCheck, KeyRound, Loader2, ArrowRight } from 'lucide-react';

const Register = ({ onAuthSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'cr'
  const [crSecret, setCrSecret] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !rollNumber) {
      setError('Please fill in all standard fields');
      return;
    }

    if (role === 'cr' && !crSecret) {
      setError('Please enter the CR Secret Code to verify your representative authority');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const payload = {
        name,
        email,
        password,
        rollNumber,
        crSecret: role === 'cr' ? crSecret : ''
      };

      const res = await axios.post('/api/auth/register', payload);
      
      // Store user details in localStorage
      localStorage.setItem('classconnex_user', JSON.stringify(res.data));
      
      // Call parent success trigger
      onAuthSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card" style={{ maxWidth: '500px' }}>
        {/* Header Branding */}
        <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
          <div className="auth-logo">
            <GraduationCap size={32} />
            <span>ClassConneX</span>
          </div>
          <p className="auth-subtitle">Join the student centralized communication space</p>
        </div>

        {/* Error Feedback */}
        {error && <div className="alert alert-danger" style={{ padding: '0.6rem 0.8rem', fontSize: '0.8rem' }}>{error}</div>}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <UserIcon 
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
                type="text" 

                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
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
              <label className="form-label">Roll Number</label>
              <div style={{ position: 'relative' }}>
                <GraduationCap 
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
                  type="text" 

                  className="form-control"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
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

          {/* Role Toggle Selector */}
          <div className="form-group">
            <label className="form-label">Sign Up As</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.75rem',
                border: '1px solid ' + (role === 'student' ? 'var(--color-primary)' : 'var(--border-color)'),
                borderRadius: '8px',
                backgroundColor: role === 'student' ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: role === 'student' ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="student" 
                  checked={role === 'student'} 
                  onChange={() => setRole('student')}
                  style={{ display: 'none' }}
                />
                Student
              </label>

              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.75rem',
                border: '1px solid ' + (role === 'cr' ? 'var(--color-warning)' : 'var(--border-color)'),
                borderRadius: '8px',
                backgroundColor: role === 'cr' ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: role === 'cr' ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="cr" 
                  checked={role === 'cr'} 
                  onChange={() => setRole('cr')}
                  style={{ display: 'none' }}
                />
                <ShieldCheck size={16} color={role === 'cr' ? 'var(--color-warning)' : 'var(--text-secondary)'} />
                Class Representative
              </label>
            </div>
          </div>

          {/* CR Secret Code Input */}
          {role === 'cr' && (
            <div className="form-group" style={{ animation: 'slideUp 0.2s ease-out' }}>
              <label className="form-label" style={{ color: 'var(--color-warning)' }}>CR Access Passcode</label>
              <div style={{ position: 'relative' }}>
                <KeyRound 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'var(--color-warning)' 
                  }} 
                />
                <input 
                  type="text" 

                  className="form-control"
                  value={crSecret}
                  onChange={(e) => setCrSecret(e.target.value)}
                  style={{ paddingLeft: '2.5rem', borderColor: 'var(--color-warning)' }}
                  required
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                💡 Only authorised Class Representatives can use this field.
              </span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', height: '42px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Registering Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Auth Footer Links */}
        <div className="auth-footer" style={{ marginTop: '1.25rem' }}>
          Already have an account?{' '}
          <button 
            onClick={onNavigateToLogin} 
            className="auth-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
