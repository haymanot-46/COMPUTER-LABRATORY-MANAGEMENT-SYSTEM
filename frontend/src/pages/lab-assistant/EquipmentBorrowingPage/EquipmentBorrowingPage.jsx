import React, { useState, useEffect } from 'react';
import { borrowingService, apiClient } from '../../../services';
import './EquipmentBorrowingPage.css';

const EquipmentBorrowingPage = () => {
    const [equipment, setEquipment] = useState([]);
    const [borrowings, setBorrowings] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBorrowForm, setShowBorrowForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState('borrow');
    
    const [formData, setFormData] = useState({
        schedule_id: '',
        session_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '12:00',
        purpose: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        
        try {
            // Load available equipment
            const equipmentData = await borrowingService.getAvailableEquipment();
            if (equipmentData.success) {
                setEquipment(equipmentData.data);
            }
            
            // Load my borrowings
            const borrowingsData = await borrowingService.getMyBorrowings();
            if (borrowingsData.success) {
                setBorrowings(borrowingsData.data);
            }
            
            // Load today's schedules
            const today = new Date().toISOString().split('T')[0];
            const schedulesData = await apiClient.get(`/schedules/lab-assistant`, { date: today });
            if (schedulesData.success) {
                setSchedules(schedulesData.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addEquipmentToCart = (item) => {
        const existing = selectedEquipment.find(e => e.id === item.id);
        if (existing) {
            setSelectedEquipment(prev => prev.map(e => 
                e.id === item.id 
                    ? { ...e, quantity: Math.min(e.quantity + 1, e.available_quantity) }
                    : e
            ));
        } else {
            setSelectedEquipment([...selectedEquipment, { 
                ...item, 
                quantity: 1,
                maxQuantity: item.available_quantity
            }]);
        }
    };

    const removeEquipmentFromCart = (equipmentId) => {
        setSelectedEquipment(prev => prev.filter(e => e.id !== equipmentId));
    };

    const updateQuantity = (equipmentId, quantity) => {
        setSelectedEquipment(prev => prev.map(e => 
            e.id === equipmentId 
                ? { ...e, quantity: Math.min(Math.max(1, parseInt(quantity)), e.maxQuantity) }
                : e
        ));
    };

    const submitBorrowingRequest = async () => {
        if (selectedEquipment.length === 0) {
            alert('Please select at least one equipment item');
            return;
        }
        
        if (!formData.schedule_id) {
            alert('Please select a lab session');
            return;
        }
        
        const requestData = {
            schedule_id: parseInt(formData.schedule_id),
            session_date: formData.session_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            purpose: formData.purpose,
            items: selectedEquipment.map(e => ({
                equipment_id: e.id,
                quantity: e.quantity,
                equipment_name: e.name
            }))
        };
        
        try {
            const data = await borrowingService.createBorrowing(requestData);
            
            if (data.success) {
                alert('Borrowing request submitted successfully!');
                setShowBorrowForm(false);
                setSelectedEquipment([]);
                resetForm();
                loadData();
            } else {
                alert('Failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request');
        }
    };

    const returnEquipment = async (borrowingId) => {
        if (!window.confirm('Are you sure you want to return this equipment?')) return;
        
        try {
            const data = await borrowingService.returnBorrowing(borrowingId);
            if (data.success) {
                alert('Equipment returned successfully!');
                loadData();
            } else {
                alert('Failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error returning equipment:', error);
            alert('Failed to return equipment');
        }
    };

    const resetForm = () => {
        setFormData({
            schedule_id: '',
            session_date: new Date().toISOString().split('T')[0],
            start_time: '09:00',
            end_time: '12:00',
            purpose: ''
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { text: 'Pending', color: '#ff9800', icon: '⏳' },
            approved: { text: 'Approved', color: '#2196f3', icon: '✓' },
            borrowed: { text: 'Borrowed', color: '#4caf50', icon: '📦' },
            returned: { text: 'Returned', color: '#9e9e9e', icon: '↩️' },
            cancelled: { text: 'Cancelled', color: '#f44336', icon: '✗' }
        };
        const badge = badges[status] || { text: status, color: '#666', icon: '📋' };
        return (
            <span className={`status-badge status-${status}`}>
                {badge.icon} {badge.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading equipment borrowing data...</p>
            </div>
        );
    }

    return (
        <div className="equipment-borrowing-container">
            <div className="page-header">
                <h1>🛠️ Equipment Borrowing</h1>
                <p>Request and manage equipment for your lab sessions</p>
                <button className="new-request-btn" onClick={() => setShowBorrowForm(true)}>
                    + New Equipment Request
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button 
                    className={`tab ${selectedTab === 'borrow' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('borrow')}
                >
                    📦 Borrow Equipment
                </button>
                <button 
                    className={`tab ${selectedTab === 'my' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('my')}
                >
                    📋 My Borrowings
                </button>
            </div>

            {selectedTab === 'borrow' && (
                <div className="available-equipment">
                    <h2>Available Equipment</h2>
                    <div className="equipment-grid">
                        {equipment.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📦</div>
                                <h3>No Equipment Available</h3>
                                <p>There are no equipment items available for borrowing at this time.</p>
                            </div>
                        ) : (
                            equipment.map(item => (
                                <div key={item.id} className="equipment-card">
                                    <div className="equipment-icon">
                                        {item.category === 'projector' && '📽️'}
                                        {item.category === 'keyboard' && '⌨️'}
                                        {item.category === 'mouse' && '🖱️'}
                                        {item.category === 'ups' && '⚡'}
                                        {item.category === 'cable' && '🔌'}
                                        {(!item.category || item.category === 'other') && '🔧'}
                                    </div>
                                    <div className="equipment-info">
                                        <h3>{item.name}</h3>
                                        <p className="equipment-details">
                                            {item.model} | {item.brand}
                                        </p>
                                        <p className="available-qty">
                                            Available: {item.available_quantity} / {item.quantity}
                                        </p>
                                    </div>
                                    <button 
                                        className="borrow-btn"
                                        onClick={() => addEquipmentToCart(item)}
                                        disabled={item.available_quantity === 0}
                                    >
                                        Borrow
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {selectedTab === 'my' && (
                <div className="my-borrowings">
                    <h2>My Borrowing Requests</h2>
                    <div className="borrowings-list">
                        {borrowings.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📋</div>
                                <h3>No Borrowing Records</h3>
                                <p>You haven't made any equipment borrowing requests yet.</p>
                            </div>
                        ) : (
                            borrowings.map(borrowing => (
                                <div key={borrowing.id} className="borrowing-card">
                                    <div className="borrowing-header">
                                        <div className="borrowing-code">{borrowing.borrowing_code}</div>
                                        {getStatusBadge(borrowing.status)}
                                    </div>
                                    <div className="borrowing-details">
                                        <div className="detail-row">
                                            <span>📅 {new Date(borrowing.session_date).toLocaleDateString()}</span>
                                            <span>🕒 {borrowing.start_time} - {borrowing.end_time}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>📚 {borrowing.course_name || 'Lab Session'}</span>
                                            <span>🔬 {borrowing.lab_name || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>📦 Items: {borrowing.items_count}</span>
                                        </div>
                                        {borrowing.purpose && (
                                            <div className="detail-row">
                                                <span>📝 {borrowing.purpose}</span>
                                            </div>
                                        )}
                                    </div>
                                    {borrowing.status === 'borrowed' && (
                                        <button 
                                            className="return-btn"
                                            onClick={() => returnEquipment(borrowing.id)}
                                        >
                                            Return Equipment
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Borrowing Form Modal */}
            {showBorrowForm && (
                <div className="modal-overlay" onClick={() => setShowBorrowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Request Equipment</h2>
                            <button className="close-btn" onClick={() => setShowBorrowForm(false)}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-section">
                                <h3>Session Information</h3>
                                <div className="form-group">
                                    <label>Select Lab Session *</label>
                                    <select 
                                        value={formData.schedule_id}
                                        onChange={(e) => {
                                            const schedule = schedules.find(s => s.id === parseInt(e.target.value));
                                            setFormData({
                                                ...formData,
                                                schedule_id: e.target.value,
                                                session_date: schedule?.schedule_date || formData.session_date,
                                                start_time: schedule?.start_time || formData.start_time,
                                                end_time: schedule?.end_time || formData.end_time
                                            });
                                        }}
                                        required
                                    >
                                        <option value="">Select a session</option>
                                        {schedules.map(schedule => (
                                            <option key={schedule.id} value={schedule.id}>
                                                {schedule.course_name} - {schedule.start_time} to {schedule.end_time}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input type="date" value={formData.session_date} disabled />
                                    </div>
                                    <div className="form-group">
                                        <label>Start Time</label>
                                        <input type="time" value={formData.start_time} disabled />
                                    </div>
                                    <div className="form-group">
                                        <label>End Time</label>
                                        <input type="time" value={formData.end_time} disabled />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Purpose / Notes</label>
                                    <textarea 
                                        rows="3"
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                                        placeholder="e.g., Needed for networking lab session..."
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Selected Equipment ({selectedEquipment.length} items)</h3>
                                {selectedEquipment.length === 0 ? (
                                    <div className="empty-cart">
                                        <p>No equipment selected. Click "Borrow" on equipment above to add.</p>
                                    </div>
                                ) : (
                                    <div className="cart-items">
                                        {selectedEquipment.map(item => (
                                            <div key={item.id} className="cart-item">
                                                <div className="cart-item-info">
                                                    <strong>{item.name}</strong>
                                                    <span className="cart-item-category">{item.category}</span>
                                                    <span className="cart-item-available">Max: {item.maxQuantity}</span>
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
                                                        className="remove-btn"
                                                        onClick={() => removeEquipmentFromCart(item.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowBorrowForm(false)}>
                                Cancel
                            </button>
                            <button 
                                className="submit-btn"
                                onClick={submitBorrowingRequest}
                                disabled={selectedEquipment.length === 0}
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentBorrowingPage;