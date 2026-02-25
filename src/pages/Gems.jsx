import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight, ChevronDown, ArrowLeft } from "lucide-react";
import GemCard from "../components/GemCard";
import { gemService } from "../services/gemService";
import { useAuth } from "../context/authContext";
import "./Gems.css";

const Gems = () => {
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [gems, setGems] = useState(/** @type {import('../services/gemService').Gem[]} */ ([]));
  const [filteredGems, setFilteredGems] = useState(/** @type {import('../services/gemService').Gem[]} */ ([]));
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000); // Increased max price for flexibility
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedCategories, setExpandedCategories] = useState(/** @type {string[]} */ ([]));

  const navigate = useNavigate();
  const location = useLocation();

  // Load initial gems from Supabase
  useEffect(() => {
    const fetchGems = async () => {
      try {
        setLoading(true);
        const all = await gemService.getAll();
        setGems(all);
        setFilteredGems(all);
      } catch (err) {
        console.error('Failed to load gems:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGems();
  }, []);

  // Listen for URL changes from Navbar
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlFilter = queryParams.get("filter");
    if (urlFilter) {
      setActiveFilter(urlFilter);
    } else {
      setActiveFilter("All");
    }
  }, [location.search]);

  // Main Filtering Logic
  useEffect(() => {
    let result = gems;

    if (searchQuery) {
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (g.description &&
            g.description.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    if (activeFilter !== "All") {
      result = result.filter((g) => {
        if (activeFilter === "All Precious Gems")
          return g.category === "Precious";
        if (activeFilter === "All Semi Precious")
          return g.category === "Semi-Precious";

        if (activeFilter.includes("Carat") || activeFilter.includes("Points")) {
          if (!g.carat) return false;
          if (activeFilter.includes("Below 1.00")) return g.carat < 1.0;
          if (activeFilter.includes("Above 10.00")) return g.carat > 10.0;

          const match = activeFilter.match(/([\d.]+)\s*To\s*([\d.]+)/i);
          if (match) {
            return (
              g.carat >= parseFloat(match[1]) && g.carat <= parseFloat(match[2])
            );
          }
        }

        const term = activeFilter.toLowerCase().replace(/s$/, ""); 
        return (
          g.name.toLowerCase().includes(term) ||
          (g.description && g.description.toLowerCase().includes(term)) ||
          (g.category && g.category.toLowerCase().includes(term))
        );
      });
    }

    result = result.filter((g) => g.price <= maxPrice);
    setFilteredGems(result);
  }, [searchQuery, activeFilter, maxPrice, gems]);

  /** @param {import('../services/gemService').Gem} gem */
  const handleGemClick = (gem) => {
    navigate(`/gems/${gem.id}`);
  };

  /** @param {string} filterValue */
  const handleSidebarFilter = (filterValue) => {
    setActiveFilter(filterValue);
    navigate("/gems", { replace: true });
    if (window.innerWidth <= 850) setCollapsed(true);
  };

  /** @param {string} categoryName */
  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => {
      if (!prev) return [categoryName];
      return prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName];
    });
  };

  return (
    <div className={`gems-layout ${collapsed ? "collapsed" : ""}`}>
      {collapsed && (
        <button
          className="toggle-btn"
          onClick={() => setCollapsed(false)}
          title="Open Filters"
        >
          <Menu size={24} />
        </button>
      )}

      <aside className="sidebar">
        <button
          className="close-btn"
          onClick={() => setCollapsed(true)}
          title="Close Filters"
        >
          <X size={24} />
        </button>

        <h2 className="logo">GEMVAULT</h2>

        <div className="filters">
          <h3 className="filters-title">Filters</h3>

          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input"
          />

          <label className="filter-label">
            Max Price: ${maxPrice.toLocaleString()}
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="filter-range"
          />

          <div className="divider" style={{ margin: "1.5rem 0" }} />

          <div className="sidebar-directory">
            {/* Categories same as Home sidebar */}
            <div className="sidebar-category">
              <h4 onClick={() => toggleCategory("gemLankan")}>
                Gem Lankan
                {expandedCategories.includes("gemLankan") ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </h4>
              <ul className={`category-list ${expandedCategories.includes("gemLankan") ? "expanded" : ""}`}>
                <li onClick={() => handleSidebarFilter("All Precious Gems")}>
                  <ChevronRight size={14} className="chevron" /> All Precious Gems
                </li>
                <li onClick={() => handleSidebarFilter("All Semi Precious")}>
                  <ChevronRight size={14} className="chevron" /> All Semi Precious
                </li>
                <li onClick={() => handleSidebarFilter("Natural Gemstones")}>
                  <ChevronRight size={14} className="chevron" /> Natural Gemstones
                </li>
                <li onClick={() => handleSidebarFilter("Heated Gemstones")}>
                  <ChevronRight size={14} className="chevron" /> Heated Gemstones
                </li>
                <li onClick={() => handleSidebarFilter("All Pair Gems")}>
                  <ChevronRight size={14} className="chevron" /> All Pair Gems
                </li>
                <li onClick={() => handleSidebarFilter("Ceylon")}>
                  <ChevronRight size={14} className="chevron" /> Ceylon Gems
                </li>
              </ul>
            </div>

            <div className="sidebar-category">
              <h4 onClick={() => toggleCategory("cutShapes")}>
                Cut Shapes
                {expandedCategories.includes("cutShapes") ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </h4>
              <ul className={`category-list ${expandedCategories.includes("cutShapes") ? "expanded" : ""}`}>
                <li onClick={() => handleSidebarFilter("Round Cut")}>
                  <ChevronRight size={14} className="chevron" /> Round Cut
                </li>
                <li onClick={() => handleSidebarFilter("Radiant Cut")}>
                  <ChevronRight size={14} className="chevron" /> Radiant Cut
                </li>
                <li onClick={() => handleSidebarFilter("Oval Cut")}>
                  <ChevronRight size={14} className="chevron" /> Oval Cut
                </li>
                <li onClick={() => handleSidebarFilter("Heart Cut")}>
                  <ChevronRight size={14} className="chevron" /> Heart Cut
                </li>
                <li onClick={() => handleSidebarFilter("Cushion Cut")}>
                  <ChevronRight size={14} className="chevron" /> Cushion Cut
                </li>
                <li onClick={() => handleSidebarFilter("Emerald Cut")}>
                  <ChevronRight size={14} className="chevron" /> Emerald Cut
                </li>
                <li onClick={() => handleSidebarFilter("Pear Cut")}>
                  <ChevronRight size={14} className="chevron" /> Pear Cut
                </li>
                <li onClick={() => handleSidebarFilter("Cabochon Cut")}>
                  <ChevronRight size={14} className="chevron" /> Cabochon Cut
                </li>
                <li onClick={() => handleSidebarFilter("Princess Cut")}>
                  <ChevronRight size={14} className="chevron" /> Princess Cut
                </li>
              </ul>
            </div>

            <div className="sidebar-category">
              <h4 onClick={() => toggleCategory("varieties")}>
                Varieties
                {expandedCategories.includes("varieties") ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </h4>
              <ul className={`category-list ${expandedCategories.includes("varieties") ? "expanded" : ""}`}>
                <li onClick={() => handleSidebarFilter("Blue Sapphire")}>
                  <ChevronRight size={14} className="chevron" /> Blue Sapphires
                </li>
                <li onClick={() => handleSidebarFilter("Yellow Sapphire")}>
                  <ChevronRight size={14} className="chevron" /> Yellow Sapphire
                </li>
                <li onClick={() => handleSidebarFilter("Green Sapphire")}>
                  <ChevronRight size={14} className="chevron" /> Green Sapphire
                </li>
                <li onClick={() => handleSidebarFilter("Orange Sapphire")}>
                  <ChevronRight size={14} className="chevron" /> Orange Sapphires
                </li>
                <li onClick={() => handleSidebarFilter("White Sapphire")}>
                  <ChevronRight size={14} className="chevron" /> White Sapphires
                </li>
                <li onClick={() => handleSidebarFilter("Spinel")}>
                  <ChevronRight size={14} className="chevron" /> Spinels
                </li>
              </ul>
            </div>

            <div className="sidebar-category">
              <h4 onClick={() => toggleCategory("colour")}>
                Colour
                {expandedCategories.includes("colour") ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </h4>
              <ul className={`category-list ${expandedCategories.includes("colour") ? "expanded" : ""}`}>
                <li onClick={() => handleSidebarFilter("Blue")}>
                  <ChevronRight size={14} className="chevron" /> Blue
                </li>
                <li onClick={() => handleSidebarFilter("Brown")}>
                  <ChevronRight size={14} className="chevron" /> Brown
                </li>
                <li onClick={() => handleSidebarFilter("Green")}>
                  <ChevronRight size={14} className="chevron" /> Green
                </li>
                <li onClick={() => handleSidebarFilter("Orange")}>
                  <ChevronRight size={14} className="chevron" /> Orange
                </li>
                <li onClick={() => handleSidebarFilter("Peach")}>
                  <ChevronRight size={14} className="chevron" /> Peach
                </li>
                <li onClick={() => handleSidebarFilter("Pink")}>
                  <ChevronRight size={14} className="chevron" /> Pink
                </li>
                <li onClick={() => handleSidebarFilter("Red")}>
                  <ChevronRight size={14} className="chevron" /> Red
                </li>
                <li onClick={() => handleSidebarFilter("Violet")}>
                  <ChevronRight size={14} className="chevron" /> Violet
                </li>
                <li onClick={() => handleSidebarFilter("White")}>
                  <ChevronRight size={14} className="chevron" /> White
                </li>
                <li onClick={() => handleSidebarFilter("Yellow")}>
                  <ChevronRight size={14} className="chevron" /> Yellow
                </li>
              </ul>
            </div>

            <div className="sidebar-category">
              <h4 onClick={() => toggleCategory("carat")}>
                Carat
                {expandedCategories.includes("carat") ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </h4>
              <ul className={`category-list ${expandedCategories.includes("carat") ? "expanded" : ""}`}>
                <li onClick={() => handleSidebarFilter("Points (Below 1.00)")}>
                  <ChevronRight size={14} className="chevron" /> Points (Below 1.00 Carat)
                </li>
                <li onClick={() => handleSidebarFilter("1.00 To 1.49 Carat")}>
                  <ChevronRight size={14} className="chevron" /> 1.00 To 1.49 Carat
                </li>
                <li onClick={() => handleSidebarFilter("1.50 To 1.99 Carat")}>
                  <ChevronRight size={14} className="chevron" /> 1.50 To 1.99 Carat
                </li>
                <li onClick={() => handleSidebarFilter("2.00 To 2.49 Carat")}>
                  <ChevronRight size={14} className="chevron" /> 2.00 To 2.49 Carat
                </li>
                <li onClick={() => handleSidebarFilter("2.50 To 2.99 Carat")}>
                  <ChevronRight size={14} className="chevron" /> 2.50 To 2.99 Carat
                </li>
                <li onClick={() => handleSidebarFilter("Above 10.00 Carat")}>
                  <ChevronRight size={14} className="chevron" /> Above 10.00 Carat
                </li>
              </ul>
            </div>
          </div>
        </div>
      </aside>

      <div className="content">
        <div className="gems-back-bar">
          <button className="gems-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <header className="gems-header">
          <h1>Premium Inventory</h1>
          <p>Explore our exclusive collection of natural gemstones</p>
        </header>

        <main className="gems-grid">
          {activeFilter !== "All" && (
            <div className="filter-status-badge">
              <span>
                Showing results for: <strong>{activeFilter}</strong>
              </span>
              <button onClick={() => handleSidebarFilter("All")}>
                <X size={14} />
              </button>
            </div>
          )}

          {loading && <div className="loading-spinner">Loading gems...</div>}
          
          {filteredGems.map((gem) => (
            <GemCard 
              key={gem.id} 
              gem={gem} 
              isAdmin={isAdmin} 
              onClick={handleGemClick}
              onEdit={() => {}} 
              onDelete={() => {}}
            />
          ))}

          {!loading && filteredGems.length === 0 && (
            <div className="no-gems-message">
              No gems found matching your filters.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Gems;
