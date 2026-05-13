// frontend/src/components/schedules/ScheduleForm/ScheduleForm.jsx
import React, { useState } from 'react';
import './ScheduleForm.css';

const ScheduleForm = ({ laboratories, courses, onSubmit, onCancel, initialData, isSubmitting: externalSubmitting }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || initialData?.course_name || '',
    courseId: initialData?.courseId || '',
    labId: initialData?.labId || initialData?.laboratory_id || '',
    date: initialData?.date || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    expected_students: initialData?.expected_students || '',
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const isSubmitting = externalSubmitting || internalSubmitting;

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Session title is required';
    if (!formData.courseId) newErrors.courseId = 'Please select a course';
    if (!formData.labId) newErrors.labId = 'Please select a laboratory';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.startTime) newErrors.startTime = 'Please select start time';
    if (!formData.endTime) newErrors.endTime = 'Please select end time';
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) newErrors.date = 'Date cannot be in the past';
    
    if (formData.startTime && formData.endTime) {
      const startHour = parseInt(formData.startTime.split(':')[0]);
      const endHour = parseInt(formData.endTime.split(':')[0]);
      const duration = endHour - startHour;
      if (duration > 3) newErrors.endTime = 'Session cannot exceed 3 hours';
      if (duration < 1) newErrors.endTime = 'Session must be at least 1 hour';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setInternalSubmitting(true);
      const submitData = {
        title: formData.title,
        course_name: formData.title,
        courseId: parseInt(formData.courseId),
        labId: parseInt(formData.labId),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        expected_students: parseInt(formData.expected_students) || 0,
        notes: formData.notes
      };
      await onSubmit(submitData);
      setInternalSubmitting(false);
    }
  };

  const selectedLab = laboratories?.find(l => l.id === parseInt(formData.labId));
  const selectedCourse = courses?.find(c => c.id === parseInt(formData.courseId));

  return (
    <form className="schedule-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>📝 Session Details</h3>
        <div className="form-group">
          <label>Session Title *</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="e.g., Database Systems Lab Session" 
            className={errors.title ? 'error' : ''} 
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Course *</label>
            <select 
              name="courseId" 
              value={formData.courseId} 
              onChange={handleChange} 
              className={errors.courseId ? 'error' : ''}
            >
              <option value="">-- Select Course --</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
            {errors.courseId && <span className="error-text">{errors.courseId}</span>}
          </div>

          <div className="form-group">
            <label>Laboratory *</label>
            <select 
              name="labId" 
              value={formData.labId} 
              onChange={handleChange} 
              className={errors.labId ? 'error' : ''}
            >
              <option value="">-- Select Laboratory --</option>
              {laboratories?.map(lab => (
                <option key={lab.id} value={lab.id}>
                  {lab.name} ({lab.code}) - Capacity: {lab.capacity} seats
                </option>
              ))}
            </select>
            {errors.labId && <span className="error-text">{errors.labId}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>📅 Date & Time</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange} 
              min={new Date().toISOString().split('T')[0]} 
              className={errors.date ? 'error' : ''} 
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label>Start Time *</label>
            <select 
              name="startTime" 
              value={formData.startTime} 
              onChange={handleChange} 
              className={errors.startTime ? 'error' : ''}
            >
              <option value="">Select Start Time</option>
              {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
            </select>
            {errors.startTime && <span className="error-text">{errors.startTime}</span>}
          </div>

          <div className="form-group">
            <label>End Time *</label>
            <select 
              name="endTime" 
              value={formData.endTime} 
              onChange={handleChange} 
              className={errors.endTime ? 'error' : ''}
            >
              <option value="">Select End Time</option>
              {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
            </select>
            {errors.endTime && <span className="error-text">{errors.endTime}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>👥 Additional Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Expected Students</label>
            <input 
              type="number" 
              name="expected_students" 
              value={formData.expected_students} 
              onChange={handleChange} 
              placeholder="Number of students" 
              min="1" 
              max={selectedLab?.capacity || 50} 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description / Special Requirements</label>
          <textarea 
            name="notes" 
            value={formData.notes} 
            onChange={handleChange} 
            rows="3" 
            placeholder="Any special requirements or notes for this session..." 
          />
        </div>
      </div>

      {selectedLab && (
        <div className="lab-info-card">
          <h4>🔬 Laboratory Information</h4>
          <div className="info-grid">
            <div className="info-item"><span className="info-label">Laboratory:</span><span>{selectedLab.name}</span></div>
            <div className="info-item"><span className="info-label">Capacity:</span><span>{selectedLab.capacity} students</span></div>
            <div className="info-item"><span className="info-label">Location:</span><span>{selectedLab.building || 'Main Building'}</span></div>
          </div>
        </div>
      )}

      {selectedCourse && (
        <div className="course-info-card">
          <h4>📚 Course Information</h4>
          <div className="info-grid">
            <div className="info-item"><span className="info-label">Course:</span><span>{selectedCourse.name}</span></div>
            <div className="info-item"><span className="info-label">Code:</span><span>{selectedCourse.code}</span></div>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : (initialData ? 'Update Booking' : 'Submit Booking')}
        </button>
      </div>
    </form>
  );
};

export default ScheduleForm;