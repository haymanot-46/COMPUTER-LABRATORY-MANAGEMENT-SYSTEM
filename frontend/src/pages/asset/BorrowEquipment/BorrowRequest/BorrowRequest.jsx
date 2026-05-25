// frontend/src/pages/asset/BorrowEquipment/BorrowRequest.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../hooks';
import { assetService, apiClient } from '../../../../services';
import './BorrowRequest.css';

const BorrowRequest = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  
  const [equipment, setEquipment] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    purpose: '',
    expected_return_date: '',
    requester_name: '',
    requester_department: ''
  });

  useEffect(() => {
    loadAvailableEquipment();
  }, []);

  const loadAvailableEquipment = async () => {
    setLoading(true);
    try {
      const data = await assetService.getEquipment({ status: 'available' });
      
      if (data.success) {
        setEquipment(data.data);
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      setSelectedItems(prev => prev.map(i =>
        i.id === item.id 
          ? { ...i, quantity: Math.min(i.quantity + 1, i.available_quantity || 1) }
          : i
      ));
    } else {
      setSelectedItems([...selectedItems, { 
        ...item, 
        quantity: 1,
        maxQuantity: item.available_quantity || 1
      }]);
    }
  };

  const removeFromCart = (id) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    const newQuantity = Math.min(Math.max(1, parseInt(quantity)), 
      selectedItems.find(i => i.id === id)?.maxQuantity || 1);
    setSelectedItems(prev => prev.map(i =>
      i.id === id ? { ...i, quantity: newQuantity } : i
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      addToast('Please select at least one equipment item', 'error');
      return;
    }
    
    try {
      const data = await apiClient.post('/borrow-requests', {
        items: selectedItems.map(i => ({
          equipment_id: i.id,
          quantity: i.quantity
        })),
        purpose: formData.purpose,
        expected_return_date: formData.expected_return_date,
        requester_name: formData.requester_name,
        requester_department: formData.requester_department
      });

      if (data.success) {
        addToast('Borrow request submitted successfully!', 'success');
        navigate('/asset/borrow/history');
      } else {
        addToast(data.message || 'Failed to submit request', 'error');
      }
    } catch (error) {
      addToast('Error submitting request', 'error');
    }
  };

  return (
    <div className="borrow-request-container">
      <div className="page-header">
        <h1>Borrow Equipment</h1>
        <p>Request equipment for lab sessions or events</p>
      </div>

      <div className="borrow-layout">
        {/* Available Equipment */}
        <div className="equipment-section">
          <h2>Available Equipment</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="equipment-grid">
              {equipment.length === 0 ? (
                <div className="empty-state">
                  <p>No equipment available for borrowing</p>
                </div>
              ) : (
                equipment.map(item => (
                  <div key={item.id} className="equipment-card">
                    <div className="equipment-icon">
                      <span className="material-icons">
                        {item.category === 'Computer' ? 'computer' :
                         item.category === 'Monitor' ? 'monitor' :
                         item.category === 'Projector' ? 'present_to_all' :
                         'devices'}
                      </span>
                    </div>
                    <div className="equipment-info">
                      <div className="equipment-name">{item.name}</div>
                      <div className="equipment-code">{item.code}</div>
                      <div className="equipment-stock">
                        Available: {item.available_quantity || 1}
                      </div>
                    </div>
                    <button 
                      className="add-btn"
                      onClick={() => addToCart(item)}
                      disabled={(item.available_quantity || 1) === 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Request Form */}
        <div className="request-section">
          <h2>Borrow Request</h2>
          <form onSubmit={handleSubmit}>
            <div className="selected-items">
              <h3>Selected Items ({selectedItems.length})</h3>
              {selectedItems.length === 0 ? (
                <div className="empty-cart">
                  <p>No items selected</p>
                </div>
              ) : (
                <div className="cart-items">
                  {selectedItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-code">{item.code}</div>
                      </div>
                      <div className="cart-item-controls">
                        <input
                          type="number"
                          min="1"
                          max={item.maxQuantity}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                          className="quantity-input"
                        />
                        <button 
                          type="button"
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Purpose / Reason *</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                placeholder="Explain why you need this equipment..."
                required
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expected Return Date *</label>
                <input
                  type="date"
                  value={formData.expected_return_date}
                  onChange={(e) => setFormData({...formData, expected_return_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  value={formData.requester_name}
                  onChange={(e) => setFormData({...formData, requester_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={formData.requester_department}
                  onChange={(e) => setFormData({...formData, requester_department: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={selectedItems.length === 0}>
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BorrowRequest;