import { Pencil, Trash2 } from "lucide-react";
import Button from "./Button";
import "./GemCard.css";

/**
 * @param {object} props
 * @param {import('../services/gemService').Gem} props.gem
 * @param {boolean} props.isAdmin
 * @param {(gem: import('../services/gemService').Gem) => void} props.onEdit
 * @param {(id: string) => void} props.onDelete
 * @param {(gem: import('../services/gemService').Gem) => void} [props.onClick]
 */
const GemCard = ({ gem, isAdmin, onEdit, onDelete, onClick }) => {
  return (
    <div className="gem-card" onClick={() => onClick && onClick(gem)}>
      <div className="gem-image-container">
        <img src={gem.imageUrl} alt={gem.name} className="gem-image" />
        <div className="gem-price-tag">${gem.price.toLocaleString()}</div>
      </div>

      <div className="gem-content">
        <div className="gem-header">
          <h3 className="gem-name">{gem.name}</h3>
          {gem.carat && <span className="gem-carat">{gem.carat} ct</span>}
        </div>
        <p className="gem-description">{gem.description}</p>

        {isAdmin && (
          <div className="gem-actions" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="secondary"
              onClick={() => onEdit(gem)}
              className="action-btn"
            >
              <Pencil size={16} /> Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => onDelete(gem.id)}
              className="action-btn"
            >
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GemCard;
