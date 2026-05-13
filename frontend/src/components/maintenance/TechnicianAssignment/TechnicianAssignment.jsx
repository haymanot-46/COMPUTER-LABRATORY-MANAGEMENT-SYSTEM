import React, { useState } from 'react';
import './TechnicianAssignment.css';

const TechnicianAssignment = ({ request, technicians, onAssign, onCancel }) => {
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedTechnician) {
      setError('Please select a technician');
      return;
    }
    
    setLoading(true);
    setError('');
    await onAssign(request.id, selectedTechnician, notes);
    setLoading(false);
  };

  return (
    <div className="assignment-modal">
      <div className="assignment-modal-overlay" onClick={onCancel}></div>
      <div className="assignment-modal-content">
        <div className="assignment-modal-header">
          <h2>Assign Technician</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="assignment-modal-body">
          <div className="request-info">
            <h4>Request #{request.id}</h4>
            <p>{request.title}</p>
          </div>

          <div className="form-group">
            <label>Select Technician *</label>
            <select 
              value={selectedTechnician} 
              onChange={(e) => setSelectedTechnician(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select Technician --</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} - {tech.specialization || 'General'}
                </option>
              ))}
            </select>
            {error && <span className="error">{error}</span>}
          </div>

          <div className="form-group">
            <label>Assignment Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Add any instructions or notes for the technician..."
              disabled={loading}
            />
          </div>
        </div>

        <div className="assignment-modal-actions">
          <button className="cancel-btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button 
            className="assign-btn" 
            onClick={handleSubmit}
            disabled={!selectedTechnician || loading}
          >
            {loading ? 'Assigning...' : 'Assign Technician'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianAssignment;