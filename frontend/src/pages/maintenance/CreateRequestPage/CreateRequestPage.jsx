import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateRequestPage.css';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    laboratory: '',
    computer: '',
    issueType: '',
    priority: 'medium',
    problemDescription: '',
    photo: null
  });

  const laboratories = [
    { id: 1, name: 'Computer Lab 101', computers: ['COMP-001', 'COMP-002', 'COMP-003', 'COMP-004', 'COMP-005', 'COMP-006', 'COMP-007', 'COMP-008'] },
    { id: 2, name: 'Computer Lab 102', computers: ['COMP-009', 'COMP-010', 'COMP-011', 'COMP-012', 'COMP-013', 'COMP-014', 'COMP-015', 'COMP-016'] },
    { id: 3, name: 'Computer Lab 103', computers: ['COMP-017', 'COMP-018', 'COMP-019', 'COMP-020', 'COMP-021', 'COMP-022'] },
  ];

  const issueTypes = [
    { value: 'hardware', label: '🖥️ Hardware Issue', description: 'Computer won\'t boot, screen issues, keyboard/mouse problems' },
    { value: 'software', label: '💿 Software Issue', description: 'Application crashes, OS problems, driver issues' },
    { value: 'network', label: '🌐 Network Issue', description: 'No internet, slow connection, cannot access resources' },
    { value: 'peripheral', label: '🖨️ Peripheral Issue', description: 'Printer, scanner, external device problems' },
    { value: 'other', label: '🔧 Other', description: 'Any other technical issue' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.laboratory || !formData.computer || !formData.issueType || !formData.problemDescription) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/maintenance');
      }, 2000);
    }, 1500);
  };

  const getComputersForLab = () => {
    const lab = laboratories.find(l => l.name === formData.laboratory);
    return lab ? lab.computers : [];
  };

  return (
    <div className="createrequest-container">
      <div className="createrequest-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Report Computer Issue</h1>
        <p>Submit a maintenance request for technical support</p>
      </div>

      {success && (
        <div className="success-message">
          ✅ Maintenance request submitted successfully! ICT team will contact you soon.
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="createrequest-content">
        <form onSubmit={handleSubmit} className="request-form">
          {/* Laboratory Selection */}
          <div className="form-section">
            <h3>📍 Location Information</h3>
            
            <div className="form-group">
              <label>Laboratory *</label>
              <select name="laboratory" value={formData.laboratory} onChange={handleChange} required>
                <option value="">-- Select laboratory --</option>
                {laboratories.map(lab => (
                  <option key={lab.id} value={lab.name}>{lab.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Computer *</label>
              <select name="computer" value={formData.computer} onChange={handleChange} required disabled={!formData.laboratory}>
                <option value="">-- Select computer --</option>
                {getComputersForLab().map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Issue Details */}
          <div className="form-section">
            <h3>🔧 Issue Details</h3>
            
            <div className="form-group">
              <label>Issue Type *</label>
              {issueTypes.map(issue => (
                <label key={issue.value} className="radio-label">
                  <input
                    type="radio"
                    name="issueType"
                    value={issue.value}
                    checked={formData.issueType === issue.value}
                    onChange={handleChange}
                  />
                  <div>
                    <strong>{issue.label}</strong>
                    <small>{issue.description}</small>
                  </div>
                </label>
              ))}
            </div>

            <div className="form-group">
              <label>Priority *</label>
              <div className="priority-options">
                <label className={`priority-option low ${formData.priority === 'low' ? 'selected' : ''}`}>
                  <input type="radio" name="priority" value="low" checked={formData.priority === 'low'} onChange={handleChange} />
                  <span>🟢 Low</span>
                  <small>Non-urgent, can wait</small>
                </label>
                <label className={`priority-option medium ${formData.priority === 'medium' ? 'selected' : ''}`}>
                  <input type="radio" name="priority" value="medium" checked={formData.priority === 'medium'} onChange={handleChange} />
                  <span>🟡 Medium</span>
                  <small>Affects some functionality</small>
                </label>
                <label className={`priority-option high ${formData.priority === 'high' ? 'selected' : ''}`}>
                  <input type="radio" name="priority" value="high" checked={formData.priority === 'high'} onChange={handleChange} />
                  <span>🟠 High</span>
                  <small>Major issue, needs attention</small>
                </label>
                <label className={`priority-option critical ${formData.priority === 'critical' ? 'selected' : ''}`}>
                  <input type="radio" name="priority" value="critical" checked={formData.priority === 'critical'} onChange={handleChange} />
                  <span>🔴 Critical</span>
                  <small>Emergency, urgent attention</small>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Problem Description *</label>
              <textarea
                name="problemDescription"
                value={formData.problemDescription}
                onChange={handleChange}
                placeholder="Describe the issue in detail. What were you doing when the problem occurred? Any error messages?"
                rows="5"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>Photo (Optional)</label>
              <div className="photo-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  id="photo-upload"
                  style={{ display: 'none' }}
                />
                <button type="button" className="upload-btn" onClick={() => document.getElementById('photo-upload').click()}>
                  📸 Upload Photo
                </button>
                <small>Max 5MB. JPG, PNG only.</small>
              </div>
              {photoPreview && (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <button type="button" className="remove-photo" onClick={() => { setPhotoPreview(null); setFormData(prev => ({ ...prev, photo: null })); }}>✖</button>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>

        {/* Information Sidebar */}
        <div className="info-sidebar">
          <div className="info-card">
            <h4>📌 Before You Submit</h4>
            <ul>
              <li>Restart the computer and try again</li>
              <li>Check all cable connections</li>
              <li>Note any error messages shown</li>
              <li>Take a photo if possible</li>
            </ul>
          </div>

          <div className="info-card">
            <h4>⏱️ Response Times</h4>
            <ul>
              <li><strong>Critical:</strong> Within 1 hour</li>
              <li><strong>High:</strong> Within 4 hours</li>
              <li><strong>Medium:</strong> Within 24 hours</li>
              <li><strong>Low:</strong> Within 48 hours</li>
            </ul>
          </div>

          <div className="info-card">
            <h4>📞 Emergency Contact</h4>
            <p>ICT Help Desk: <strong>+251-58-xxx-xxxx</strong></p>
            <p>Email: <strong>ict@injibara.edu.et</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestPage;