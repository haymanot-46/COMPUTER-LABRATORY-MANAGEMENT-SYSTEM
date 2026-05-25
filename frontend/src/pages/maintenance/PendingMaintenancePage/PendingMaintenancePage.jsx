// frontend/src/pages/ict/PendingApprovalsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '../../../hooks';
import { maintenanceService } from '../../../services';
import './PendingMaintenancePage.css';

const PendingApprovalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPendingRequests();
    const interval = setInterval(loadPendingRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingRequests = async () => {
    setLoading(true);
    try {
      const result = await maintenanceService.getRequests({ status: 'submitted' });
      if (result?.success && result.data) {
        setPendingRequests(result.data);
      } else {
        setPendingRequests([]);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
      addToast('Failed to load pending requests', 'error');
      setPendingRequests([]);
    }
    setLoading(false);
  };

  const handleApprove = async (requestId) => {
    try {
      await maintenanceService.assignTechnician(requestId, user?.id);
      addToast('Maintenance request assigned to you successfully', 'success');
      loadPendingRequests();
    } catch (error) {
      addToast('Failed to assign request', 'error');
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await maintenanceService.cancelRequest(requestId, reason);
        addToast('Maintenance request rejected', 'warning');
        loadPendingRequests();
      } catch (error) {
        addToast('Failed to reject request', 'error');
      }
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return <span className="priority-badge high">🔴 High</span>;
      case 'medium': return <span className="priority-badge medium">🟡 Medium</span>;
      case 'low': return <span className="priority-badge low">🟢 Low</span>;
      default: return <span className="priority-badge medium">🟡 Medium</span>;
    }
  };

  const filteredRequests = pendingRequests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  if (loading) {
    return (
      <div className="pending-loading">
        <div className="spinner"></div>
        <p>Loading pending requests...</p>
      </div>
    );
  }

  return (
    <div className="pending-approvals-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/ict')}>← Back to Dashboard</button>
        <h1>⏳ Pending Maintenance Approvals</h1>
        <p>Review and assign maintenance requests from users</p>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{pendingRequests.length}</div>
          <div className="stat-label">Total Pending</div>
        </div>
        <div className="stat-card high">
          <div className="stat-value">{pendingRequests.filter(r => r.priority === 'high').length}</div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat-card medium">
          <div className="stat-value">{pendingRequests.filter(r => r.priority === 'medium').length}</div>
          <div className="stat-label">Medium Priority</div>
        </div>
        <div className="stat-card low">
          <div className="stat-value">{pendingRequests.filter(r => r.priority === 'low').length}</div>
          <div className="stat-label">Low Priority</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by title, description, or requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Priority:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button className="refresh-btn" onClick={loadPendingRequests}>
          🔄 Refresh
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="no-requests">
          <div className="no-requests-icon">✅</div>
          <h3>No Pending Maintenance Requests</h3>
          <p>All maintenance requests have been processed.</p>
        </div>
      ) : (
        <div className="requests-list">
          {filteredRequests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div className="request-title-section">
                  <h3>{request.title}</h3>
                  {getPriorityBadge(request.priority)}
                </div>
                <div className="request-id">#{request.id}</div>
              </div>
              
              <div className="request-body">
                <div className="request-details">
                  <div className="detail-row">
                    <span className="detail-label">Reported By:</span>
                    <span className="detail-value">{request.requester_name || 'Unknown'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Computer:</span>
                    <span className="detail-value">{request.computer_name || request.computer_code || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{request.laboratory_name || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Submitted:</span>
                    <span className="detail-value">{new Date(request.created_at).toLocaleString()}</span>
                  </div>
                </div>
                
                {request.description && (
                  <div className="request-description">
                    <strong>Description:</strong>
                    <p>{request.description}</p>
                  </div>
                )}
              </div>
              
              <div className="request-actions">
                <button className="reject-btn" onClick={() => handleReject(request.id)}>
                  ✗ Reject
                </button>
                <button className="approve-btn" onClick={() => handleApprove(request.id)}>
                  ✓ Assign to Me
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsPage;