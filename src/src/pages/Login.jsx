import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import '../styles/Login.css';

const Login = () => {
  const { login, checkAdminRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /** @param {React.FormEvent} e */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { user: loggedInUser, error: loginError } = await login(email, password);
    
    if (loginError) {
      setError(loginError);
      setPassword('');
      setLoading(false);
    } else if (loggedInUser) {
      // Check admin status immediately to decide redirection
      const isUserAdmin = await checkAdminRole(loggedInUser.id, loggedInUser.email ?? '');
      setLoading(false);
      navigate(isUserAdmin ? '/admin' : '/');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">💎</div>
        <h2>Sign In</h2>
        <p className="auth-subtitle">Access your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="user@example.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/admin/forgot-password" className="auth-link">Forgot password?</Link>
          <span className="auth-divider">·</span>
          <Link to="/register" className="auth-link">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
