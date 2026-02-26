import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight, ChevronDown, ArrowLeft } from "lucide-react";
import GemCard from "../components/GemCard";
import { gemService } from "../services/gemService";
import { gemstoneTypeService } from "../services/gemstoneTypeService";
import { useAuth } from "../context/authContext";
import "./Gems.css";

const Gems = () => {
  const { isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [gems, setGems] = useState(/** @type {import('../services/gemService').Gem[]} */ ([]));
  const [filteredGems, setFilteredGems] = useState(/** @type {import('../services/gemService').Gem[]} */ ([]));
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000000); // 100M default
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedCategories, setExpandedCategories] = useState(/** @type {string[]} */ ([]));
  const [varieties, setVarieties] = useState(/** @type {string[]} */ ([]));

  const navigate = useNavigate();
  const location = useLocation();

  // Load initial gems and varieties from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching gems and varieties...");
        const [allGems, allTypes] = await Promise.all([
          gemService.getAll(),
          gemstoneTypeService.getAll()
        ]);
        console.log("Gems fetched:", allGems.length, allGems);
        console.log("Varieties fetched:", allTypes.length, allTypes);
        setGems(allGems);
        setFilteredGems(allGems);
        setVarieties(allTypes.map(t => t.name));
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    console.log("Filtering gems. ActiveFilter:", activeFilter, "Total Gems:", gems.length);

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
        const cat = (g.category || "").toLowerCase().trim();
        const filter = activeFilter.toLowerCase().trim();

        if (filter === "all precious gems") return cat === "precious";
        if (filter === "all semi precious") return cat === "semi-precious";

        if (filter.includes("carat") || filter.includes("points")) {
          if (!g.carat) return false;
          if (filter.includes("below 1.00")) return g.carat < 1.0;
          if (filter.includes("above 10.00")) return g.carat > 10.0;

          const match = filter.match(/([\d.]+)\s*to\s*([\d.]+)/i);
          if (match) {
            return (
              g.carat >= parseFloat(match[1]) && g.carat <= parseFloat(match[2])
            );
          }
        }

        // Broad match for names, descriptions, or categories
        const term = filter.replace(/s$/, ""); // Allow plural/singular match
        const matches = 
          g.name.toLowerCase().includes(term) ||
          (g.description && g.description.toLowerCase().includes(term)) ||
          cat.includes(term);
        
        return matches;
      });
    }

    result = result.filter((g) => g.price <= maxPrice);
    console.log("Filtered Results Count:", result.length);
    setFilteredGems(result);
  }, [searchQuery, activeFilter, maxPrice, gems]);

  /** @param {import('../services/gemService').Gem} gem */
  const handleGemClick = (gem) => {
    navigate(`/gems/${gem.id}`);
  };

  /** @param {string} filterValue */
  const handleSidebarFilter = (filterValue) => {
    setActiveFilter(filterValue);
    navigate(`/gems?filter=${encodeURIComponent(filterValue)}`, { replace: true });
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
            max="100000000"
            step="1000"
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
                {varieties.map(variety => (
                  <li key={variety} onClick={() => handleSidebarFilter(variety)}>
                    <ChevronRight size={14} className="chevron" /> {variety}
                  </li>
                ))}
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
              <h3>No gems found matching your filters.</h3>
              <p>Try increasing the <strong>Max Price</strong> in the sidebar or clearing the search.</p>
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setActiveFilter("All");
                  setMaxPrice(100000000);
                  setSearchQuery("");
                  navigate("/gems", { replace: true });
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Gems;
