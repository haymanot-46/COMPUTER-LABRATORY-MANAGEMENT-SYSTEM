import React, { useState, useEffect } from 'react';
import './ComputerForm.css';

const ComputerForm = ({ onSubmit, onCancel, initialData, laboratories, isEditing }) => {
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
    os: '',
    ip_address: '',
    mac_address: '',
    purchase_date: '',
    warranty_expiry: '',
    status: 'active',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        asset_tag: initialData.asset_tag || initialData.code || '',
        name: initialData.name || initialData.workstation_number || '',
        model: initialData.model || '',
        brand: initialData.brand || '',
        serial_number: initialData.serial_number || '',
        laboratory_id: initialData.laboratory_id || '',
        processor: initialData.processor || '',
        ram: initialData.ram || '',
        storage: initialData.storage || '',
        os: initialData.os || initialData.operating_system || '',
        ip_address: initialData.ip_address || '',
        mac_address: initialData.mac_address || '',
        purchase_date: initialData.purchase_date ? initialData.purchase_date.split('T')[0] : '',
        warranty_expiry: initialData.warranty_expiry ? initialData.warranty_expiry.split('T')[0] : '',
        status: initialData.status || 'active',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.asset_tag || formData.asset_tag.trim() === '') {
      newErrors.asset_tag = 'Asset tag is required';
    }
    
    if (!formData.name || formData.name.toString().trim() === '') {
      newErrors.name = 'Workstation number is required';
    } else if (isNaN(parseInt(formData.name))) {
      newErrors.name = 'Workstation number must be a number (e.g., 1, 2, 3)';
    } else if (parseInt(formData.name) < 1) {
      newErrors.name = 'Workstation number must be greater than 0';
    }
    
    if (!formData.model || formData.model.trim() === '') {
      newErrors.model = 'Model is required';
    }
    
    if (!formData.laboratory_id) {
      newErrors.laboratory_id = 'Laboratory is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // For name field, only allow numbers
    if (name === 'name') {
      processedValue = value.replace(/[^0-9]/g, '');
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      const submitData = {
        ...formData,
        name: parseInt(formData.name) // Convert to integer
      };
      await onSubmit(submitData);
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Active', color: '#10b981' },
    { value: 'in-use', label: 'In Use', color: '#f59e0b' },
    { value: 'maintenance', label: 'Maintenance', color: '#ef4444' },
    { value: 'offline', label: 'Offline', color: '#6b7280' },
    { value: 'retired', label: 'Retired', color: '#9ca3af' }
  ];

  const ramOptions = ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'];
  const storageOptions = ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '1TB HDD', '2TB HDD'];
  const osOptions = ['Windows 10', 'Windows 11', 'Ubuntu 20.04', 'Ubuntu 22.04', 'macOS', 'Linux Mint', 'Fedora', 'Debian'];

  const formatLabName = (lab) => {
    return `${lab.name} (${lab.code}) - Capacity: ${lab.capacity}`;
  };

  return (
    <div className="computer-form-container">
      <div className="computer-form-header">
        <h2>{isEditing ? '✏️ Edit Computer' : '🖥️ Add New Computer'}</h2>
        <button type="button" className="close-btn" onClick={onCancel}>×</button>
      </div>
      
      <form onSubmit={handleSubmit} className="computer-form" noValidate>
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Asset Tag *</label>
              <input
                type="text"
                name="asset_tag"
                value={formData.asset_tag}
                onChange={handleChange}
                placeholder="e.g., PC001, PC002"
                className={errors.asset_tag ? 'error' : ''}
              />
              {errors.asset_tag && <span className="error-text">{errors.asset_tag}</span>}
            </div>
            
            <div className="form-group">
              <label>Workstation Number *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., 1, 2, 3"
                className={errors.name ? 'error' : ''}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
              <small className="helper-text">⚠️ Enter only numbers (e.g., 1, 2, 3). Do not enter text like "dell 2007".</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Dell, HP, Lenovo, Apple"
              />
            </div>
            
            <div className="form-group">
              <label>Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., OptiPlex 7080, EliteBook 840"
                className={errors.model ? 'error' : ''}
              />
              {errors.model && <span className="error-text">{errors.model}</span>}
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
                placeholder="Serial number"
              />
            </div>
            
            <div className="form-group">
              <label>Laboratory *</label>
              <select
                name="laboratory_id"
                value={formData.laboratory_id}
                onChange={handleChange}
                className={errors.laboratory_id ? 'error' : ''}
              >
                <option value="">-- Select a Laboratory --</option>
                {laboratories && laboratories.length > 0 ? (
                  laboratories.map(lab => (
                    <option key={lab.id} value={lab.id}>
                      {formatLabName(lab)}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No laboratories available</option>
                )}
              </select>
              {errors.laboratory_id && <span className="error-text">{errors.laboratory_id}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Hardware Specifications</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Processor</label>
              <input
                type="text"
                name="processor"
                value={formData.processor}
                onChange={handleChange}
                placeholder="e.g., Intel Core i7-10700"
              />
            </div>
            
            <div className="form-group">
              <label>RAM</label>
              <select name="ram" value={formData.ram} onChange={handleChange}>
                <option value="">Select RAM</option>
                {ramOptions.map(ram => <option key={ram} value={ram}>{ram}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Storage</label>
              <select name="storage" value={formData.storage} onChange={handleChange}>
                <option value="">Select Storage</option>
                {storageOptions.map(storage => <option key={storage} value={storage}>{storage}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Operating System</label>
              <select name="os" value={formData.os} onChange={handleChange}>
                <option value="">Select OS</option>
                {osOptions.map(os => <option key={os} value={os}>{os}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Network Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>IP Address</label>
              <input
                type="text"
                name="ip_address"
                value={formData.ip_address}
                onChange={handleChange}
                placeholder="e.g., 192.168.1.100"
              />
            </div>
            
            <div className="form-group">
              <label>MAC Address</label>
              <input
                type="text"
                name="mac_address"
                value={formData.mac_address}
                onChange={handleChange}
                placeholder="e.g., 00:1A:2B:3C:4D:5E"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Purchase & Warranty</h3>
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
          <h3>Status & Notes</h3>
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
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes about the computer..."
            />
          </div>
        </div>

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Computer' : 'Add Computer')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComputerForm;