// frontend/src/pages/schedules/BookLabPage/BookLabPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { scheduleService } from '../../../services';
import { ScheduleForm, ConflictWarning } from '../../../components/schedules';
import './BookLabPage.css';

const BookLabPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, isDean, isLabManager } = useRole();
  const { addToast, addNotification } = useNotification();
  
  const [laboratories, setLaboratories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [pendingBooking, setPendingBooking] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [labsResult, coursesResult] = await Promise.all([
        scheduleService.getLaboratories(), 
        scheduleService.getCourses()
      ]);
      if (labsResult.success) setLaboratories(labsResult.data);
      if (coursesResult.success) setCourses(coursesResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      addToast('Failed to load form data', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const availabilityResult = await scheduleService.checkAvailability(
        formData.labId, 
        formData.date, 
        formData.startTime, 
        formData.endTime
      );
      
      if (availabilityResult.success && availabilityResult.available) {
        await submitBooking(formData);
      } else if (availabilityResult.conflicts && availabilityResult.conflicts.length > 0) {
        setConflicts(availabilityResult.conflicts);
        setPendingBooking(formData);
        setShowConflictWarning(true);
      } else {
        addToast('This time slot is already booked. Please select another time.', 'warning');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      addToast('Unable to check availability', 'error');
    } finally { 
      setSubmitting(false); 
    }
  };

  const submitBooking = async (formData) => {
    if (!user) {
      addToast('Please log in to book a lab', 'error');
      return;
    }
    
    // Format data correctly for backend
    const bookingData = {
      course_name: formData.title || formData.course_name,
      laboratory_id: parseInt(formData.labId),
      start_time: `${formData.date} ${formData.startTime}:00`,
      end_time: `${formData.date} ${formData.endTime}:00`,
      expected_students: parseInt(formData.expected_students) || 0,
      notes: formData.notes || ''
    };
    
    console.log('📤 Submitting booking:', bookingData);
    
    try {
      const result = await scheduleService.createSchedule(bookingData);
      
      if (result.success) {
        addToast('Lab booking request submitted successfully!', 'success');
        if (addNotification) {
          addNotification({
            title: 'Booking Submitted',
            message: 'Your lab booking request is pending approval',
            type: 'success'
          });
        }
        navigate('/my-schedules');
      } else if (result.conflict) {
        addToast(result.message, 'warning');
      } else {
        addToast(result.message || 'Failed to book lab', 'error');
      }
    } catch (error) {
      console.error('❌ Error submitting booking:', error);
      addToast('Failed to submit booking. Please try again.', 'error');
    }
  };

  const handleForceBooking = async () => { 
    setShowConflictWarning(false); 
    await submitBooking(pendingBooking); 
  };

  if (loading || authLoading) {
    return (
      <div className="book-lab-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="book-lab-loading">
        <div className="spinner"></div>
        <p>Please log in to book a laboratory session.</p>
      </div>
    );
  }

  return (
    <div className="book-lab-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Book a Laboratory</h1>
        <p>Schedule a lab session for your class</p>
      </div>
      
      <div className="booking-container">
        <div className="booking-form-section">
          <ScheduleForm 
            laboratories={laboratories} 
            courses={courses} 
            onSubmit={handleSubmit} 
            onCancel={() => navigate(-1)} 
            isSubmitting={submitting} 
          />
        </div>
        
        <div className="booking-info-section">
          <div className="info-card">
            <h3>📋 Booking Guidelines</h3>
            <ul>
              <li>Bookings must be made at least 24 hours in advance</li>
              <li>Each lab session is limited to 2-3 hours</li>
              <li>Maximum 35 students per lab session</li>
              <li>Priority given to scheduled courses</li>
              <li>Cancellations must be made 2 hours before session</li>
              <li>You can book multiple sessions for different dates/times</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3>🔬 Available Laboratories</h3>
            {laboratories.map(lab => (
              <div key={lab.id} className="lab-info-item">
                <strong>{lab.name}</strong> ({lab.code})
                <p>📍 {lab.building || 'Main Building'} | 🪑 Capacity: {lab.capacity} students</p>
              </div>
            ))}
          </div>
          
          <div className="info-card">
            <h3>⏰ Available Time Slots</h3>
            <ul>
              <li>Morning: 8:00 AM - 12:00 PM</li>
              <li>Afternoon: 1:00 PM - 5:00 PM</li>
              <li>Evening: 6:00 PM - 8:00 PM</li>
            </ul>
            <p className="note-tip">💡 Tip: Popular time slots fill up quickly. Book in advance!</p>
          </div>
        </div>
      </div>
      
      {showConflictWarning && (
        <ConflictWarning 
          conflicts={conflicts} 
          onConfirm={handleForceBooking} 
          onCancel={() => setShowConflictWarning(false)} 
        />
      )}
    </div>
  );
};

export default BookLabPage;