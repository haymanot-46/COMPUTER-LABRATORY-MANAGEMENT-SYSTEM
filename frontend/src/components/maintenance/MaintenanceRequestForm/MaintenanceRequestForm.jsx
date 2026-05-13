import React, { useState } from 'react';
import './MaintenanceRequestForm.css';

const MaintenanceRequestForm = ({ computers, laboratories, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    computer_id: '',
    laboratory_id: '',
    issueType: 'hardware',
    description: '',
    priority: 'medium'
  });

  const [errors, setErrors] = useState({});

  const issueTypes = [
    { value: 'hardware', label: '🔧 Hardware Issue' },
    { value: 'software', label: '💻 Software Issue' },
    { value: 'network', label: '🌐 Network Issue' },
    { value: 'peripheral', label: '🖱️ Peripheral Issue' },
    { value: 'other', label: '📝 Other' }
  ];

  const priorities = [
    { value: 'low', label: '🟢 Low', color: '#10b981' },
    { value: 'medium', label: '🟡 Medium', color: '#f59e0b' },
    { value: 'high', label: '🟠 High', color: '#f97316' },
    { value: 'urgent', label: '🔴 Urgent', color: '#ef4444' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.computer_id && !formData.laboratory_id) {
      newErrors.computer_id = 'Please select a computer or laboratory';
    }
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.description && formData.description.length < 10) {
      newErrors.description = 'Please provide more details (at least 10 characters)';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  const selectedComputer = computers.find(c => c.id === parseInt(formData.computer_id));

  return (
    <form className="maintenance-request-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Basic Information</h3>
        
        <div className="form-group">
          <label>Request Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Computer not booting, Network connectivity issue"
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Computer *</label>
            <select name="computer_id" value={formData.computer_id} onChange={handleChange}>
              <option value="">Select Computer</option>
              {computers.map(computer => (
                <option key={computer.id} value={computer.id}>
                  {computer.name || computer.workstation_number} - {computer.model} ({computer.laboratory_name || 'Unknown Lab'})
                </option>
              ))}
            </select>
            {errors.computer_id && <span className="error-text">{errors.computer_id}</span>}
          </div>

          <div className="form-group">
            <label>Laboratory</label>
            <select name="laboratory_id" value={formData.laboratory_id} onChange={handleChange}>
              <option value="">Select Laboratory</option>
              {laboratories.map(lab => (
                <option key={lab.id} value={lab.id}>
                  {lab.name} ({lab.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Issue Type</label>
            <select name="issueType" value={formData.issueType} onChange={handleChange}>
              {issueTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority *</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Issue Description</h3>
        <div className="form-group">
          <label>Detailed Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            placeholder="Please provide detailed information about the issue:&#10;- What is the problem?&#10;- When did it start?&#10;- Any error messages?&#10;- Steps to reproduce (if applicable)"
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>
      </div>

      {selectedComputer && (
        <div className="computer-info-card">
          <h4>Computer Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Model:</span>
              <span>{selectedComputer.model || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Processor:</span>
              <span>{selectedComputer.processor || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">RAM:</span>
              <span>{selectedComputer.ram || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">OS:</span>
              <span>{selectedComputer.os || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default MaintenanceRequestForm;