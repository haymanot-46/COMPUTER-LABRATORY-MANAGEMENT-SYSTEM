import React, { useState } from 'react';
import './PartsUsedForm.css';

const PartsUsedForm = ({ onAdd, onCancel }) => {
  const [part, setPart] = useState({
    name: '',
    quantity: 1,
    cost: 0
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    if (!part.name) {
      setErrors({ name: 'Part name is required' });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAdd(part);
    onCancel();
  };

  return (
    <div className="parts-form-modal">
      <div className="parts-form-overlay" onClick={onCancel}></div>
      <div className="parts-form-content">
        <div className="parts-form-header">
          <h3>Add Part</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="parts-form-body">
          <div className="form-group">
            <label>Part Name *</label>
            <input
              type="text"
              value={part.name}
              onChange={(e) => setPart({ ...part, name: e.target.value })}
              placeholder="e.g., RAM Module"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={part.quantity}
              onChange={(e) => setPart({ ...part, quantity: parseInt(e.target.value) || 1 })}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Cost (ETB)</label>
            <input
              type="number"
              value={part.cost}
              onChange={(e) => setPart({ ...part, cost: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="parts-form-actions">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="add-btn" onClick={handleSubmit}>Add Part</button>
        </div>
      </div>
    </div>
  );
};

export default PartsUsedForm;