import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import GemCard from '../components/GemCard';
import Button from '../components/Button';
import { gemService } from '../services/gemService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [gems, setGems] = useState(/** @type {import('../services/gemService').Gem[]} */ ([]));
  const navigate = useNavigate();

  const loadGems = async () => {
    try {
      const data = await gemService.getAll();
      setGems(data);
    } catch (err) {
      console.error('Failed to load gems:', err);
    }
  };

  useEffect(() => {
    loadGems();
  }, []);

  /** @param {import('../services/gemService').Gem} gem */
  const handleEdit = (gem) => {
    navigate(`/admin/edit/${gem.id}`);
  };

  /** @param {string} id */
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gem?')) {
      try {
        await gemService.delete(id);
        await loadGems();
      } catch (err) {
        console.error('Failed to delete gem:', err);
      }
    }
  };

  return (
    <div className="page-container admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Button variant="primary" onClick={() => navigate('/admin/add')}>
          <Plus size={20} /> Add New Gem
        </Button>
      </div>

      <div className="dashboard-grid">
        {gems.map(gem => (
          <GemCard 
            key={gem.id} 
            gem={gem} 
            isAdmin={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {gems.length === 0 && (
          <div className="no-gems-message">
            <p>No gems found. Start by adding one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
