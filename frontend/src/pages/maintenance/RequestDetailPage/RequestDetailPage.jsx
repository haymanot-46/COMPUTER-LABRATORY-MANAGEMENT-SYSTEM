import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { maintenanceService } from '../../../services';
import { MaintenanceDetail } from '../../../components/maintenance';
import './RequestDetailPage.css';

const RequestDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { isLabManager, isICT } = useRole();
  const { addToast } = useNotification();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showResolution, setShowResolution] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    setLoading(true);
    const result = await maintenanceService.getRequestById(id);
    if (result.success) {
      setRequest(result.data);
    } else {
      addToast(result.message || 'Request not found', 'error');
      navigate('/maintenance');
    }
    setLoading(false);
  };

  const handleEdit = () => {
    navigate('/create-request', { state: { request } });
  };

  const handleAssign = () => {
    setShowAssignment(true);
  };

  const handleComplete = () => {
    setShowResolution(true);
  };

  const handleAssignSubmit = async (requestId, technicianId, notes) => {
    const result = await maintenanceService.assignTechnician(requestId, technicianId);
    if (result.success) {
      addToast('Technician assigned successfully', 'success');
      setShowAssignment(false);
      loadRequest();
    } else {
      addToast(result.message || 'Failed to assign technician', 'error');
    }
  };

  const handleCompleteSubmit = async (requestId, resolution, partsUsed) => {
    const result = await maintenanceService.completeRequest(requestId, resolution, partsUsed);
    if (result.success) {
      addToast('Request completed successfully', 'success');
      setShowResolution(false);
      loadRequest();
    } else {
      addToast(result.message || 'Failed to complete request', 'error');
    }
  };

  const technicians = [
    { id: 1, name: 'John Doe', specialization: 'Hardware' },
    { id: 2, name: 'Jane Smith', specialization: 'Software' },
    { id: 3, name: 'Bob Johnson', specialization: 'Network' },
  ];

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Loading request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="detail-not-found">
        <div className="not-found-icon">🔧</div>
        <h2>Request Not Found</h2>
        <p>The maintenance request you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/maintenance')}>Back to Maintenance</button>
      </div>
    );
  }

  return (
    <div className="request-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/maintenance')}>← Back to Requests</button>
        <div className="header-actions">
          {(isLabManager() || isICT()) && request.status === 'pending' && (
            <button className="assign-btn" onClick={handleAssign}>👤 Assign Technician</button>
          )}
          {(isLabManager() || isICT()) && request.status === 'in-progress' && (
            <button className="complete-btn" onClick={handleComplete}>✅ Mark Complete</button>
          )}
        </div>
      </div>

      <MaintenanceDetail
        request={request}
        onClose={() => navigate('/maintenance')}
        onEdit={handleEdit}
        onAssign={handleAssign}
        onComplete={handleComplete}
      />

      {/* Activity Timeline */}
      <div className="activity-timeline">
        <h3>📋 Activity Timeline</h3>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-icon">📝</div>
            <div className="timeline-content">
              <div className="timeline-title">Request Created</div>
              <div className="timeline-date">{new Date(request.createdAt).toLocaleString()}</div>
              <div className="timeline-description">Request submitted by {request.reportedBy}</div>
            </div>
          </div>
          
          {request.assignedDate && (
            <div className="timeline-item">
              <div className="timeline-icon">👤</div>
              <div className="timeline-content">
                <div className="timeline-title">Technician Assigned</div>
                <div className="timeline-date">{new Date(request.assignedDate).toLocaleString()}</div>
                <div className="timeline-description">Assigned to {request.assignedTo}</div>
              </div>
            </div>
          )}
          
          {request.completedDate && (
            <div className="timeline-item">
              <div className="timeline-icon">✅</div>
              <div className="timeline-content">
                <div className="timeline-title">Request Completed</div>
                <div className="timeline-date">{new Date(request.completedDate).toLocaleString()}</div>
                <div className="timeline-description">{request.resolution}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;