// frontend/src/pages/asset/LabAssistantRequests/MaterialRequests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../hooks';
import './MaterialRequests.css';

const MaterialRequests = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/material-requests?status=${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/material-requests/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved_by: 'asset' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToast('Request approved successfully', 'success');
        loadRequests();
      } else {
        addToast(data.message || 'Failed to approve', 'error');
      }
    } catch (error) {
      addToast('Error approving request', 'error');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/material-requests/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToast('Request rejected', 'info');
        loadRequests();
      } else {
        addToast(data.message || 'Failed to reject', 'error');
      }
    } catch (error) {
      addToast('Error rejecting request', 'error');
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return <span className="priority-badge high">High</span>;
      case 'medium': return <span className="priority-badge medium">Medium</span>;
      case 'low': return <span className="priority-badge low">Low</span>;
      default: return null;
    }
  };

  return (
    <div className="material-requests-container">
      <div className="page-header">
        <h1>Material Requests</h1>
        <p>Approve or reject equipment requests from lab assistants</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved
        </button>
        <button 
          className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected
        </button>
        <button 
          className={`tab ${activeTab === 'fulfilled' ? 'active' : ''}`}
          onClick={() => setActiveTab('fulfilled')}
        >
          Fulfilled
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="requests-list">
          {requests.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">inbox</span>
              <p>No {activeTab} requests</p>
            </div>
          ) : (
            requests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-id">#{request.request_code}</div>
                  {getPriorityBadge(request.priority)}
                  <div className="request-date">
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="request-body">
                  <div className="request-info">
                    <div className="info-group">
                      <label>Requester:</label>
                      <span>{request.requester_name}</span>
                    </div>
                    <div className="info-group">
                      <label>Laboratory:</label>
                      <span>{request.laboratory_name}</span>
                    </div>
                    <div className="info-group">
                      <label>Items:</label>
                      <div className="items-list">
                        {request.items?.map((item, idx) => (
                          <div key={idx} className="item">
                            {item.quantity}x {item.equipment_name}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="info-group full-width">
                      <label>Purpose:</label>
                      <p>{request.purpose}</p>
                    </div>
                    {request.notes && (
                      <div className="info-group full-width">
                        <label>Notes:</label>
                        <p>{request.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                {activeTab === 'pending' && (
                  <div className="request-actions">
                    <button 
                      className="approve-btn"
                      onClick={() => handleApprove(request.id)}
                    >
                      Approve
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
                {activeTab === 'approved' && (
                  <div className="request-status approved">
                    <span className="material-icons">check_circle</span>
                    Approved on {new Date(request.approved_at).toLocaleDateString()}
                  </div>
                )}
                {activeTab === 'rejected' && (
                  <div className="request-status rejected">
                    <span className="material-icons">cancel</span>
                    Rejected: {request.rejection_reason}
                  </div>
                )}
                {activeTab === 'fulfilled' && (
                  <div className="request-status fulfilled">
                    <span className="material-icons">done_all</span>
                    Fulfilled on {new Date(request.fulfilled_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialRequests;