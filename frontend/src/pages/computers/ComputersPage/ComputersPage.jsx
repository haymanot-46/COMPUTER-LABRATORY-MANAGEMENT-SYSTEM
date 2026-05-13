import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // ← ADD THIS
import { useNotification } from '../../../hooks';
import apiService from '../../../services/ApiService';
import ComputerForm from '../../../components/Computers/computerForm/ComputerForm';
import ComputerFilter from '../../../components/Computers/computerFilter/ComputerFilter';
import './ComputersPage.css';

const ComputersPage = () => {
  const navigate = useNavigate();  // ← ADD THIS for navigation
  const { addToast } = useNotification();
  const [computers, setComputers] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedComputer, setSelectedComputer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ lab: 'all', status: 'all' });

  useEffect(() => {
    fetchComputers();
    fetchLaboratories();
  }, []);

  // ← ADD THIS: Function to navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');  // Change '/dashboard' to your actual dashboard route
  };

  const fetchComputers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/computers');
      if (response && response.success) {
        setComputers(response.data);
      }
    } catch (error) {
      console.error('Error fetching computers:', error);
      addToast('Failed to load computers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLaboratories = async () => {
    try {
      const response = await apiService.get('/laboratories');
      if (response && response.success) {
        setLaboratories(response.data);
      }
    } catch (error) {
      console.error('Error fetching laboratories:', error);
    }
  };

  const handleAddComputer = async (computerData) => {
    try {
      const response = await apiService.post('/computers', computerData);
      if (response && response.success) {
        addToast('Computer added successfully!', 'success');
        setShowAddModal(false);
        fetchComputers();
      }
    } catch (error) {
      console.error('Error adding computer:', error);
      addToast(error.response?.data?.message || 'Failed to add computer', 'error');
    }
  };

  const handleUpdateComputer = async (computerData) => {
    try {
      const response = await apiService.put(`/computers/${selectedComputer.id}`, computerData);
      if (response && response.success) {
        addToast('Computer updated successfully!', 'success');
        setShowEditModal(false);
        setSelectedComputer(null);
        fetchComputers();
      }
    } catch (error) {
      console.error('Error updating computer:', error);
      addToast('Failed to update computer', 'error');
    }
  };

  const handleDeleteComputer = async (computer) => {
    if (window.confirm(`Are you sure you want to delete ${computer.name || computer.workstation_number}?`)) {
      try {
        const response = await apiService.delete(`/computers/${computer.id}`);
        if (response && response.success) {
          addToast('Computer deleted successfully!', 'success');
          fetchComputers();
        }
      } catch (error) {
        console.error('Error deleting computer:', error);
        addToast('Failed to delete computer', 'error');
      }
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  // Filter computers - FIXED: Convert all values to strings before using toLowerCase
  const filteredComputers = computers.filter(computer => {
    // Convert values to strings safely
    const computerName = String(computer.name || computer.workstation_number || '').toLowerCase();
    const assetTag = String(computer.asset_tag || computer.code || '').toLowerCase();
    const model = String(computer.model || '').toLowerCase();
    const searchLower = String(searchTerm).toLowerCase();
    
    const matchesSearch = searchTerm === '' ||
      computerName.includes(searchLower) ||
      assetTag.includes(searchLower) ||
      model.includes(searchLower);

    const matchesLab = filters.lab === 'all' || computer.laboratory_id == filters.lab;
    const matchesStatus = filters.status === 'all' || computer.status === filters.status;

    return matchesSearch && matchesLab && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      active: { color: '#10b981', bg: '#d1fae5', label: 'Active' },
      'in-use': { color: '#f59e0b', bg: '#fed7aa', label: 'In Use' },
      maintenance: { color: '#ef4444', bg: '#fee2e2', label: 'Maintenance' },
      offline: { color: '#6b7280', bg: '#f3f4f6', label: 'Offline' },
      retired: { color: '#9ca3af', bg: '#f3f4f6', label: 'Retired' }
    };
    const colors = statusColors[status] || statusColors.active;
    return (
      <span className="status-badge" style={{ backgroundColor: colors.bg, color: colors.color }}>
        {colors.label}
      </span>
    );
  };

  const getLabName = (labId) => {
    const lab = laboratories.find(l => l.id === labId);
    return lab ? `${lab.name} (${lab.code})` : 'Unknown Lab';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading computers...</p>
      </div>
    );
  }

  return (
    <div className="computers-page">
      <div className="computers-header">
        {/* ← ADD THIS: Back Arrow Button */}
        <div className="header-left">
          <button 
            className="back-arrow-btn"
            onClick={handleBackToDashboard}
            title="Back to Dashboard"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <div className="header-title">
          <h1>🖥️ Computer Management</h1>
          <p>Manage all computers in the laboratory system</p>
        </div>
        
        <button className="add-computer-btn" onClick={() => setShowAddModal(true)}>
          + Add Computer
        </button>
      </div>

      <ComputerFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        laboratories={laboratories}
      />

      <div className="computers-stats">
        <div className="stat-card">
          <span className="stat-value">{filteredComputers.length}</span>
          <span className="stat-label">Filtered Computers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{computers.length}</span>
          <span className="stat-label">Total Computers</span>
        </div>
      </div>

      <div className="computers-table-container">
        <table className="computers-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Workstation #</th>
              <th>Model</th>
              <th>Laboratory</th>
              <th>Processor</th>
              <th>RAM</th>
              <th>Storage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComputers.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">No computers found</td>
              </tr>
            ) : (
              filteredComputers.map(computer => (
                <tr key={computer.id}>
                  <td><code>{computer.asset_tag || computer.code}</code></td>
                  <td><strong>{computer.name || computer.workstation_number}</strong></td>
                  <td>{computer.model || '-'}</td>
                  <td>{getLabName(computer.laboratory_id)}</td>
                  <td>{computer.processor || '-'}</td>
                  <td>{computer.ram || '-'}</td>
                  <td>{computer.storage || '-'}</td>
                  <td>{getStatusBadge(computer.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => {
                          setSelectedComputer(computer);
                          setShowEditModal(true);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteComputer(computer)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Computer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ComputerForm
              onSubmit={handleAddComputer}
              onCancel={() => setShowAddModal(false)}
              laboratories={laboratories}
              isEditing={false}
            />
          </div>
        </div>
      )}

      {/* Edit Computer Modal */}
      {showEditModal && selectedComputer && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ComputerForm
              onSubmit={handleUpdateComputer}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedComputer(null);
              }}
              initialData={selectedComputer}
              laboratories={laboratories}
              isEditing={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComputersPage;