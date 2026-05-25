// frontend/src/pages/asset/AuditManagement/AuditList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../../hooks';
import { auditService } from '../../../../services';
import './AuditList.css';

const AuditList = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    laboratory_id: '',
    scheduled_date: '',
    auditor_name: ''
  });
  const [laboratories, setLaboratories] = useState([]);

  useEffect(() => {
    loadAudits();
    loadLaboratories();
  }, []);

  const loadAudits = async () => {
    setLoading(true);
    try {
      const data = await auditService.getAudits();
      
      if (data.success) {
        setAudits(data.data);
      }
    } catch (error) {
      console.error('Error loading audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLaboratories = async () => {
    try {
      const data = await auditService.getLaboratories();
      if (data.success) {
        setLaboratories(data.data);
      }
    } catch (error) {
      console.error('Error loading laboratories:', error);
    }
  };

  const handleScheduleAudit = async (e) => {
    e.preventDefault();
    
    try {
      const data = await auditService.createAudit(scheduleData);
      
      if (data.success) {
        addToast('Audit scheduled successfully', 'success');
        setShowScheduleModal(false);
        loadAudits();
        setScheduleData({ laboratory_id: '', scheduled_date: '', auditor_name: '' });
      } else {
        addToast(data.message || 'Failed to schedule audit', 'error');
      }
    } catch (error) {
      addToast('Error scheduling audit', 'error');
    }
  };

  const handleConductAudit = (auditId) => {
    navigate(`/asset/audits/${auditId}/conduct`);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'scheduled': return <span className="badge scheduled">Scheduled</span>;
      case 'in-progress': return <span className="badge in-progress">In Progress</span>;
      case 'completed': return <span className="badge completed">Completed</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="audit-list-container">
      <div className="page-header">
        <h1>Equipment Audit</h1>
        <p>Schedule and conduct equipment audits</p>
        <button 
          className="schedule-audit-btn"
          onClick={() => setShowScheduleModal(true)}
        >
          + Schedule Audit
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="audit-cards">
          {audits.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">fact_check</span>
              <p>No audits found</p>
              <button onClick={() => setShowScheduleModal(true)}>
                Schedule First Audit
              </button>
            </div>
          ) : (
            audits.map(audit => (
              <div key={audit.id} className="audit-card">
                <div className="audit-header">
                  <h3>{audit.laboratory_name}</h3>
                  {getStatusBadge(audit.status)}
                </div>
                <div className="audit-body">
                  <div className="audit-info">
                    <div className="info-row">
                      <span className="label">Scheduled Date:</span>
                      <span>{new Date(audit.scheduled_date).toLocaleDateString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Auditor:</span>
                      <span>{audit.auditor_name}</span>
                    </div>
                    {audit.completed_date && (
                      <div className="info-row">
                        <span className="label">Completed:</span>
                        <span>{new Date(audit.completed_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {audit.compliance_rate && (
                      <div className="compliance-rate">
                        <div className="rate-label">Compliance Rate</div>
                        <div className="rate-bar">
                          <div 
                            className="rate-fill" 
                            style={{ width: `${audit.compliance_rate}%` }}
                          ></div>
                        </div>
                        <div className="rate-value">{audit.compliance_rate}%</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="audit-footer">
                  {audit.status === 'scheduled' && (
                    <button 
                      className="conduct-btn"
                      onClick={() => handleConductAudit(audit.id)}
                    >
                      Conduct Audit
                    </button>
                  )}
                  {audit.status === 'completed' && (
                    <button 
                      className="view-btn"
                      onClick={() => navigate(`/asset/audits/${audit.id}/details`)}
                    >
                      View Report
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Schedule Audit Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule Audit</h3>
              <button className="modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            <form onSubmit={handleScheduleAudit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Laboratory *</label>
                  <select 
                    value={scheduleData.laboratory_id} 
                    onChange={(e) => setScheduleData({...scheduleData, laboratory_id: e.target.value})}
                    required
                  >
                    <option value="">Select Laboratory</option>
                    {laboratories.map(lab => (
                      <option key={lab.id} value={lab.id}>{lab.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Audit Date *</label>
                  <input
                    type="date"
                    value={scheduleData.scheduled_date}
                    onChange={(e) => setScheduleData({...scheduleData, scheduled_date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Auditor Name *</label>
                  <input
                    type="text"
                    value={scheduleData.auditor_name}
                    onChange={(e) => setScheduleData({...scheduleData, auditor_name: e.target.value})}
                    placeholder="Full name of auditor"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditList;