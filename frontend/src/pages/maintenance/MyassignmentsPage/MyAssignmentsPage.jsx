import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { maintenanceService } from '../../../services';
import './MyAssignmentsPage.css';

const MyAssignmentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isICT } = useRole();
  const { addToast } = useNotification();
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAssignments();
  }, [filterStatus]);

  const loadAssignments = async () => {
    setLoading(true);
    const result = await maintenanceService.getMyAssignments();
    if (result.success) {
      let data = result.data;
      if (filterStatus !== 'all') {
        data = data.filter(a => a.status === filterStatus);
      }
      setAssignments(data);
    } else {
      addToast(result.message || 'Failed to load assignments', 'error');
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id, status) => {
    const result = await maintenanceService.updateStatus(id, status);
    if (result.success) {
      addToast(`Request marked as ${status}`, 'success');
      loadAssignments();
    } else {
      addToast(result.message || 'Failed to update status', 'error');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#c62828';
      case 'high': return '#e53e3e';
      case 'medium': return '#ed8936';
      case 'low': return '#48bb78';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <div className="assignments-loading">
        <div className="spinner"></div>
        <p>Loading your assignments...</p>
      </div>
    );
  }

  return (
    <div className="my-assignments-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>My Assignments</h1>
        <p>Tasks assigned to you by lab managers and deans</p>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{assignments.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{assignments.filter(a => a.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{assignments.filter(a => a.status === 'in-progress').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{assignments.filter(a => a.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Assignments List */}
      <div className="assignments-list">
        {assignments.length === 0 ? (
          <div className="no-assignments">
            <div className="no-assignments-icon">✅</div>
            <h3>No Assignments</h3>
            <p>You have no pending assignments at the moment.</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="assignment-card">
              <div className="assignment-header">
                <div className="assignment-title">
                  <span className="priority-badge" style={{ backgroundColor: getPriorityColor(assignment.priority) }}>
                    {assignment.priority}
                  </span>
                  <h3>{assignment.title}</h3>
                </div>
                <div className="assignment-status">
                  <span className={`status-${assignment.status}`}>
                    {assignment.status === 'pending' && '⏳ Pending'}
                    {assignment.status === 'in-progress' && '🔄 In Progress'}
                    {assignment.status === 'completed' && '✅ Completed'}
                  </span>
                </div>
              </div>
              
              <div className="assignment-body">
                <p className="assignment-description">{assignment.description}</p>
                <div className="assignment-details">
                  <div className="detail-item">
                    <span className="detail-icon">🏢</span>
                    <span>{assignment.lab}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🖥️</span>
                    <span>{assignment.computerName || `Computer #${assignment.computerId}`}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">👤</span>
                    <span>Assigned by: {assignment.assignedBy}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span>Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="assignment-actions">
                {assignment.status === 'pending' && (
                  <button 
                    className="action-btn start-btn"
                    onClick={() => handleUpdateStatus(assignment.id, 'in-progress')}
                  >
                    Start Work
                  </button>
                )}
                {assignment.status === 'in-progress' && (
                  <button 
                    className="action-btn complete-btn"
                    onClick={() => handleUpdateStatus(assignment.id, 'completed')}
                  >
                    Mark Complete
                  </button>
                )}
                <button 
                  className="action-btn view-btn"
                  onClick={() => navigate(`/request/${assignment.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyAssignmentsPage;