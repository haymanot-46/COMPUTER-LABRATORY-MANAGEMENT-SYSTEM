// frontend/src/components/maintenance/MaintenanceList.jsx
import React from 'react';
import './MaintenanceList.css';

 const MaintenanceList = ({ requests, onView, onUpdate, onAssign, onComplete }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#ef4444',
      high: '#f97316',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', icon: '⏳', text: 'Pending' },
      'in-progress': { class: 'status-in-progress', icon: '🔄', text: 'In Progress' },
      completed: { class: 'status-completed', icon: '✅', text: 'Completed' },
      cancelled: { class: 'status-cancelled', icon: '❌', text: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  if (requests.length === 0) {
    return (
      <div className="maintenance-list-empty">
        <div className="empty-icon">🔧</div>
        <h3>No Maintenance Requests</h3>
        <p>No requests match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="maintenance-list">
      <table className="maintenance-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Computer</th>
            <th>Lab</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Reported By</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const statusBadge = getStatusBadge(request.status);
            return (
              <tr key={request.id}>
                <td>#{request.id}</td>
                <td>
                  <div className="request-title">{request.title}</div>
                  <div className="request-type">{request.issueType}</div>
                </td>
                <td>{request.computerName || `PC-${request.computerId}`}</td>
                <td>{request.lab}</td>
                <td>
                  <span 
                    className="priority-badge" 
                    style={{ backgroundColor: getPriorityColor(request.priority) }}
                  >
                    {request.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${statusBadge.class}`}>
                    {statusBadge.icon} {statusBadge.text}
                  </span>
                </td>
                <td>{request.reportedBy}</td>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button className="action-btn view" onClick={() => onView(request)}>View</button>
                  {onUpdate && request.status === 'pending' && (
                    <button className="action-btn edit" onClick={() => onUpdate(request)}>Edit</button>
                  )}
                  {onAssign && request.status === 'pending' && (
                    <button className="action-btn assign" onClick={() => onAssign(request)}>Assign</button>
                  )}
                  {onComplete && request.status === 'in-progress' && (
                    <button className="action-btn complete" onClick={() => onComplete(request)}>Complete</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceList