import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, Loader2 } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import { gemService } from "../services/gemService";
import { gemstoneTypeService } from "../services/gemstoneTypeService";
import { supabase } from "../lib/supabaseClient";
import "./AdminAddEdit.css";

const AdminAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(/** @type {File | null} */ (null));
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    carat: 0,
    description: '',
    imageUrl: '', // Used for displaying existing/preview images
    category: '', 
  });
  const [categories, setCategories] = useState(/** @type {string[]} */ ([]));

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const types = await gemstoneTypeService.getAll();
        const names = types.map(t => t.name);
        setCategories(names);
        if (!isEditMode && names.length > 0) {
          setFormData(prev => ({ ...prev, category: names[0] }));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();

    if (isEditMode) {
      const fetchGem = async () => {
        try {
          if (!id) return;
          const gem = await gemService.getById(id);
          if (gem) {
            setFormData({
              name: gem.name || '',
              price: gem.price || 0,
              carat: gem.carat || 0,
              description: gem.description || '',
              imageUrl: gem.imageUrl || '',
              category: gem.category || '',
            });
          } else {
            navigate('/admin');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error('Failed to load gem:', errorMessage);
          navigate('/admin');
        }
      };
      fetchGem();
    }
  }, [id, isEditMode, navigate]);

  /**
   * Handles text input changes
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'carat' ? parseFloat(value) || 0 : value,
    }));
  };

  /**
   * Selection Handling: 
   * Stores the File object locally for upload during handleSubmit.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /**
   * Submits the form data and uploads image to 'gems_bucket' using the gem ID
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      let gemId = id;

      // 1. Save gem data to get an ID (if adding) or update
      if (isEditMode && id) {
        await gemService.update(id, formData);
      } else {
        const newGem = await gemService.add(formData);
        gemId = newGem.id;
      }

      // 2. Upload image if a new one was selected
      if (imageFile && gemId) {
        const filePath = `items/${gemId}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('gems_bucket')
          .upload(filePath, imageFile, { upsert: true });

        if (uploadError) throw uploadError;
      }

      navigate('/admin');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to save gem:', errorMessage);
      alert(`Error saving gem: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container admin-form-page">
      <div className="form-container">
        <button
          className="form-close-btn"
          onClick={() => navigate("/admin")}
          title="Close"
        >
          <X size={24} />
        </button>

        <Button
          variant="secondary"
          onClick={() => navigate("/admin")}
          className="back-btn"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Button>

        <h1>{isEditMode ? "Edit Gem" : "Add New Gem"}</h1>

        <form onSubmit={handleSubmit} className="gem-form">
          <Input
            label="Gem Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Blue Sapphire"
          />

          <div className="input-group">
            <label className="input-label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Input
            label="Carat Weight"
            name="carat"
            type="number"
            step="0.01"
            value={formData.carat}
            onChange={handleChange}
            required
            placeholder="e.g. 1.25"
          />

          <Input
            label="Price ($)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="e.g. 1200"
          />

          <div className="input-group">
            <label className="input-label" htmlFor="imageFile">
              Gem Image
            </label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleImageUpload}
              className="input-field"
              style={{ paddingTop: "8px" }}
              disabled={uploading}
            />
            {uploading && (
              <div className="uploading-indicator" style={{ marginTop: "0.5rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Uploading to storage...</span>
              </div>
            )}
            {(imagePreview || formData.imageUrl) && !uploading && (
              <div
                className="image-preview"
                style={{ marginTop: "1rem", textAlign: "center" }}
              >
                <img
                  src={imagePreview || formData.imageUrl}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "4px",
                    objectFit: "contain",
                    border: "1px solid rgba(212, 175, 55, 0.3)"
                  }}
                />
              </div>
            )}
          </div>

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            textArea
            required
            placeholder="Describe the gem's qualities..."
          />

          <div className="form-actions">
            <Button 
              type="submit" 
              variant="primary" 
              className="save-btn"
              disabled={uploading}
            >
              <Save size={20} /> {isEditMode ? "Update Gem" : "Add Gem"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddEdit;