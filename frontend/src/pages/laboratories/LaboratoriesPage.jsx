import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks';
import apiService from '../../services/ApiService';
import LaboratoryForm from '../../components/laboratories/LaboratoryForm';
import './LaboratoriesPage.css';

const LaboratoriesPage = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLaboratories();
  }, []);

  const fetchLaboratories = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/laboratories');
      if (response && response.success) {
        setLaboratories(response.data);
      }
    } catch (error) {
      console.error('Error fetching laboratories:', error);
      addToast('Failed to load laboratories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLaboratory = async (labData) => {
    try {
      const response = await apiService.post('/laboratories', labData);
      if (response && response.success) {
        addToast('Laboratory added successfully!', 'success');
        setShowAddModal(false);
        fetchLaboratories();
      }
    } catch (error) {
      console.error('Error adding laboratory:', error);
      addToast(error.response?.data?.message || 'Failed to add laboratory', 'error');
    }
  };

  const handleUpdateLaboratory = async (labData) => {
    try {
      const response = await apiService.put(`/laboratories/${selectedLab.id}`, labData);
      if (response && response.success) {
        addToast('Laboratory updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedLab(null);
        fetchLaboratories();
      }
    } catch (error) {
      console.error('Error updating laboratory:', error);
      addToast('Failed to update laboratory', 'error');
    }
  };

  const handleDeleteLaboratory = async (lab) => {
    if (window.confirm(`Are you sure you want to delete ${lab.name}? This will also remove all associated computers.`)) {
      try {
        const response = await apiService.delete(`/laboratories/${lab.id}`);
        if (response && response.success) {
          addToast('Laboratory deleted successfully!', 'success');
          fetchLaboratories();
        }
      } catch (error) {
        console.error('Error deleting laboratory:', error);
        addToast(error.response?.data?.message || 'Failed to delete laboratory', 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', color: '#10b981', bg: '#d1fae5' },
      maintenance: { label: 'Maintenance', color: '#f59e0b', bg: '#fed7aa' },
      closed: { label: 'Closed', color: '#ef4444', bg: '#fee2e2' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className="status-badge" style={{ backgroundColor: config.bg, color: config.color }}>
        {config.label}
      </span>
    );
  };

  const filteredLabs = laboratories.filter(lab => {
    const matchesSearch = searchTerm === '' ||
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lab.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading laboratories...</p>
      </div>
    );
  }

  return (
    <div className="laboratories-page">
      <div className="laboratories-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h1>🔬 Laboratory Management</h1>
            <p>Manage all computer laboratories in the system</p>
          </div>
        </div>
        <button className="add-lab-btn" onClick={() => setShowAddModal(true)}>
          + Add Laboratory
        </button>
      </div>

      <div className="laboratories-filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="🔎 Search by name, code, or building..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="laboratories-stats">
        <div className="stat-card">
          <span className="stat-value">{laboratories.length}</span>
          <span className="stat-label">Total Labs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{laboratories.filter(l => l.status === 'active').length}</span>
          <span className="stat-label">Active Labs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{laboratories.reduce((sum, lab) => sum + (lab.computer_count || 0), 0)}</span>
          <span className="stat-label">Total Computers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{laboratories.reduce((sum, lab) => sum + (lab.capacity || 0), 0)}</span>
          <span className="stat-label">Total Capacity</span>
        </div>
      </div>

      <div className="laboratories-grid">
        {filteredLabs.length === 0 ? (
          <div className="no-data">No laboratories found</div>
        ) : (
          filteredLabs.map(lab => (
            <div key={lab.id} className="laboratory-card">
              <div className="lab-card-header">
                <div className="lab-icon">🔬</div>
                <div className="lab-info">
                  <h3>{lab.name}</h3>
                  <p className="lab-code">{lab.code}</p>
                </div>
                {getStatusBadge(lab.status)}
              </div>
              
              <div className="lab-details">
                <div className="detail-item">
                  <span className="detail-label">Building:</span>
                  <span className="detail-value">{lab.building}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Floor:</span>
                  <span className="detail-value">{lab.floor || 'Ground'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Capacity:</span>
                  <span className="detail-value">{lab.capacity} students</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Computers:</span>
                  <span className="detail-value">{lab.computer_count || 0}</span>
                </div>
              </div>
              
              {lab.description && (
                <div className="lab-description">
                  <p>{lab.description}</p>
                </div>
              )}
              
              <div className="lab-card-actions">
                <button 
                  className="view-btn"
                  onClick={() => {
                    setSelectedLab(lab);
                    setShowDetailsModal(true);
                  }}
                >
                  View Details
                </button>
                <button 
                  className="edit-btn"
                  onClick={() => {
                    setSelectedLab(lab);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteLaboratory(lab)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Laboratory Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <LaboratoryForm
              onSubmit={handleAddLaboratory}
              onCancel={() => setShowAddModal(false)}
              isEditing={false}
            />
          </div>
        </div>
      )}

      {/* Edit Laboratory Modal */}
      {showEditModal && selectedLab && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <LaboratoryForm
              onSubmit={handleUpdateLaboratory}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedLab(null);
              }}
              initialData={selectedLab}
              isEditing={true}
            />
          </div>
        </div>
      )}

      {/* Laboratory Details Modal */}
      {showDetailsModal && selectedLab && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content-details" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <h2>{selectedLab.name}</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="details-body">
              <div className="details-grid">
                <div className="details-item">
                  <label>Code:</label>
                  <span>{selectedLab.code}</span>
                </div>
                <div className="details-item">
                  <label>Building:</label>
                  <span>{selectedLab.building}</span>
                </div>
                <div className="details-item">
                  <label>Floor:</label>
                  <span>{selectedLab.floor || 'Ground'}</span>
                </div>
                <div className="details-item">
                  <label>Capacity:</label>
                  <span>{selectedLab.capacity} students</span>
                </div>
                <div className="details-item">
                  <label>Computers:</label>
                  <span>{selectedLab.computer_count || 0}</span>
                </div>
                <div className="details-item">
                  <label>Available Computers:</label>
                  <span>{selectedLab.available_computers || 0}</span>
                </div>
                <div className="details-item">
                  <label>Computers In Use:</label>
                  <span>{selectedLab.in_use_computers || 0}</span>
                </div>
                <div className="details-item">
                  <label>Status:</label>
                  <span>{getStatusBadge(selectedLab.status)}</span>
                </div>
              </div>
              {selectedLab.description && (
                <div className="details-description">
                  <label>Description:</label>
                  <p>{selectedLab.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratoriesPage;