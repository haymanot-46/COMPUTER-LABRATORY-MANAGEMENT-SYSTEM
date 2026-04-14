import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MySchedulesPage.css';

const MySchedulesPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, pending, all
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const schedules = [
    { 
      id: 1, 
      lab: 'Computer Lab 101', 
      course: 'Database Systems', 
      date: '2026-04-15', 
      time: '10:00 AM - 12:00 PM',
      status: 'approved',
      instructor: 'Dr. Abebe Kebede',
      students: 35,
      bookedBy: 'Dr. Abebe Kebede',
      bookedAt: '2026-04-10'
    },
    { 
      id: 2, 
      lab: 'Computer Lab 102', 
      course: 'Computer Networks', 
      date: '2026-04-16', 
      time: '2:00 PM - 4:00 PM',
      status: 'pending',
      instructor: 'Dr. Almaz Wondimu',
      students: 30,
      bookedBy: 'Dr. Almaz Wondimu',
      bookedAt: '2026-04-11'
    },
    { 
      id: 3, 
      lab: 'Computer Lab 103', 
      course: 'Software Engineering', 
      date: '2026-04-18', 
      time: '9:00 AM - 11:00 AM',
      status: 'approved',
      instructor: 'Dr. Biruk Assefa',
      students: 28,
      bookedBy: 'Dr. Biruk Assefa',
      bookedAt: '2026-04-09'
    },
    { 
      id: 4, 
      lab: 'Computer Lab 101', 
      course: 'Web Development', 
      date: '2026-04-10', 
      time: '1:00 PM - 3:00 PM',
      status: 'completed',
      instructor: 'Dr. Chaltu Hussein',
      students: 32,
      bookedBy: 'Dr. Chaltu Hussein',
      bookedAt: '2026-04-05'
    },
    { 
      id: 5, 
      lab: 'Computer Lab 104', 
      course: 'Data Structures', 
      date: '2026-04-20', 
      time: '11:00 AM - 1:00 PM',
      status: 'pending',
      instructor: 'Dr. Desta Mekonnen',
      students: 25,
      bookedBy: 'Dr. Desta Mekonnen',
      bookedAt: '2026-04-12'
    },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="status-badge approved">✓ Approved</span>;
      case 'pending': return <span className="status-badge pending">⏳ Pending Approval</span>;
      case 'completed': return <span className="status-badge completed">✅ Completed</span>;
      case 'cancelled': return <span className="status-badge cancelled">❌ Cancelled</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filter === 'upcoming') return schedule.status === 'approved' && schedule.date >= '2026-04-15';
    if (filter === 'past') return schedule.status === 'completed' || schedule.date < '2026-04-15';
    if (filter === 'pending') return schedule.status === 'pending';
    return true;
  });

  const handleCancelBooking = (schedule) => {
    setSelectedSchedule(schedule);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    alert(`Booking for ${selectedSchedule.course} cancelled. Reason: ${cancelReason || 'No reason provided'}`);
    setShowCancelModal(false);
    setCancelReason('');
    setSelectedSchedule(null);
  };

  return (
    <div className="myschedules-container">
      <div className="myschedules-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>My Laboratory Schedules</h1>
        <p>View and manage your lab session bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button className={`tab-btn ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>
          📅 Upcoming
        </button>
        <button className={`tab-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          ⏳ Pending Approval
        </button>
        <button className={`tab-btn ${filter === 'past' ? 'active' : ''}`} onClick={() => setFilter('past')}>
          📋 Past Sessions
        </button>
        <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          📚 All Bookings
        </button>
      </div>

      {/* Schedule Cards */}
      <div className="schedules-list">
        {filteredSchedules.map(schedule => (
          <div key={schedule.id} className="schedule-card">
            <div className="schedule-header">
              <div className="schedule-title">
                <h3>{schedule.course}</h3>
                {getStatusBadge(schedule.status)}
              </div>
              <div className="schedule-lab">
                <span className="lab-icon">🔬</span>
                <span>{schedule.lab}</span>
              </div>
            </div>
            
            <div className="schedule-details">
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <span>{schedule.date}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">⏰</span>
                <span>{schedule.time}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">👨‍🏫</span>
                <span>Instructor: {schedule.instructor}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">👨‍🎓</span>
                <span>Students: {schedule.students}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📝</span>
                <span>Booked on: {schedule.bookedAt}</span>
              </div>
            </div>
            
            <div className="schedule-actions">
              <button className="action-btn view-details" onClick={() => alert(`View details for ${schedule.course}`)}>
                View Details
              </button>
              {schedule.status === 'approved' && (
                <button className="action-btn cancel" onClick={() => handleCancelBooking(schedule)}>
                  Cancel Booking
                </button>
              )}
              {schedule.status === 'approved' && (
                <button className="action-btn take-attendance" onClick={() => alert(`Take attendance for ${schedule.course}`)}>
                  Take Attendance
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSchedules.length === 0 && (
        <div className="no-results">
          <p>No schedules found.</p>
          <button className="book-now-btn" onClick={() => navigate('/book-lab')}>
            + Book a Laboratory Now
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Booking</h3>
            <p>Are you sure you want to cancel <strong>{selectedSchedule?.course}</strong> on <strong>{selectedSchedule?.date}</strong>?</p>
            <div className="form-group">
              <label>Reason for cancellation (optional):</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
                rows="3"
              ></textarea>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowCancelModal(false)}>No, Keep It</button>
              <button className="confirm-btn" onClick={confirmCancel}>Yes, Cancel Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySchedulesPage;