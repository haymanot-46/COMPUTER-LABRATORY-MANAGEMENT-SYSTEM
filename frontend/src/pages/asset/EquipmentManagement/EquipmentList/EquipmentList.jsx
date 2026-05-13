// frontend/src/pages/asset/EquipmentManagement/EquipmentList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../hooks';
import StatusBadge from '../Components/StatusBadge';
import './EquipmentList.css';

const EquipmentList = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    laboratory: 'all'
  });
  const [categories, setCategories] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadEquipment();
    loadCategories();
    loadLaboratories();
  }, [filters, currentPage]);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      });
      
      const response = await fetch(`http://localhost:5001/api/equipment?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setEquipment(data.data);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        addToast(data.message || 'Failed to load equipment', 'error');
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      addToast('Error loading equipment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/equipment/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/equipment/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        addToast('Equipment deleted successfully', 'success');
        loadEquipment();
      } else {
        addToast(data.message || 'Failed to delete', 'error');
      }
    } catch (error) {
      addToast('Error deleting equipment', 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="equipment-list-container">
      <div className="page-header">
        <h1>Equipment Status</h1>
        <p>View and manage all equipment in the university</p>
        <button 
          className="add-equipment-btn"
          onClick={() => navigate('/asset/register-equipment')}
        >
          + Register New Equipment
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span className="material-icons">search</span>
          <input
            type="text"
            placeholder="Search by name, code, or serial number..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <select 
          value={filters.category} 
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <select 
          value={filters.status} 
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="in-use">In Use</option>
          <option value="maintenance">Maintenance</option>
          <option value="damaged">Damaged</option>
          <option value="retired">Retired</option>
        </select>
        
        <select 
          value={filters.laboratory} 
          onChange={(e) => handleFilterChange('laboratory', e.target.value)}
        >
          <option value="all">All Laboratories</option>
          {laboratories.map(lab => (
            <option key={lab.id} value={lab.id}>{lab.name}</option>
          ))}
        </select>
      </div>

      {/* Equipment Table */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="equipment-table-wrapper">
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Equipment Name</th>
                  <th>Category</th>
                  <th>Laboratory</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Purchase Cost</th>
                  <th>Warranty Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">
                      <div className="no-data-content">
                        <span className="material-icons">inventory_2</span>
                        <p>No equipment found</p>
                        <button onClick={() => navigate('/asset/register-equipment')}>
                          Register Equipment
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  equipment.map(item => (
                    <tr key={item.id}>
                      <td><code>{item.code}</code></td>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.category}</td>
                      <td>{item.laboratory_name || item.laboratory || 'Not Assigned'}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>
                        <span className={`condition-badge ${item.condition}`}>
                          {item.condition}
                        </span>
                      </td>
                      <td>{formatCurrency(item.purchase_cost)}</td>
                      <td>
                        {item.warranty_expiry ? (
                          <span className={`warranty-date ${new Date(item.warranty_expiry) < new Date() ? 'expired' : ''}`}>
                            {new Date(item.warranty_expiry).toLocaleDateString()}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="actions">
                        <button 
                          className="view-btn"
                          onClick={() => navigate(`/asset/equipment/${item.id}`)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button 
                          className="edit-btn"
                          onClick={() => navigate(`/asset/equipment/${item.id}/edit`)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EquipmentList;