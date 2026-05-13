import React, { useState } from 'react';
import PartsUsedForm from '../PartsUsedForm/PartsUsedForm'; // Fixed import path
import './ResolutionForm.css';

const ResolutionForm = ({ request, onComplete, onCancel, loading: externalLoading }) => {
  const [resolution, setResolution] = useState('');
  const [partsUsed, setPartsUsed] = useState([]);
  const [showPartsForm, setShowPartsForm] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState('');

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  const handleAddPart = (part) => {
    setPartsUsed([...partsUsed, part]);
  };

  const handleRemovePart = (index) => {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!resolution) {
      setError('Please provide a resolution description');
      return;
    }
    
    setInternalLoading(true);
    setError('');
    await onComplete(request.id, resolution, partsUsed);
    setInternalLoading(false);
  };

  return (
    <div className="resolution-modal">
      <div className="resolution-modal-overlay" onClick={onCancel}></div>
      <div className="resolution-modal-content">
        <div className="resolution-modal-header">
          <h2>Complete Maintenance Request</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="resolution-modal-body">
          <div className="request-info">
            <h4>Request #{request.id}</h4>
            <p>{request.title}</p>
          </div>

          <div className="form-group">
            <label>Resolution Description *</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows="4"
              placeholder="Describe how the issue was resolved..."
              disabled={loading}
            />
            {error && <span className="error">{error}</span>}
          </div>

          <div className="parts-section">
            <div className="parts-header">
              <label>Parts Used</label>
              <button 
                className="add-part-btn"
                onClick={() => setShowPartsForm(true)}
                type="button"
                disabled={loading}
              >
                + Add Part
              </button>
            </div>

            {partsUsed.length > 0 && (
              <div className="parts-list">
                {partsUsed.map((part, index) => (
                  <div key={index} className="part-item">
                    <span>{part.name} - {part.quantity} x {part.cost} ETB</span>
                    <button 
                      type="button"
                      onClick={() => handleRemovePart(index)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="resolution-modal-actions">
          <button type="button" className="cancel-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button 
            type="button"
            className="complete-btn" 
            onClick={handleSubmit}
            disabled={!resolution || loading}
          >
            {loading ? 'Completing...' : 'Mark as Completed'}
          </button>
        </div>
      </div>

      {showPartsForm && (
        <PartsUsedForm
          onAdd={handleAddPart}
          onCancel={() => setShowPartsForm(false)}
        />
      )}
    </div>
  );
};

export default ResolutionForm;