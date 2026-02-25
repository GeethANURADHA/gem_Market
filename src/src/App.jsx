import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import GemDetails from './pages/GemDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddEdit from './pages/AdminAddEdit';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminManage from './pages/AdminManage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Gems from './pages/Gems';
import './styles/index.css';

/**
 * Protected route — redirects to login if not admin
 * @param {{ children: React.ReactNode }} props
 */
const ProtectedRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="auth-loading">Loading...</div>;
  return isAdmin ? children : <Navigate to="/login" replace />;
};

/**
 * Auth route — redirects to dashboard if already logged in as admin
 * @param {{ children: React.ReactNode }} props
 */
const AuthRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="auth-loading">Loading...</div>;
  return isAdmin ? <Navigate to="/admin" replace /> : children;
};

function AppRoutes() {
  const { isAdmin, user, loading } = useAuth();

  if (loading) return <div className="auth-loading">Loading App...</div>;

  console.log('AppRoutes - isAdmin:', isAdmin, 'User:', user?.email);

  return (
    <div className="app">
      <Navbar />
      <div className="content-wrapper">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/gems" element={<Gems />} />
          <Route path="/gems/:id" element={<GemDetails />} />

          {/* Auth pages */}
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />

          {/* Protected admin pages */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/add" element={<ProtectedRoute><AdminAddEdit /></ProtectedRoute>} />
          <Route path="/admin/edit/:id" element={<ProtectedRoute><AdminAddEdit /></ProtectedRoute>} />
          <Route path="/admin/manage" element={<ProtectedRoute><AdminManage /></ProtectedRoute>} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
