import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { computerService } from '../../../services';
import './ComputerDetailPage.css';

const ComputerDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { isLabManager, isAdmin, isICT } = useRole();
  const { addToast } = useNotification();
  
  const [computer, setComputer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [showEdit, setShowEdit] = useState(false);

  const canEdit = isLabManager() || isAdmin() || isICT();

  useEffect(() => {
    loadComputerDetails();
    loadMaintenanceHistory();
  }, [id]);

  const loadComputerDetails = async () => {
    setLoading(true);
    const result = await computerService.getComputerById(id);
    if (result.success) {
      setComputer(result.data);
    } else {
      addToast(result.message || 'Computer not found', 'error');
      navigate('/computers');
    }
    setLoading(false);
  };

  const loadMaintenanceHistory = async () => {
    const result = await computerService.getMaintenanceHistory(id);
    if (result.success) {
      setMaintenanceHistory(result.data);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const result = await computerService.updateComputerStatus(id, newStatus);
    if (result.success) {
      addToast(`Status updated to ${newStatus}`, 'success');
      loadComputerDetails();
    } else {
      addToast(result.message || 'Failed to update status', 'error');
    }
  };

  const handleEdit = () => {
    navigate('/add-computer', { state: { computer } });
  };

  const getStatusBadge = (status) => {
    const configs = {
      available: { class: 'status-available', icon: '✅', text: 'Available' },
      'in-use': { class: 'status-in-use', icon: '🔧', text: 'In Use' },
      maintenance: { class: 'status-maintenance', icon: '⚠️', text: 'Maintenance' },
      damaged: { class: 'status-damaged', icon: '❌', text: 'Damaged' }
    };
    return configs[status] || configs.available;
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Loading computer details...</p>
      </div>
    );
  }

  if (!computer) {
    return (
      <div className="detail-not-found">
        <div className="not-found-icon">🖥️</div>
        <h2>Computer Not Found</h2>
        <p>The computer you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/computers')}>Back to Computers</button>
      </div>
    );
  }

  const statusConfig = getStatusBadge(computer.status);

  return (
    <div className="computer-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/computers')}>← Back to Computers</button>
        <div className="header-actions">
          {canEdit && (
            <button className="edit-btn" onClick={handleEdit}>✏️ Edit Computer</button>
          )}
        </div>
      </div>

      <div className="detail-content">
        {/* Computer Info Card */}
        <div className="info-card">
          <div className="card-header">
            <div className="computer-icon">🖥️</div>
            <h1>{computer.name}</h1>
            <div className={`status-badge ${statusConfig.class}`}>
              {statusConfig.icon} {statusConfig.text}
            </div>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Computer ID:</span>
              <span className="info-value">{computer.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Model:</span>
              <span className="info-value">{computer.model || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">CPU:</span>
              <span className="info-value">{computer.cpu || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">RAM:</span>
              <span className="info-value">{computer.ram || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Storage:</span>
              <span className="info-value">{computer.storage || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">OS:</span>
              <span className="info-value">{computer.os || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Laboratory:</span>
              <span className="info-value">{computer.lab || 'Not Assigned'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">IP Address:</span>
              <span className="info-value">{computer.ipAddress || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">MAC Address:</span>
              <span className="info-value">{computer.macAddress || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Purchase Date:</span>
              <span className="info-value">{computer.purchaseDate || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Warranty Expiry:</span>
              <span className="info-value">{computer.warrantyExpiry || 'N/A'}</span>
            </div>
          </div>

          {computer.notes && (
            <div className="notes-section">
              <h3>📝 Notes</h3>
              <p>{computer.notes}</p>
            </div>
          )}
        </div>

        {/* Status Update Section */}
        {canEdit && (
          <div className="status-card">
            <h3>Update Status</h3>
            <div className="status-buttons">
              <button 
                className={`status-option ${computer.status === 'available' ? 'active' : ''}`}
                onClick={() => handleStatusChange('available')}
              >
                ✅ Available
              </button>
              <button 
                className={`status-option ${computer.status === 'in-use' ? 'active' : ''}`}
                onClick={() => handleStatusChange('in-use')}
              >
                🔧 In Use
              </button>
              <button 
                className={`status-option ${computer.status === 'maintenance' ? 'active' : ''}`}
                onClick={() => handleStatusChange('maintenance')}
              >
                ⚠️ Maintenance
              </button>
              <button 
                className={`status-option ${computer.status === 'damaged' ? 'active' : ''}`}
                onClick={() => handleStatusChange('damaged')}
              >
                ❌ Damaged
              </button>
            </div>
          </div>
        )}

        {/* Maintenance History */}
        <div className="history-card">
          <h3>🔧 Maintenance History</h3>
          {maintenanceHistory.length === 0 ? (
            <div className="no-history">
              <p>No maintenance records found for this computer.</p>
            </div>
          ) : (
            <div className="history-list">
              {maintenanceHistory.map((record, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">{record.date}</div>
                  <div className="history-description">{record.description}</div>
                  <div className="history-status">{record.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComputerDetailPage;