import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { maintenanceService, computerService, laboratoryService } from '../../../services';
import { MaintenanceRequestForm } from '../../../components/maintenance';
import './CreateRequestPage.css';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();  // ✅ Get isAuthenticated from useAuth
  const { isTeacher, isStudent, isLabAssistant } = useRole();
  const { addToast } = useNotification();
  
  const [computers, setComputers] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Check authentication on mount - Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      addToast('Please login to submit a maintenance request', 'warning');
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadComputers(),
      loadLaboratories()
    ]);
    setLoading(false);
  };

  const loadComputers = async () => {
    try {
      const result = await computerService.getAll();
      if (result.success) {
        setComputers(result.data || []);
      } else {
        console.warn('Failed to load computers:', result.message);
        setComputers([]);
      }
    } catch (error) {
      console.error('Error loading computers:', error);
      setComputers([]);
    }
  };

  const loadLaboratories = async () => {
    try {
      const result = await laboratoryService.getAll();
      if (result.success) {
        setLaboratories(result.data || []);
      } else {
        console.warn('Failed to load laboratories:', result.message);
        setLaboratories([]);
      }
    } catch (error) {
      console.error('Error loading laboratories:', error);
      setLaboratories([]);
    }
  };

  const handleSubmit = async (formData) => {
    // ✅ Check authentication before submitting
    if (!isAuthenticated) {
      addToast('Please login to submit a maintenance request', 'warning');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    
    const requestData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      computer_id: formData.computer_id || null,
      laboratory_id: formData.laboratory_id || null,
      reported_by: user?.id,
      reported_by_name: user?.name,
      contact_email: user?.email
    };
    
    try {
      const result = await maintenanceService.createRequest(requestData);
      
      if (result.success) {
        addToast('Maintenance request submitted successfully', 'success');
        navigate('/maintenance');
      } else {
        addToast(result.message || 'Failed to submit request', 'error');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      addToast('Failed to submit request. Please try again.', 'error');
    }
    
    setSubmitting(false);
  };

  // ✅ Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="create-request-loading">
        <div className="spinner"></div>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="create-request-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="create-request-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Create Maintenance Request</h1>
        <p>Report an issue with computer equipment or laboratory facilities</p>
      </div>

      <MaintenanceRequestForm
        computers={computers}
        laboratories={laboratories}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        isSubmitting={submitting}
      />

      <div className="tips-section">
        <h3>💡 Tips for Effective Requests</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">📝</div>
            <h4>Be Specific</h4>
            <p>Provide detailed description of the issue including error messages</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📸</div>
            <h4>Add Photos</h4>
            <p>Include screenshots or photos of the problem when possible</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">⚡</div>
            <h4>Set Priority</h4>
            <p>Select appropriate priority level based on urgency</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📞</div>
            <h4>Contact Info</h4>
            <p>Provide accurate contact information for follow-up</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestPage;