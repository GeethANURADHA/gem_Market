import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/Login.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(/** @type {'idle'|'loading'|'success'|'error'|'invalid'} */ ('idle'));
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Supabase puts the recovery tokens in the URL hash after clicking the email link
    // onAuthStateChange fires with event 'PASSWORD_RECOVERY' when the user lands here
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Recovery logic is handled by setting status or other state if needed
      }
    });

    // Check if there are tokens in the hash (user just arrived from email link)
    const hash = window.location.hash;
    if (!hash.includes('access_token') && !hash.includes('type=recovery')) {
      // No recovery tokens — this page was accessed directly
      setStatus('invalid');
    }

    return () => subscription.unsubscribe();
  }, []);

  /** @param {React.FormEvent} e */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      setStatus('error');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setStatus('error');
    } else {
      setStatus('success');
      setTimeout(() => navigate('/admin/login'), 3000);
    }
  };

  if (status === 'invalid') {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Invalid Link</h2>
          <div className="error-message">
            This password reset link is invalid or has expired. Please request a new one.
          </div>
          <div className="auth-links" style={{ marginTop: '1rem' }}>
            <Link to="/admin/forgot-password" className="auth-link">Request New Link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Reset Password</h2>

        {status === 'success' ? (
          <div className="success-message">
            <span className="success-icon">✓</span>
            <p>Password updated successfully!</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <p className="auth-subtitle">Enter your new password below.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setMessage(''); }}
                  placeholder="Minimum 6 characters"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm">Confirm Password</label>
                <input
                  type="password"
                  id="confirm"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setMessage(''); }}
                  placeholder="Repeat new password"
                  required
                />
              </div>

              {status === 'error' && <div className="error-message">{message}</div>}

              <button type="submit" className="login-btn" disabled={status === 'loading'}>
                {status === 'loading' ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
