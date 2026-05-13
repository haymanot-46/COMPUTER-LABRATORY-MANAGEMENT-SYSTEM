// frontend/src/pages/computers/AddComputerPage/AddComputerPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../hooks';
import './AddComputerPage.css';

const AddComputerPage = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [laboratories, setLaboratories] = useState([]);
  
  const [formData, setFormData] = useState({
    asset_tag: '',
    name: '',
    model: '',
    brand: '',
    serial_number: '',
    laboratory_id: '',
    processor: '',
    ram: '',
    storage: '',
    operating_system: '',
    ip_address: '',
    mac_address: '',
    status: 'available',
    purchase_date: '',
    warranty_expiry: '',
    notes: ''
  });

  useEffect(() => {
    loadLaboratories();
  }, []);

  const loadLaboratories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/laboratories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.asset_tag || !formData.name || !formData.laboratory_id) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/computers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToast('Computer added successfully!', 'success');
        navigate('/computers');
      } else {
        addToast(data.message || 'Failed to add computer', 'error');
      }
    } catch (error) {
      console.error('Error adding computer:', error);
      addToast('Error adding computer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-computer-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Add New Computer</h1>
        <p>Register a new computer in the system</p>
      </div>

      <form onSubmit={handleSubmit} className="add-computer-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Asset Tag *</label>
              <input type="text" name="asset_tag" value={formData.asset_tag} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Computer Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Model</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Serial Number</label>
              <input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Laboratory *</label>
              <select name="laboratory_id" value={formData.laboratory_id} onChange={handleChange} required>
                <option value="">Select Laboratory</option>
                {laboratories.map(lab => (
                  <option key={lab.id} value={lab.id}>{lab.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Specifications</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Processor</label>
              <input type="text" name="processor" value={formData.processor} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>RAM</label>
              <input type="text" name="ram" value={formData.ram} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Storage</label>
              <input type="text" name="storage" value={formData.storage} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Operating System</label>
              <input type="text" name="operating_system" value={formData.operating_system} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Network Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>IP Address</label>
              <input type="text" name="ip_address" value={formData.ip_address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>MAC Address</label>
              <input type="text" name="mac_address" value={formData.mac_address} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Status & Warranty</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Warranty Expiry</label>
              <input type="date" name="warranty_expiry" value={formData.warranty_expiry} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Computer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddComputerPage;