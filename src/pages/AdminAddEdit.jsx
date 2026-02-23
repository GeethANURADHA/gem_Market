import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { gemService } from '../services/gemService';
import './AdminAddEdit.css';

const AdminAddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: 'Precious'
  });

  useEffect(() => {
    if (isEditMode) {
      const gem = gemService.getById(id);
      if (gem) {
        setFormData(gem);
      } else {
        navigate('/admin');
      }
    }
  }, [id, isEditMode, navigate]);

  /**
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || '' : value
    }));
  };

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
           setFormData(prev => ({
            ...prev,
            imageUrl: result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * @param {React.FormEvent} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      gemService.update(id, formData);
    } else {
      gemService.add(formData);
    }
    navigate('/admin');
  };

  return (
    <div className="page-container admin-form-page">
      <div className="form-container">
        <Button variant="secondary" onClick={() => navigate('/admin')} className="back-btn">
          <ArrowLeft size={18} /> Back to Dashboard
        </Button>

        <h1>{isEditMode ? 'Edit Gem' : 'Add New Gem'}</h1>

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
            <label className="input-label" htmlFor="category">Category</label>
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
            label="Price ($)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="e.g. 1200"
          />

          <div className="input-group">
            <label className="input-label" htmlFor="imageUrl">Gem Image</label>
            <input
              type="file"
              id="imageUrl"
              accept="image/*"
              onChange={handleImageUpload}
              className="input-field"
              style={{ paddingTop: '8px' }}
            />
            {formData.imageUrl && (
              <div className="image-preview" style={{ marginTop: '1rem', textAlign: 'center' }}>
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', objectFit: 'contain' }} 
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
            <Button type="submit" variant="primary" className="save-btn" onClick={() => {}}>
              <Save size={20} /> {isEditMode ? 'Update Gem' : 'Add Gem'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddEdit;
