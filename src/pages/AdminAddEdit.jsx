import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import Input from "../components/Input";
import Button from "../components/Button";
import { gemService } from "../services/gemService";
import "./AdminAddEdit.css";

const AdminAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState(/** @type {{name:string,price:number|string,carat:number|string,description:string,imageUrl:string,category:string}} */ ({
    name: '',
    price: '',
    carat: '',
    description: '',
    imageUrl: '',
    category: 'Precious',
  }));

  useEffect(() => {
    if (isEditMode) {
      const fetchGem = async () => {
        try {
          const gem = await gemService.getById(id);
          if (gem) {
            setFormData(gem);
          } else {
            navigate('/admin');
          }
        } catch (err) {
          console.error('Failed to load gem:', err);
          navigate('/admin');
        }
      };
      fetchGem();
    }
  }, [id, isEditMode, navigate]);

  /** @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>} e */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Parse both price and carat as numbers
      [name]:
        name === 'price' || name === 'carat' ? parseFloat(value) || '' : value,
    }));
  };

  /** @param {React.ChangeEvent<HTMLInputElement>} e */
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setFormData((prev) => ({
            ...prev,
            imageUrl: result,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      /** @type {import('../services/gemService').Gem} */
      const payload = /** @type {any} */ (formData);
      if (isEditMode) {
        await gemService.update(/** @type {string} */ (id), payload);
      } else {
        await gemService.add(payload);
      }
      navigate('/admin');
    } catch (err) {
      console.error('Failed to save gem:', err);
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
              <option value="Precious">Precious</option>
              <option value="Semi-Precious">Semi-Precious</option>
              <option value="Organic">Organic</option>
              <option value="Synthetic">Synthetic</option>
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
            <label className="input-label" htmlFor="imageUrl">
              Gem Image
            </label>
            <input
              type="file"
              id="imageUrl"
              accept="image/*"
              onChange={handleImageUpload}
              className="input-field"
              style={{ paddingTop: "8px" }}
            />
            {formData.imageUrl && (
              <div
                className="image-preview"
                style={{ marginTop: "1rem", textAlign: "center" }}
              >
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "4px",
                    objectFit: "contain",
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
            <Button type="submit" variant="primary" className="save-btn">
              <Save size={20} /> {isEditMode ? "Update Gem" : "Add Gem"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddEdit;
