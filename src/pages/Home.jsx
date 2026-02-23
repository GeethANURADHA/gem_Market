import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import GemCard from "../components/GemCard";
import GemCanvas from "../components/GemCanvas";
import { gemService } from "../services/gemService";
import "./Home.css";

const Home = () => {
  const [collapsed, setCollapsed] = useState(true); // Start hidden by default
  const [gems, setGems] = useState([]);
  const [filteredGems, setFilteredGems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(5000);
  const navigate = useNavigate();

  useEffect(() => {
    const all = gemService.getAll();
    setGems(all);
    setFilteredGems(all);
  }, []);

  useEffect(() => {
    let result = gems;

    if (searchQuery) {
      result = result.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((g) => g.category === selectedCategory);
    }

    result = result.filter((g) => g.price <= maxPrice);
    setFilteredGems(result);
  }, [searchQuery, selectedCategory, maxPrice, gems]);

  const handleGemClick = (gem) => {
    navigate(`/gems/${gem.id}`);
  };

  return (
    <div className={`home-layout ${collapsed ? "collapsed" : ""}`}>
      {/* FLOATING TOGGLE BUTTON */}
      <button
        className="toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Open Filters" : "Close Filters"}
      >
        {collapsed ? <Menu size={24} /> : <X size={24} />}
      </button>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">GemVault</h2>

        <nav className="nav-menu">
          <button className="nav-item">🏠 Home</button>
          <button className="nav-item">💎 Gems</button>
          <button className="nav-item">⭐ Featured</button>
        </nav>

        <div className="divider" />

        <div className="filters">
          <h3>Filters</h3>

          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Precious">Precious</option>
            <option value="Semi-Precious">Semi-Precious</option>
            <option value="Organic">Organic</option>
            <option value="Synthetic">Synthetic</option>
          </select>

          <label>Max Price: ${maxPrice.toLocaleString()}</label>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>
      </aside>

      {/* CONTENT */}
      <div className="content">
        <section className="hero">
          <h1>Exquisite Gemstones</h1>
          <p>Scroll to watch the gemstone transform</p>
        </section>

        <GemCanvas />

        <main className="gems-grid">
          {filteredGems.map((gem) => (
            <GemCard key={gem.id} gem={gem} onClick={handleGemClick} />
          ))}
          {filteredGems.length === 0 && (
            <div className="no-gems-message">
              No gems found matching your filters.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
