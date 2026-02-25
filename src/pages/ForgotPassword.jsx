import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(/** @type {'idle'|'loading'|'sent'|'error'} */ ('idle'));
  const [message, setMessage] = useState('');

  /** @param {React.FormEvent} e */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      setMessage(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Forgot Password</h2>

        {status === 'sent' ? (
          <div className="success-message">
            <span className="success-icon">✉</span>
            <p>Password reset link sent to <strong>{email}</strong></p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              Check your Gmail inbox (and spam folder). Click the link to reset your password.
            </p>
            <div style={{ marginTop: '1.2rem' }}>
              <Link to="/admin/login" className="auth-link">← Back to Login</Link>
            </div>
          </div>
        ) : (
          <>
            <p className="auth-subtitle">
              Enter your admin email and we'll send you a password reset link via Gmail.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setMessage(''); }}
                  placeholder="your@gmail.com"
                  required
                  autoFocus
                />
              </div>

              {status === 'error' && <div className="error-message">{message}</div>}

              <button type="submit" className="login-btn" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="auth-links">
              <Link to="/admin/login" className="auth-link">← Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
