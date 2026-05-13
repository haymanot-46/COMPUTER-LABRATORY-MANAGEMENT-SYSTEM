import React, { useState } from 'react';
import './ReportScheduler.css';

const ReportScheduler = ({ schedule, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: schedule?.name || '',
    description: schedule?.description || '',
    reportType: schedule?.reportType || 'attendance',
    frequency: schedule?.frequency || 'weekly',
    dayOfWeek: schedule?.dayOfWeek || 'monday',
    dayOfMonth: schedule?.dayOfMonth || 1,
    time: schedule?.time || '09:00',
    format: schedule?.format || 'pdf',
    recipients: schedule?.recipients?.join(', ') || '',
    status: schedule?.status || 'active'
  });

  const [errors, setErrors] = useState({});

  const reportTypes = [
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'computers', label: 'Computer Report' },
    { value: 'maintenance', label: 'Maintenance Report' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Schedule name is required';
    if (!formData.recipients) newErrors.recipients = 'At least one recipient email is required';
    if (formData.recipients && !formData.recipients.includes('@')) {
      newErrors.recipients = 'Please enter valid email addresses separated by commas';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const recipientsList = formData.recipients.split(',').map(email => email.trim());
    
    onSave({
      ...formData,
      recipients: recipientsList
    });
  };

  return (
    <div className="scheduler-modal">
      <div className="scheduler-modal-overlay" onClick={onCancel}></div>
      <div className="scheduler-modal-content">
        <div className="scheduler-modal-header">
          <h2>{schedule ? 'Edit Scheduled Report' : 'Schedule New Report'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="scheduler-modal-body">
            <div className="form-group">
              <label>Schedule Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Weekly Attendance Report"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                placeholder="Optional description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Report Type</label>
                <select name="reportType" value={formData.reportType} onChange={handleChange}>
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Frequency</label>
                <select name="frequency" value={formData.frequency} onChange={handleChange}>
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.frequency === 'weekly' && (
              <div className="form-group">
                <label>Day of Week</label>
                <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
                  {weekDays.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.frequency === 'monthly' && (
              <div className="form-group">
                <label>Day of Month</label>
                <input
                  type="number"
                  name="dayOfMonth"
                  value={formData.dayOfMonth}
                  onChange={handleChange}
                  min="1"
                  max="28"
                />
                <small>Day of month (1-28)</small>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Format</label>
                <select name="format" value={formData.format} onChange={handleChange}>
                  {formats.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Recipient Emails *</label>
              <input
                type="text"
                name="recipients"
                value={formData.recipients}
                onChange={handleChange}
                placeholder="email1@example.com, email2@example.com"
              />
              {errors.recipients && <span className="error">{errors.recipients}</span>}
              <small>Separate multiple emails with commas</small>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="scheduler-modal-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {schedule ? 'Update Schedule' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportScheduler;