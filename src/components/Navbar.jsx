import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Gem, LogOut, User } from "lucide-react"; // Changed Shield to User
import "./Navbar.css";

const Navbar = ({ isAdmin, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Gem className="logo-icon" size={28} />
          <span>GemStore</span>
        </Link>

        <div className="navbar-links">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}
              >
                Dashboard
              </Link>
              <button className="logout-btn" onClick={onLogout} title="Logout">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="nav-link admin-link">
              <User size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
