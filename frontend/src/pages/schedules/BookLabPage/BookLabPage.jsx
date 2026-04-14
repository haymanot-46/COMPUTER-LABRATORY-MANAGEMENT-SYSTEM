import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookLabPage.css';

const BookLabPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  
  const [formData, setFormData] = useState({
    laboratory: '',
    courseName: '',
    date: '',
    startTime: '',
    endTime: '',
    recurring: 'none',
    recurringEndDate: '',
    expectedStudents: '',
    notes: ''
  });

  const laboratories = [
    { id: 1, name: 'Computer Lab 101', capacity: 35, building: 'Science Block', floor: 1 },
    { id: 2, name: 'Computer Lab 102', capacity: 35, building: 'Science Block', floor: 1 },
    { id: 3, name: 'Computer Lab 103', capacity: 30, building: 'Science Block', floor: 2 },
    { id: 4, name: 'Computer Lab 104', capacity: 40, building: 'Engineering Block', floor: 1 },
    { id: 5, name: 'Computer Lab 105', capacity: 25, building: 'Engineering Block', floor: 2 },
  ];

  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM (Lunch Break)',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setConflict(false);
  };

  const handleCheckAvailability = () => {
    // Simulate conflict check
    if (formData.laboratory === 'lab-101' && formData.date === '2026-04-20' && formData.startTime === '10:00 AM - 12:00 PM') {
      setConflict(true);
      setError('This time slot is already booked. Please select another time.');
    } else {
      setConflict(false);
      setError('');
      alert('✓ Time slot is available! You can proceed with booking.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!formData.laboratory || !formData.courseName || !formData.date || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        navigate('/teacher/dashboard');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="booklab-container">
      <div className="booklab-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Book Laboratory Session</h1>
        <p>Schedule a computer lab for your class</p>
      </div>

      {success && (
        <div className="success-message">
          ✅ Booking request submitted successfully! Pending approval.
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="booklab-content">
        <form onSubmit={handleSubmit} className="booking-form">
          {/* Laboratory Selection */}
          <div className="form-section">
            <h3>📋 Laboratory Information</h3>
            
            <div className="form-group">
              <label>Select Laboratory *</label>
              <select name="laboratory" value={formData.laboratory} onChange={handleChange} required>
                <option value="">-- Select a laboratory --</option>
                {laboratories.map(lab => (
                  <option key={lab.id} value={`lab-${lab.id}`}>
                    {lab.name} (Capacity: {lab.capacity}) - {lab.building}, Floor {lab.floor}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Course Name *</label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="e.g., Database Systems, Computer Networks"
                required
              />
            </div>

            <div className="form-group">
              <label>Expected Number of Students *</label>
              <input
                type="number"
                name="expectedStudents"
                value={formData.expectedStudents}
                onChange={handleChange}
                placeholder="e.g., 30"
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          {/* Date and Time */}
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
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time *</label>
                <select name="startTime" value={formData.startTime} onChange={handleChange} required>
                  <option value="">-- Select start time --</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot.split(' - ')[0]}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>End Time *</label>
                <select name="endTime" value={formData.endTime} onChange={handleChange} required>
                  <option value="">-- Select end time --</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot.split(' - ')[1]}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="button" className="check-btn" onClick={handleCheckAvailability}>
              🔍 Check Availability
            </button>

            {conflict && (
              <div className="conflict-warning">
                <strong>⚠️ Scheduling Conflict Detected!</strong>
                <p>This time slot is already booked. Please choose a different time or laboratory.</p>
                <div className="suggested-slots">
                  <p>Available time slots on this day:</p>
                  <ul>
                    <li>8:00 AM - 10:00 AM</li>
                    <li>1:00 PM - 3:00 PM</li>
                    <li>3:00 PM - 5:00 PM</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Recurring Settings */}
          <div className="form-section">
            <h3>🔄 Recurring Schedule (Optional)</h3>
            
            <div className="form-group">
              <label>Repeat</label>
              <select name="recurring" value={formData.recurring} onChange={handleChange}>
                <option value="none">No repeat (One-time session)</option>
                <option value="weekly">Weekly (Same day every week)</option>
                <option value="biweekly">Bi-weekly (Every two weeks)</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {formData.recurring !== 'none' && (
              <div className="form-group">
                <label>Repeat Until</label>
                <input
                  type="date"
                  name="recurringEndDate"
                  value={formData.recurringEndDate}
                  onChange={handleChange}
                  min={formData.date}
                />
                <small>Recurring sessions will end on this date</small>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="form-section">
            <h3>📝 Additional Notes (Optional)</h3>
            
            <div className="form-group">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Special requirements, software needs, or additional instructions..."
              ></textarea>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>

        {/* Information Sidebar */}
        <div className="info-sidebar">
          <div className="info-card">
            <h4>📌 Booking Guidelines</h4>
            <ul>
              <li>Book at least 24 hours in advance</li>
              <li>Maximum 3 hours per session</li>
              <li>Cancellation requires 2 hours notice</li>
              <li>Contact lab manager for urgent requests</li>
            </ul>
          </div>

          <div className="info-card">
            <h4>🖥️ Available Software</h4>
            <ul>
              <li>Windows 11 / Ubuntu 22.04</li>
              <li>VS Code, IntelliJ IDEA</li>
              <li>MySQL, MongoDB</li>
              <li>Docker, Kubernetes</li>
              <li>Python, Java, C++, Node.js</li>
            </ul>
          </div>

          <div className="info-card">
            <h4>📞 Need Help?</h4>
            <p>Contact Lab Manager:</p>
            <p>📧 lab@injibara.edu.et</p>
            <p>📞 +251-58-xxx-xxxx</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLabPage;