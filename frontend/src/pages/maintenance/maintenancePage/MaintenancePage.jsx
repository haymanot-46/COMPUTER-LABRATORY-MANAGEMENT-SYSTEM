import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import maintenanceService from '../../../services/MaintenanceService';
import './MaintenancePage.css';

const MaintenancePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLabManager, isICT, isAdmin } = useRole();
  const { addToast } = useNotification();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    computer_id: '',
    laboratory_id: '',
    reported_by: user?.id || ''
  });
  const [laboratories, setLaboratories] = useState([]);
  const [computers, setComputers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadRequests();
    loadLaboratories();
    loadComputers();
  }, [filterStatus, filterPriority]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const filters = {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined
      };
      const response = await maintenanceService.getRequests(filters);
      if (response && response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      addToast('Failed to load maintenance requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLaboratories = async () => {
    try {
      const response = await maintenanceService.getLaboratories?.() || await fetch('/api/laboratories').then(r => r.json());
      if (response && response.success) {
        setLaboratories(response.data);
      }
    } catch (error) {
      console.error('Error loading laboratories:', error);
    }
  };

  const loadComputers = async () => {
    try {
      const response = await fetch('/api/computers').then(r => r.json());
      if (response && response.success) {
        setComputers(response.data);
      }
    } catch (error) {
      console.error('Error loading computers:', error);
    }
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await maintenanceService.createRequest(formData);
      if (response && response.success) {
        addToast('Maintenance request created successfully!', 'success');
        setShowAddModal(false);
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          computer_id: '',
          laboratory_id: '',
          reported_by: user?.id || ''
        });
        loadRequests();
      }
    } catch (error) {
      console.error('Error creating request:', error);
      addToast('Failed to create request', 'error');
    }
  };

  const handleAssignTechnician = async (requestId, technicianId, notes) => {
    try {
      const response = await maintenanceService.assignTechnician(requestId, technicianId, notes);
      if (response && response.success) {
        addToast('Technician assigned successfully!', 'success');
        setShowAssignment(false);
        loadRequests();
      }
    } catch (error) {
      addToast('Failed to assign technician', 'error');
    }
  };

  const handleCompleteRequest = async (requestId, resolution, partsUsed) => {
    try {
      const response = await maintenanceService.completeRequest(requestId, resolution, partsUsed);
      if (response && response.success) {
        addToast('Request completed successfully!', 'success');
        setShowResolution(false);
        loadRequests();
      }
    } catch (error) {
      addToast('Failed to complete request', 'error');
    }
  };

  const handleCancelRequest = async (requestId, reason) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        const response = await maintenanceService.cancelRequest(requestId, reason);
        if (response && response.success) {
          addToast('Request cancelled successfully', 'success');
          loadRequests();
        }
      } catch (error) {
        addToast('Failed to cancel request', 'error');
      }
    }
  };

const handleExport = async () => {
    try {
        const response = await maintenanceService.exportRequests();
        
        // Create a blob from the response
        const blob = new Blob([response], { type: 'text/csv' });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `maintenance_requests_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        
        addToast('Export successful!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        addToast('Export failed', 'error');
    }
};

  const getPriorityBadge = (priority) => {
    const config = {
      low: { label: 'Low', color: '#10b981', bg: '#d1fae5' },
      medium: { label: 'Medium', color: '#f59e0b', bg: '#fed7aa' },
      high: { label: 'High', color: '#f97316', bg: '#fed7aa' },
      urgent: { label: 'Urgent', color: '#ef4444', bg: '#fee2e2' }
    };
    const { label, color, bg } = config[priority] || config.medium;
    return <span className={`priority-badge priority-${priority}`} style={{ backgroundColor: bg, color }}>{label}</span>;
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pending', color: '#f59e0b', bg: '#fed7aa' },
      'in-progress': { label: 'In Progress', color: '#3b82f6', bg: '#dbeafe' },
      completed: { label: 'Completed', color: '#10b981', bg: '#d1fae5' },
      cancelled: { label: 'Cancelled', color: '#6b7280', bg: '#f3f4f6' }
    };
    const { label, color, bg } = config[status] || config.pending;
    return <span className={`status-badge status-${status}`} style={{ backgroundColor: bg, color }}>{label}</span>;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  if (loading) {
    return (
      <div className="maintenance-loading">
        <div className="spinner"></div>
        <p>Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <div className="maintenance-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>🔧 Maintenance Management</h1>
          <p>Manage all maintenance requests for computers and equipment</p>
        </div>
        <div className="header-right">
          <button className="export-btn" onClick={() => maintenanceService.exportRequests()}>
            📥 Export
          </button>
          {(isAdmin() || isLabManager()) && (
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              + New Request
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{requests.length}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{requests.filter(r => r.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{requests.filter(r => r.status === 'in-progress').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{requests.filter(r => r.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="requests-table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Computer/Lab</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Reported By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No maintenance requests found</td>
              </tr>
            ) : (
              currentRequests.map(request => (
                <tr key={request.id}>
                  <td>#{request.id}</td>
                  <td><strong>{request.title}</strong></td>
                  <td>{request.computer_name || request.computer || '-'}<br/><small>{request.laboratory_name || request.lab}</small></td>
                  <td>{getPriorityBadge(request.priority)}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>{request.reported_by_name || request.reported_by}</td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn" onClick={() => {
                        setSelectedRequest(request);
                        setShowDetail(true);
                      }}>View</button>
                      {(isAdmin() || isICT()) && request.status === 'pending' && (
                        <button className="assign-btn" onClick={() => {
                          setSelectedRequest(request);
                          setShowAssignment(true);
                        }}>Assign</button>
                      )}
                      {(isAdmin() || isICT()) && request.status === 'in-progress' && (
                        <button className="complete-btn" onClick={() => {
                          setSelectedRequest(request);
                          setShowResolution(true);
                        }}>Complete</button>
                      )}
                      {(isAdmin() || isICT() || request.reported_by === user?.id) && request.status === 'pending' && (
                        <button className="cancel-btn" onClick={() => handleCancelRequest(request.id, 'Cancelled by user')}>Cancel</button>
                      )}
                    </div>
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
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Previous</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
        </div>
      )}

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Maintenance Request</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddRequest}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Computer not booting" />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" placeholder="Detailed description of the issue..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Laboratory</label>
                  <select value={formData.laboratory_id} onChange={(e) => setFormData({...formData, laboratory_id: e.target.value})}>
                    <option value="">Select Laboratory</option>
                    {laboratories.map(lab => <option key={lab.id} value={lab.id}>{lab.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Computer</label>
                  <select value={formData.computer_id} onChange={(e) => setFormData({...formData, computer_id: e.target.value})}>
                    <option value="">Select Computer</option>
                    {computers.map(comp => <option key={comp.id} value={comp.id}>{comp.name} ({comp.asset_tag})</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Priority *</label>
                <select required value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {showDetail && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content-details" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <h2>Maintenance Request #{selectedRequest.id}</h2>
              <button className="close-btn" onClick={() => setShowDetail(false)}>×</button>
            </div>
            <div className="details-body">
              <div className="details-grid">
                <div className="details-item"><label>Title:</label><span>{selectedRequest.title}</span></div>
                <div className="details-item"><label>Priority:</label><span>{getPriorityBadge(selectedRequest.priority)}</span></div>
                <div className="details-item"><label>Status:</label><span>{getStatusBadge(selectedRequest.status)}</span></div>
                <div className="details-item"><label>Reported By:</label><span>{selectedRequest.reported_by_name || selectedRequest.reported_by}</span></div>
                <div className="details-item"><label>Date:</label><span>{new Date(selectedRequest.created_at).toLocaleString()}</span></div>
                <div className="details-item"><label>Laboratory:</label><span>{selectedRequest.laboratory_name || selectedRequest.lab || '-'}</span></div>
                <div className="details-item"><label>Computer:</label><span>{selectedRequest.computer_name || selectedRequest.computer || '-'}</span></div>
                {selectedRequest.assigned_to_name && (
                  <div className="details-item"><label>Assigned To:</label><span>{selectedRequest.assigned_to_name}</span></div>
                )}
                {selectedRequest.completed_at && (
                  <div className="details-item"><label>Completed:</label><span>{new Date(selectedRequest.completed_at).toLocaleString()}</span></div>
                )}
              </div>
              <div className="details-description"><label>Description:</label><p>{selectedRequest.description}</p></div>
              {selectedRequest.resolution && (
                <div className="details-resolution"><label>Resolution:</label><p>{selectedRequest.resolution}</p></div>
              )}
            </div>
            <div className="details-footer">
              <button className="close-modal-btn" onClick={() => setShowDetail(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignment && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowAssignment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Assign Technician</h2><button className="close-btn" onClick={() => setShowAssignment(false)}>×</button></div>
            <div className="modal-body">
              <p><strong>Request:</strong> {selectedRequest.title}</p>
              <div className="form-group">
                <label>Select Technician</label>
                <select id="technicianSelect">
                  <option value="">-- Select Technician --</option>
                  <option value="1">John Doe - Hardware Specialist</option>
                  <option value="2">Jane Smith - Software Specialist</option>
                  <option value="3">Bob Johnson - Network Specialist</option>
                </select>
              </div>
              <div className="form-group"><label>Notes (Optional)</label><textarea id="assignNotes" rows="2" placeholder="Additional instructions for technician..."></textarea></div>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowAssignment(false)}>Cancel</button>
              <button onClick={() => {
                const techId = document.getElementById('technicianSelect').value;
                const notes = document.getElementById('assignNotes').value;
                if (techId) handleAssignTechnician(selectedRequest.id, techId, notes);
                else alert('Please select a technician');
              }}>Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {showResolution && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowResolution(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Complete Maintenance</h2><button className="close-btn" onClick={() => setShowResolution(false)}>×</button></div>
            <div className="modal-body">
              <p><strong>Request:</strong> {selectedRequest.title}</p>
              <div className="form-group"><label>Resolution *</label><textarea id="resolutionText" rows="3" required placeholder="Describe how the issue was resolved..."></textarea></div>
              <div className="form-group"><label>Parts Used (Optional)</label><input type="text" id="partsUsed" placeholder="e.g., New RAM, Power supply, etc." /></div>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowResolution(false)}>Cancel</button>
              <button onClick={() => {
                const resolution = document.getElementById('resolutionText').value;
                if (resolution) handleCompleteRequest(selectedRequest.id, resolution, document.getElementById('partsUsed').value);
                else alert('Please enter resolution details');
              }}>Complete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;