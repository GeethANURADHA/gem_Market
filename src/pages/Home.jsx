import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu, X, ChevronRight, ChevronDown,
  Plus, Trash2, Pencil, Check,
  Phone, Mail
} from "lucide-react";
import GemCanvas from "../components/GemCanvas";
import { useAuth } from "../context/authContext";
import { gemstoneTypeService } from "../services/gemstoneTypeService";
import "./Home.css";



const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1599707367072-cd6ad66acc40?w=200&h=200&fit=crop";

const DEFAULT_GEMSTONE_TYPES = [
  { name: "Blue Sapphire",    img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=200&h=200&fit=crop" },
  { name: "Ruby",             img: "https://images.unsplash.com/photo-1599707367072-cd6ad66acc40?w=200&h=200&fit=crop" },
  { name: "Emerald",          img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop" },
  { name: "Yellow Sapphire",  img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=200&h=200&fit=crop" },
  { name: "Alexandrite",      img: "https://images.unsplash.com/photo-1599707367072-cd6ad66acc40?w=200&h=200&fit=crop" },
  { name: "Spinel",           img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop" },
  { name: "Padparadscha",     img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=200&h=200&fit=crop" },
  { name: "Cat's Eye",        img: "https://images.unsplash.com/photo-1599707367072-cd6ad66acc40?w=200&h=200&fit=crop" },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // ── Sidebar state ──────────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState(/** @type {string[]} */ ([]));
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000);

  // ── Gemstone types state ───────────────────────────────────────────────────
  const [gemTypes, setGemTypes] = useState(
    /** @type {import('../services/gemstoneTypeService').GemstoneType[]} */ ([])
  );
  const [loadingTypes, setLoadingTypes] = useState(true);

  // ── Add modal state ────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImgFile, setNewImgFile] = useState(/** @type {string} */ (""));
  const [addImgPreview, setAddImgPreview] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Edit-in-place state ────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState(/** @type {string|null} */ (null));
  const [editName, setEditName] = useState("");
  const editInputRef = useRef(/** @type {HTMLInputElement|null} */ (null));

  // ── Load gemstone types ────────────────────────────────────────────────────
  const loadTypes = async () => {
    try {
      setLoadingTypes(true);
      const types = await gemstoneTypeService.getAll();
      if (types.length === 0) {
        // Try to seed from defaults
        await gemstoneTypeService.seedDefaults(DEFAULT_GEMSTONE_TYPES);
        const seeded = await gemstoneTypeService.getAll();
        setGemTypes(seeded.length > 0 ? seeded : DEFAULT_GEMSTONE_TYPES.map((d, i) => ({
          id: `local-${i}`,
          name: d.name,
          imgUrl: d.img,
          displayOrder: i,
        })));
      } else {
        setGemTypes(types);
      }
    } catch {
      // Fallback to static list if Supabase not set up yet
      setGemTypes(DEFAULT_GEMSTONE_TYPES.map((d, i) => ({
        id: `local-${i}`,
        name: d.name,
        imgUrl: d.img,
        displayOrder: i,
      })));
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  // Focus edit input when it appears
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // ── Sidebar handlers ───────────────────────────────────────────────────────
  /** @param {string} filterValue */
  const handleSidebarFilter = (filterValue) => {
    if (filterValue === "All") {
      navigate("/gems");
    } else {
      navigate(`/gems?filter=${encodeURIComponent(filterValue)}`);
    }
  };

  /** @param {React.KeyboardEvent<HTMLInputElement>} e */
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/gems?search=${encodeURIComponent(searchQuery)}`);
    }
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

  // ── Admin: Delete ──────────────────────────────────────────────────────────
  /** @param {React.MouseEvent} e @param {string} id */
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (id.startsWith("local-")) {
      alert("Cannot delete: Supabase table not set up yet.");
      return;
    }
    if (!window.confirm("Delete this gemstone type?")) return;
    try {
      await gemstoneTypeService.delete(id);
      setGemTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete. Please try again.");
    }
  };

  // ── Admin: Start Edit ──────────────────────────────────────────────────────
  /** @param {React.MouseEvent} e @param {import('../services/gemstoneTypeService').GemstoneType} type */
  const handleStartEdit = (e, type) => {
    e.stopPropagation();
    setEditingId(type.id);
    setEditName(type.name);
  };

  // ── Admin: Save Edit ───────────────────────────────────────────────────────
  /** @param {string} id */
  const handleSaveEdit = async (id) => {
    if (!editName.trim()) { setEditingId(null); return; }
    if (id.startsWith("local-")) {
      setGemTypes((prev) => prev.map((t) => t.id === id ? { ...t, name: editName } : t));
      setEditingId(null);
      return;
    }
    try {
      const updated = await gemstoneTypeService.update(id, editName.trim());
      setGemTypes((prev) => prev.map((t) => t.id === id ? updated : t));
    } catch (err) {
      console.error("Update failed:", err);
    }
    setEditingId(null);
  };

  /** @param {React.KeyboardEvent} e @param {string} id */
  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") handleSaveEdit(id);
    if (e.key === "Escape") setEditingId(null);
  };

  // ── Admin: Add modal ───────────────────────────────────────────────────────
  /** @param {React.ChangeEvent<HTMLInputElement>} e */
  const handleAddImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = /** @type {string} */ (reader.result);
        setNewImgFile(result);
        setAddImgPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const newType = await gemstoneTypeService.add(
        newName.trim(),
        newImgFile,
        gemTypes.length
      );
      setGemTypes((prev) => [...prev, newType]);
      setShowAddModal(false);
      setNewName("");
      setNewImgFile("");
      setAddImgPreview("");
    } catch (err) {
      console.error("Add failed:", err);
      alert("Failed to add gem type. Make sure the Supabase table exists.");
    }
    setSaving(false);
  };

  return (
    <div className={`home-layout ${collapsed ? "collapsed" : ""}`}>
      {/* ── Sidebar toggle ── */}
      {collapsed && (
        <button
          className="toggle-btn"
          onClick={() => setCollapsed(false)}
          title="Open Filters"
        >
          <Menu size={24} />
        </button>
      )}

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <button
          className="close-btn"
          onClick={() => setCollapsed(true)}
          title="Close Filters"
        >
          <X size={24} />
        </button>

        <h2 className="logo">GEMVAULT</h2>

        {/* ── Contact strip ── */}
        <div className="sidebar-contact">
          <a href="tel:0701190000" className="sidebar-contact-link">
            <Phone size={13} />
            070 119 xxxx
          </a>
          <a href="mailto:vetrovivo.lk@gmail.com" className="sidebar-contact-link">
            <Mail size={13} />
            vetrovivo.lk@gmail.com
          </a>
          <a
            href="https://wa.me/94701190000"
            target="_blank"
            rel="noreferrer"
            className="sidebar-whatsapp-btn"
          >
            {/* WhatsApp SVG icon */}
            <svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor">
              <path d="M16.003 3C9.374 3 4 8.373 4 15.003c0 2.28.64 4.41 1.752 6.22L4 29l7.98-1.726A12.93 12.93 0 0016.003 28C22.63 28 28 22.627 28 16.003 28 9.374 22.629 3 16.003 3zm0 23.6a10.56 10.56 0 01-5.386-1.473l-.386-.23-4.736 1.025 1.056-4.614-.252-.397A10.535 10.535 0 015.4 15.003C5.4 9.147 10.147 4.4 16.003 4.4c5.855 0 10.597 4.747 10.597 10.603 0 5.855-4.742 10.597-10.597 10.597zm5.814-7.94c-.318-.16-1.88-.928-2.172-1.034-.292-.106-.505-.16-.718.16-.213.32-.824 1.034-.01 1.248.104.028 1.278.623 1.758.861.09.044.186.062.28.062.222 0 .437-.095.601-.283.266-.307.797-.962 1.04-1.293.21-.287.046-.567-.18-.72zm-3.08 3.01c-.424.237-.876.356-1.334.356-.677 0-1.348-.22-1.898-.632l-.225-.166-2.33.503.517-2.26-.175-.234a5.24 5.24 0 01-.977-3.04c0-2.892 2.354-5.245 5.248-5.245 2.89 0 5.244 2.353 5.244 5.246 0 2.891-2.353 5.24-5.07 5.472z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>

        <nav className="nav-menu">
          <button className="nav-item">🏠 HOME</button>
          <button className="nav-item" onClick={() => navigate("/gems")}>💎 GEMS</button>
          <button className="nav-item">⭐ FEATURED</button>
        </nav>

        <div className="divider" />

        <div className="filters">
          <h3 className="filters-title">Filters</h3>

          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
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
            {/* Gem Lankan */}
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
                <li onClick={() => handleSidebarFilter("All Precious Gems")}><ChevronRight size={14} className="chevron" /> All Precious Gems</li>
                <li onClick={() => handleSidebarFilter("All Semi Precious")}><ChevronRight size={14} className="chevron" /> All Semi Precious</li>
                <li onClick={() => handleSidebarFilter("Natural Gemstones")}><ChevronRight size={14} className="chevron" /> Natural Gemstones</li>
                <li onClick={() => handleSidebarFilter("Heated Gemstones")}><ChevronRight size={14} className="chevron" /> Heated Gemstones</li>
                <li onClick={() => handleSidebarFilter("All Pair Gems")}><ChevronRight size={14} className="chevron" /> All Pair Gems</li>
                <li onClick={() => handleSidebarFilter("Ceylon")}><ChevronRight size={14} className="chevron" /> Ceylon Gems</li>
              </ul>
            </div>

            {/* Cut Shapes */}
            <div className="sidebar-category">
              <h4 onClick={() => toggleCategory("cutShapes")}>
                Cut Shapes
                {expandedCategories.includes("cutShapes") ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </h4>
              <ul className={`category-list ${expandedCategories.includes("cutShapes") ? "expanded" : ""}`}>
                <li onClick={() => handleSidebarFilter("Round Cut")}><ChevronRight size={14} className="chevron" /> Round Cut</li>
                <li onClick={() => handleSidebarFilter("Radiant Cut")}><ChevronRight size={14} className="chevron" /> Radiant Cut</li>
                <li onClick={() => handleSidebarFilter("Oval Cut")}><ChevronRight size={14} className="chevron" /> Oval Cut</li>
                <li onClick={() => handleSidebarFilter("Heart Cut")}><ChevronRight size={14} className="chevron" /> Heart Cut</li>
                <li onClick={() => handleSidebarFilter("Cushion Cut")}><ChevronRight size={14} className="chevron" /> Cushion Cut</li>
                <li onClick={() => handleSidebarFilter("Emerald Cut")}><ChevronRight size={14} className="chevron" /> Emerald Cut</li>
                <li onClick={() => handleSidebarFilter("Pear Cut")}><ChevronRight size={14} className="chevron" /> Pear Cut</li>
                <li onClick={() => handleSidebarFilter("Cabochon Cut")}><ChevronRight size={14} className="chevron" /> Cabochon Cut</li>
                <li onClick={() => handleSidebarFilter("Princess Cut")}><ChevronRight size={14} className="chevron" /> Princess Cut</li>
              </ul>
            </div>

            {/* Varieties */}
            <div className="sidebar-category">
              <h4 onClick={() => toggleCategory("varieties")}>
                Varieties
                {expandedCategories.includes("varieties") ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </h4>
              <ul className={`category-list ${expandedCategories.includes("varieties") ? "expanded" : ""}`}>
                <li onClick={() => handleSidebarFilter("Blue Sapphire")}><ChevronRight size={14} className="chevron" /> Blue Sapphires</li>
                <li onClick={() => handleSidebarFilter("Yellow Sapphire")}><ChevronRight size={14} className="chevron" /> Yellow Sapphire</li>
                <li onClick={() => handleSidebarFilter("Green Sapphire")}><ChevronRight size={14} className="chevron" /> Green Sapphire</li>
                <li onClick={() => handleSidebarFilter("Orange Sapphire")}><ChevronRight size={14} className="chevron" /> Orange Sapphires</li>
                <li onClick={() => handleSidebarFilter("White Sapphire")}><ChevronRight size={14} className="chevron" /> White Sapphires</li>
                <li onClick={() => handleSidebarFilter("Spinel")}><ChevronRight size={14} className="chevron" /> Spinels</li>
              </ul>
            </div>

            {/* Colour */}
            <div className="sidebar-category">
              <h4 onClick={() => toggleCategory("colour")}>
                Colour
                {expandedCategories.includes("colour") ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </h4>
              <ul className={`category-list ${expandedCategories.includes("colour") ? "expanded" : ""}`}>
                {["Blue","Brown","Green","Orange","Peach","Pink","Red","Violet","White","Yellow"].map((c) => (
                  <li key={c} onClick={() => handleSidebarFilter(c)}><ChevronRight size={14} className="chevron" /> {c}</li>
                ))}
              </ul>
            </div>

            {/* Carat */}
            <div className="sidebar-category">
              <h4 onClick={() => toggleCategory("carat")}>
                Carat
                {expandedCategories.includes("carat") ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </h4>
              <ul className={`category-list ${expandedCategories.includes("carat") ? "expanded" : ""}`}>
                <li onClick={() => handleSidebarFilter("Points (Below 1.00)")}><ChevronRight size={14} className="chevron" /> Points (Below 1.00 Carat)</li>
                <li onClick={() => handleSidebarFilter("1.00 To 1.49 Carat")}><ChevronRight size={14} className="chevron" /> 1.00 To 1.49 Carat</li>
                <li onClick={() => handleSidebarFilter("1.50 To 1.99 Carat")}><ChevronRight size={14} className="chevron" /> 1.50 To 1.99 Carat</li>
                <li onClick={() => handleSidebarFilter("2.00 To 2.49 Carat")}><ChevronRight size={14} className="chevron" /> 2.00 To 2.49 Carat</li>
                <li onClick={() => handleSidebarFilter("2.50 To 2.99 Carat")}><ChevronRight size={14} className="chevron" /> 2.50 To 2.99 Carat</li>
                <li onClick={() => handleSidebarFilter("Above 10.00 Carat")}><ChevronRight size={14} className="chevron" /> Above 10.00 Carat</li>
              </ul>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="content">
        <section className="hero">
          <h1>Exquisite Gemstones</h1>
          <p>Scroll to watch the gemstone transform</p>

          {/* ── Hero contact bar ── */}
          <div className="hero-contact-bar">
            <a href="tel:0701190000" className="hero-contact-pill">
              <Phone size={15} />
              070 119 xxxx
            </a>
            <a href="mailto:vetrovivo.lk@gmail.com" className="hero-contact-pill">
              <Mail size={15} />
              vetrovivo.lk@gmail.com
            </a>
            <a
              href="https://wa.me/94701190000"
              target="_blank"
              rel="noreferrer"
              className="hero-contact-pill hero-whatsapp"
            >
              <svg viewBox="0 0 32 32" width="15" height="15" fill="currentColor">
                <path d="M16.003 3C9.374 3 4 8.373 4 15.003c0 2.28.64 4.41 1.752 6.22L4 29l7.98-1.726A12.93 12.93 0 0016.003 28C22.63 28 28 22.627 28 16.003 28 9.374 22.629 3 16.003 3zm0 23.6a10.56 10.56 0 01-5.386-1.473l-.386-.23-4.736 1.025 1.056-4.614-.252-.397A10.535 10.535 0 015.4 15.003C5.4 9.147 10.147 4.4 16.003 4.4c5.855 0 10.597 4.747 10.597 10.603 0 5.855-4.742 10.597-10.597 10.597zm5.814-7.94c-.318-.16-1.88-.928-2.172-1.034-.292-.106-.505-.16-.718.16-.213.32-.824 1.034-.01 1.248.104.028 1.278.623 1.758.861.09.044.186.062.28.062.222 0 .437-.095.601-.283.266-.307.797-.962 1.04-1.293.21-.287.046-.567-.18-.72zm-3.08 3.01c-.424.237-.876.356-1.334.356-.677 0-1.348-.22-1.898-.632l-.225-.166-2.33.503.517-2.26-.175-.234a5.24 5.24 0 01-.977-3.04c0-2.892 2.354-5.245 5.248-5.245 2.89 0 5.244 2.353 5.244 5.246 0 2.891-2.353 5.24-5.07 5.472z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </section>

        <GemCanvas />

        <section className="gem-types-section">
          <div className="gem-types-header">
            <div>
              <h2>Gemstones</h2>
              <p className="gem-types-subtitle">
                We are dealer in Ceylon gem market and specialized in precious and
                semi precious gemstones.
              </p>
            </div>
            {/* Admin: Add button */}
            {isAdmin && (
              <button
                className="gem-type-add-btn"
                onClick={() => setShowAddModal(true)}
                title="Add new gem type"
              >
                <Plus size={28} />
              </button>
            )}
          </div>

          {loadingTypes ? (
            <div className="gem-types-loading">Loading...</div>
          ) : (
            <div className="gem-types-grid">
              {gemTypes.map((type) => (
                <div
                  key={type.id}
                  className={`gem-type-card ${isAdmin ? "admin-mode" : ""}`}
                  onClick={() => !isAdmin && handleSidebarFilter(type.name)}
                >
                  {/* Image circle with delete overlay for admin */}
                  <div className="gem-type-img-wrapper">
                    <img
                      src={type.imgUrl || FALLBACK_IMG}
                      alt={type.name}
                      onError={(e) => {
                        /** @type {HTMLImageElement} */ (e.target).src = FALLBACK_IMG;
                      }}
                    />
                    {isAdmin && (
                      <button
                        className="gem-type-delete-btn"
                        onClick={(e) => handleDelete(e, type.id)}
                        title="Delete this gem type"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Name span with inline edit for admin */}
                  {isAdmin && editingId === type.id ? (
                    <div className="gem-type-edit-row" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={editInputRef}
                        className="gem-type-edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, type.id)}
                      />
                      <button
                        className="gem-type-edit-save"
                        onClick={() => handleSaveEdit(type.id)}
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="gem-type-name">
                      {type.name}
                      {isAdmin && (
                        <button
                          className="gem-type-edit-btn"
                          onClick={(e) => handleStartEdit(e, type)}
                          title="Edit name"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Add Gem Type Modal ── */}
      {showAddModal && (
        <div className="gem-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="gem-modal" onClick={(e) => e.stopPropagation()}>
            <button className="gem-modal-close" onClick={() => setShowAddModal(false)} title="Close">
              <X size={22} />
            </button>
            <h3>Add New Gem Type</h3>

            <label className="gem-modal-label">Gem Name</label>
            <input
              className="gem-modal-input"
              type="text"
              placeholder="e.g. Paraiba Tourmaline"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubmit()}
              autoFocus
            />

            <label className="gem-modal-label">Gem Image (optional)</label>
            <input
              className="gem-modal-input"
              type="file"
              accept="image/*"
              onChange={handleAddImageUpload}
              style={{ paddingTop: "8px", cursor: "pointer" }}
            />
            {addImgPreview && (
              <img className="gem-modal-preview" src={addImgPreview} alt="preview" />
            )}

            <div className="gem-modal-actions">
              <button className="gem-modal-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button
                className="gem-modal-submit"
                onClick={handleAddSubmit}
                disabled={saving || !newName.trim()}
              >
                {saving ? "Adding..." : "Add Gem"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
