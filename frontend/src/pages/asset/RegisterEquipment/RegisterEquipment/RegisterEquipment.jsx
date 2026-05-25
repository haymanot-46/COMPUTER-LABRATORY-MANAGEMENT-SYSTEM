// frontend/src/pages/asset/RegisterEquipment/RegisterEquipment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../hooks';
import { assetService } from '../../../../services';
import './RegisterEquipment.css';

const RegisterEquipment = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    laboratory_id: '',
    serial_number: '',
    model: '',
    manufacturer: '',
    purchase_date: '',
    purchase_cost: '',
    warranty_expiry: '',
    condition: 'good',
    status: 'available',
    notes: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
    loadLaboratories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await assetService.getCategories();
      if (data.success) {
        setCategories(data.data);
      } else {
        // Default categories from SRS 3.7.2
        setCategories([
          'Computer', 'Monitor', 'Projector', 'Keyboard', 'Mouse', 
          'UPS', 'Printer', 'Scanner', 'Router', 'Switch', 
          'Network Cable', 'Lab Furniture', 'Software License', 'Other'
        ]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadLaboratories = async () => {
    try {
      const data = await assetService.getLaboratories();
      if (data.success) {
        setLaboratories(data.data);
      }
    } catch (error) {
      console.error('Error loading laboratories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code) newErrors.code = 'Equipment code is required';
    if (!formData.name) newErrors.name = 'Equipment name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const data = await assetService.createEquipment(formData);
      
      if (data.success) {
        addToast('Equipment registered successfully!', 'success');
        navigate('/asset/equipment');
      } else {
        addToast(data.message || 'Failed to register equipment', 'error');
        if (data.errors) setErrors(data.errors);
      }
    } catch (error) {
      console.error('Error registering equipment:', error);
      addToast('Error registering equipment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-equipment-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Register New Equipment</h1>
        <p>Add new computer lab equipment to the inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Equipment Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., COMP-001, MON-002"
              />
              {errors.code && <span className="error">{errors.code}</span>}
            </div>
            <div className="form-group">
              <label>Equipment Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Dell OptiPlex 7080"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="error">{errors.category}</span>}
            </div>
            <div className="form-group">
              <label>Laboratory</label>
              <select name="laboratory_id" value={formData.laboratory_id} onChange={handleChange}>
                <option value="">Select Laboratory</option>
                {laboratories.map(lab => (
                  <option key={lab.id} value={lab.id}>{lab.name} ({lab.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Serial Number</label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder="Manufacturer serial number"
              />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Model number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="e.g., Dell, HP, Lenovo"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Purchase Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Purchase Date</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Purchase Cost (ETB)</label>
              <input
                type="number"
                name="purchase_cost"
                value={formData.purchase_cost}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Warranty Expiry</label>
              <input
                type="date"
                name="warranty_expiry"
                value={formData.warranty_expiry}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Status Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange}>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="damaged">Damaged</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional information about this equipment..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register Equipment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterEquipment;