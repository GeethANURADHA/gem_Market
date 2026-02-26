import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Gem, LogOut, User, ChevronDown, ChevronRight, Shield } from "lucide-react";
import { useAuth } from "../context/authContext";
import { gemstoneTypeService } from "../services/gemstoneTypeService";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [varieties, setVarieties] = useState(/** @type {string[]} */ ([]));

  useEffect(() => {
    const loadVarieties = async () => {
      try {
        const types = await gemstoneTypeService.getAll();
        setVarieties(types.map(t => t.name));
      } catch (err) {
        console.error("Failed to load varieties for navbar:", err);
      }
    };
    loadVarieties();
  }, []);

  /** @param {string} filterValue */
  const handleFilterClick = (filterValue) => {
    navigate(`/gems?filter=${encodeURIComponent(filterValue)}`);
    setIsMegaMenuOpen(false); // Close menu on click
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          <Gem className="logo-icon" size={28} />
          <span>GEMVAULT</span>
        </Link>

        {/* MAIN NAVIGATION & MEGA MENU */}
        <div className="navbar-center-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/gems" className="nav-link">
            Gems
          </Link>

          {/* Categories Dropdown Trigger */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <span className="nav-link dropdown-trigger">
              Categories <ChevronDown size={14} style={{ marginTop: "2px" }} />
            </span>

            {/* Mega Menu Content */}
            <div className={`mega-menu ${isMegaMenuOpen ? "show" : ""}`}>
              <div className="mega-menu-grid">
                {/* 1. Gem Lankan */}
                <div className="mega-col">
                  <h4>Gem Lankan</h4>
                  <ul>
                    <li onClick={() => handleFilterClick("All Precious Gems")}>
                      <ChevronRight size={14} className="chevron" /> All
                      Precious Gems
                    </li>
                    <li onClick={() => handleFilterClick("All Semi Precious")}>
                      <ChevronRight size={14} className="chevron" /> All Semi
                      Precious
                    </li>
                    <li onClick={() => handleFilterClick("Natural Gemstones")}>
                      <ChevronRight size={14} className="chevron" /> Natural
                      Gemstones
                    </li>
                    <li onClick={() => handleFilterClick("Heated Gemstones")}>
                      <ChevronRight size={14} className="chevron" /> Heated
                      Gemstones
                    </li>
                    <li onClick={() => handleFilterClick("All Pair Gems")}>
                      <ChevronRight size={14} className="chevron" /> All Pair
                      Gems
                    </li>
                    <li onClick={() => handleFilterClick("Ceylon")}>
                      <ChevronRight size={14} className="chevron" /> Ceylon Gems
                    </li>
                    <li onClick={() => handleFilterClick("Mozambique")}>
                      <ChevronRight size={14} className="chevron" /> Mozambique
                      Gems
                    </li>
                    <li onClick={() => handleFilterClick("Madagascar")}>
                      <ChevronRight size={14} className="chevron" /> Madagascar
                      Gems
                    </li>
                    <li onClick={() => handleFilterClick("Tanzania")}>
                      <ChevronRight size={14} className="chevron" /> Tanzania
                      Gems
                    </li>
                    <li onClick={() => handleFilterClick("Kenya")}>
                      <ChevronRight size={14} className="chevron" /> Kenya Gems
                    </li>
                  </ul>
                </div>

                {/* 2. Cut Shapes */}
                <div className="mega-col">
                  <h4>Cut Shapes</h4>
                  <ul>
                    <li onClick={() => handleFilterClick("Round Cut")}>
                      <ChevronRight size={14} className="chevron" /> Round Cut
                    </li>
                    <li onClick={() => handleFilterClick("Radiant Cut")}>
                      <ChevronRight size={14} className="chevron" /> Radiant Cut
                    </li>
                    <li onClick={() => handleFilterClick("Oval Cut")}>
                      <ChevronRight size={14} className="chevron" /> Oval Cut
                    </li>
                    <li onClick={() => handleFilterClick("Heart Cut")}>
                      <ChevronRight size={14} className="chevron" /> Heart Cut
                    </li>
                    <li onClick={() => handleFilterClick("Cushion Cut")}>
                      <ChevronRight size={14} className="chevron" /> Cushion Cut
                    </li>
                    <li onClick={() => handleFilterClick("Emerald Cut")}>
                      <ChevronRight size={14} className="chevron" /> Emerald Cut
                    </li>
                    <li onClick={() => handleFilterClick("Pear Cut")}>
                      <ChevronRight size={14} className="chevron" /> Pear Cut
                    </li>
                    <li onClick={() => handleFilterClick("Cabochon Cut")}>
                      <ChevronRight size={14} className="chevron" /> Cabochon
                      Cut
                    </li>
                    <li onClick={() => handleFilterClick("Princess Cut")}>
                      <ChevronRight size={14} className="chevron" /> Princess
                      Cut
                    </li>
                  </ul>
                </div>

                {/* 3. Varieties */}
                <div className="mega-col">
                  <h4>Varieties</h4>
                  <ul>
                    {varieties.map(variety => (
                      <li key={variety} onClick={() => handleFilterClick(variety)}>
                        <ChevronRight size={14} className="chevron" /> {variety}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Colour */}
                <div className="mega-col">
                  <h4>Colour</h4>
                  <ul>
                    <li onClick={() => handleFilterClick("Blue")}>
                      <ChevronRight size={14} className="chevron" /> Blue
                    </li>
                    <li onClick={() => handleFilterClick("Brown")}>
                      <ChevronRight size={14} className="chevron" /> Brown
                    </li>
                    <li onClick={() => handleFilterClick("Green")}>
                      <ChevronRight size={14} className="chevron" /> Green
                    </li>
                    <li onClick={() => handleFilterClick("Orange")}>
                      <ChevronRight size={14} className="chevron" /> Orange
                    </li>
                    <li onClick={() => handleFilterClick("Peach")}>
                      <ChevronRight size={14} className="chevron" /> Peach
                    </li>
                    <li onClick={() => handleFilterClick("Pink")}>
                      <ChevronRight size={14} className="chevron" /> Pink
                    </li>
                    <li onClick={() => handleFilterClick("Red")}>
                      <ChevronRight size={14} className="chevron" /> Red
                    </li>
                    <li onClick={() => handleFilterClick("Violet")}>
                      <ChevronRight size={14} className="chevron" /> Violet
                    </li>
                    <li onClick={() => handleFilterClick("White")}>
                      <ChevronRight size={14} className="chevron" /> White
                    </li>
                    <li onClick={() => handleFilterClick("Yellow")}>
                      <ChevronRight size={14} className="chevron" /> Yellow
                    </li>
                  </ul>
                </div>

                {/* 5. Carat */}
                <div className="mega-col">
                  <h4>Carat</h4>
                  <ul>
                    <li
                      onClick={() => handleFilterClick("Points (Below 1.00)")}
                    >
                      <ChevronRight size={14} className="chevron" /> Points
                      (Below 1.00)
                    </li>
                    <li onClick={() => handleFilterClick("1.00 To 1.49 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 1.00 To
                      1.49 Carat
                    </li>
                    <li onClick={() => handleFilterClick("1.50 To 1.99 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 1.50 To
                      1.99 Carat
                    </li>
                    <li onClick={() => handleFilterClick("2.00 To 2.49 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 2.00 To
                      2.49 Carat
                    </li>
                    <li onClick={() => handleFilterClick("2.50 To 2.99 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 2.50 To
                      2.99 Carat
                    </li>
                    <li onClick={() => handleFilterClick("3.00 To 3.49 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 3.00 To
                      3.49 Carat
                    </li>
                    <li onClick={() => handleFilterClick("3.50 To 3.99 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 3.50 To
                      3.99 Carat
                    </li>
                    <li onClick={() => handleFilterClick("4.00 To 4.49 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 4.00 To
                      4.49 Carat
                    </li>
                    <li onClick={() => handleFilterClick("4.50 To 4.99 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 4.50 To
                      4.99 Carat
                    </li>
                    <li onClick={() => handleFilterClick("5.00 To 5.99 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 5.00 To
                      5.99 Carat
                    </li>
                    <li onClick={() => handleFilterClick("6.00 To 6.99 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 6.00 To
                      6.99 Carat
                    </li>
                    <li onClick={() => handleFilterClick("7.00 To 7.99 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 7.00 To
                      7.99 Carat
                    </li>
                    <li onClick={() => handleFilterClick("8.00 To 8.99 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 8.00 To
                      8.99 Carat
                    </li>
                    <li onClick={() => handleFilterClick("9.00 To 9.99 Carat")}>
                      <ChevronRight size={14} className="chevron" /> 9.00 To
                      9.99 Carat
                    </li>
                    <li onClick={() => handleFilterClick("Above 10.00 Carat")}>
                      <ChevronRight size={14} className="chevron" /> Above 10.00
                      Carat
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Link to="/" className="nav-link">
            Featured
          </Link>
        </div>

        {/* RIGHT ACTION LINKS */}
        <div className="navbar-links">
          {user ? (
            <>
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/manage"
                    className={`nav-link ${location.pathname === "/admin/manage" ? "active" : ""}`}
                    title="Manage Admins"
                  >
                    <Shield size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Manage
                  </Link>
                </>
              )}
              <button className="logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="admin-link">
              <User size={18} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
