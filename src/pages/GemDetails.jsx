import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { gemService } from '../services/gemService';
import Button from '../components/Button';
import './GemDetails.css';

const GemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gem, setGem] = useState(null);

  useEffect(() => {
    const foundGem = gemService.getById(id);
    if (foundGem) {
      setGem(foundGem);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!gem) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container gem-details-page">
      <div className="details-container">
        <Button variant="secondary" onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} /> Back
        </Button>
        
        <div className="details-content">
          <div className="details-image-wrapper">
            <img src={gem.imageUrl} alt={gem.name} className="details-image" />
          </div>
          
          <div className="details-info">
            <h1 className="details-title">{gem.name}</h1>
            <div className="details-price">${gem.price.toLocaleString()}</div>
            
            <div className="details-description">
              <h3>Description</h3>
              <p>{gem.description}</p>
            </div>
            
            <Button variant="primary" className="buy-btn" onClick={() => alert('Purchase functionality coming soon!')}>
              <ShoppingBag size={20} /> Purchase Inquiry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemDetails;
