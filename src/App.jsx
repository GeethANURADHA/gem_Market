import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import GemDetails from './pages/GemDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddEdit from './pages/AdminAddEdit';
import AdminLogin from './pages/AdminLogin';
import './styles/index.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  return (
    <Router>
      <div className="app">
        <Navbar isAdmin={isAdmin} onLogout={handleLogout} />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Home isAdmin={isAdmin} />} />
            <Route path="/gems/:id" element={<GemDetails />} />
            
            <Route 
              path="/admin/login" 
              element={!isAdmin ? <AdminLogin onLogin={handleLogin} /> : <Navigate to="/admin" replace />} 
            />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} 
            />
            <Route 
              path="/admin/add" 
              element={isAdmin ? <AdminAddEdit /> : <Navigate to="/admin/login" replace />} 
            />
            <Route 
              path="/admin/edit/:id" 
              element={isAdmin ? <AdminAddEdit /> : <Navigate to="/admin/login" replace />} 
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
