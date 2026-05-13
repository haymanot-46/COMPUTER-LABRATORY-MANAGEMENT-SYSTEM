import React, { useState, useEffect } from 'react';
import './LaboratoryForm.css';

const LaboratoryForm = ({ onSubmit, onCancel, initialData, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    building: '',
    floor: '',
    capacity: '',
    department: '',
    description: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        building: initialData.building || '',
        floor: initialData.floor || '',
        capacity: initialData.capacity || '',
        department: initialData.department || '',
        description: initialData.description || '',
        status: initialData.status || 'active'
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Laboratory name is required';
    if (!formData.code.trim()) newErrors.code = 'Laboratory code is required';
    if (!formData.building.trim()) newErrors.building = 'Building is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    if (formData.capacity && parseInt(formData.capacity) < 1) newErrors.capacity = 'Capacity must be at least 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      await onSubmit(formData);
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'closed', label: 'Closed' }
  ];

  const buildingOptions = [
    'Main Building',
    'Science Block',
    'Engineering Block',
    'Library Building',
    'Administration Block',
    'New Building'
  ];

  return (
    <div className="laboratory-form-container">
      <div className="laboratory-form-header">
        <h2>{isEditing ? '✏️ Edit Laboratory' : '🏛️ Add New Laboratory'}</h2>
        <button type="button" className="close-btn" onClick={onCancel}>×</button>
      </div>
      
      <form onSubmit={handleSubmit} className="laboratory-form">
        <div className="form-row">
          <div className="form-group">
            <label>Laboratory Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Computer Lab 101"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label>Laboratory Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., LAB101"
              className={errors.code ? 'error' : ''}
            />
            {errors.code && <span className="error-text">{errors.code}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Building *</label>
            <select
              name="building"
              value={formData.building}
              onChange={handleChange}
              className={errors.building ? 'error' : ''}
            >
              <option value="">Select Building</option>
              {buildingOptions.map(building => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
            {errors.building && <span className="error-text">{errors.building}</span>}
          </div>
          
          <div className="form-group">
            <label>Floor</label>
            <input
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              placeholder="Floor number"
              min="1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Capacity *</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Number of students/computers"
              min="1"
              className={errors.capacity ? 'error' : ''}
            />
            {errors.capacity && <span className="error-text">{errors.capacity}</span>}
          </div>
          
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Additional information about the laboratory..."
          />
        </div>

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Laboratory' : 'Add Laboratory')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LaboratoryForm;