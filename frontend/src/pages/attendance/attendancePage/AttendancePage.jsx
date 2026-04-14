import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AttendancePage.css';

const AttendancePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const [attendanceData, setAttendanceData] = useState({});

  // Mock class data - in real app, this comes from API
  const classData = {
    id: 1,
    courseName: 'Database Systems',
    lab: 'Computer Lab 101',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    students: [
      { id: 1, name: 'Abebe Kebede', studentId: 'STU-001', status: 'present', photo: '👨‍🎓' },
      { id: 2, name: 'Almaz Wondimu', studentId: 'STU-002', status: 'present', photo: '👩‍🎓' },
      { id: 3, name: 'Biruk Assefa', studentId: 'STU-003', status: 'absent', photo: '👨‍🎓' },
      { id: 4, name: 'Chaltu Hussein', studentId: 'STU-004', status: 'present', photo: '👩‍🎓' },
      { id: 5, name: 'Desta Mekonnen', studentId: 'STU-005', status: 'late', photo: '👨‍🎓' },
      { id: 6, name: 'Etenesh Girma', studentId: 'STU-006', status: 'present', photo: '👩‍🎓' },
      { id: 7, name: 'Fikadu Tesfaye', studentId: 'STU-007', status: 'present', photo: '👨‍🎓' },
      { id: 8, name: 'Genet Mulugeta', studentId: 'STU-008', status: 'absent', photo: '👩‍🎓' },
      { id: 9, name: 'Henok Desta', studentId: 'STU-009', status: 'present', photo: '👨‍🎓' },
      { id: 10, name: 'Ibsa Aliyi', studentId: 'STU-010', status: 'present', photo: '👨‍🎓' },
    ]
  };

  const [students, setStudents] = useState(classData.students);
  const [isFinalized, setIsFinalized] = useState(false);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleStatusChange = (studentId, newStatus) => {
    if (isFinalized) {
      alert('Attendance has been finalized. Cannot make changes.');
      return;
    }
    
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  const handleMarkAll = (status) => {
    if (isFinalized) {
      alert('Attendance has been finalized. Cannot make changes.');
      return;
    }
    
    setStudents(prevStudents =>
      prevStudents.map(student => ({ ...student, status }))
    );
  };

  const handleFinalize = () => {
    if (isFinalized) {
      alert('Attendance already finalized');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsFinalized(true);
      setSuccess(true);
      
      // Save to localStorage for offline demo
      localStorage.setItem('attendance_data', JSON.stringify(students));
      
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'status-present';
      case 'absent': return 'status-absent';
      case 'late': return 'status-late';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return '✅';
      case 'absent': return '❌';
      case 'late': return '⏰';
      default: return '❓';
    }
  };

  const statistics = {
    total: students.length,
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    late: students.filter(s => s.status === 'late').length,
    percentage: Math.round((students.filter(s => s.status === 'present').length / students.length) * 100)
  };

  return (
    <div className="attendance-container">
      {/* Header */}
      <div className="attendance-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Mark Attendance</h1>
        <p>{classData.courseName} - {classData.lab}</p>
      </div>

      {/* Offline Mode Warning */}
      {offlineMode && (
        <div className="offline-warning">
          <span>📡</span>
          <div>
            <strong>You are offline!</strong>
            <p>Attendance will be saved locally and synced when connection is restored.</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="success-message">
          ✅ Attendance saved successfully! {offlineMode ? 'Will sync when online.' : ''}
        </div>
      )}

      {/* Class Info Bar */}
      <div className="class-info-bar">
        <div className="info-item">
          <span className="info-icon">📅</span>
          <span>{classData.date}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">⏰</span>
          <span>{classData.startTime} - {classData.endTime}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">🔬</span>
          <span>{classData.lab}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">👨‍🎓</span>
          <span>Total Students: {statistics.total}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="attendance-stats">
        <div className="stat-card present">
          <div className="stat-value">{statistics.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card absent">
          <div className="stat-value">{statistics.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card late">
          <div className="stat-value">{statistics.late}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="stat-card percentage">
          <div className="stat-value">{statistics.percentage}%</div>
          <div className="stat-label">Attendance Rate</div>
        </div>
      </div>

      {/* Bulk Actions */}
      {!isFinalized && (
        <div className="bulk-actions">
          <button className="bulk-btn present" onClick={() => handleMarkAll('present')}>
            ✅ Mark All Present
          </button>
          <button className="bulk-btn absent" onClick={() => handleMarkAll('absent')}>
            ❌ Mark All Absent
          </button>
          <button className="bulk-btn clear" onClick={() => handleMarkAll('')}>
            🗑️ Clear All
          </button>
        </div>
      )}

      {/* Students Table */}
      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Photo</th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className={getStatusColor(student.status)}>
                <td>{index + 1}</td>
                <td className="student-photo">{student.photo}</td>
                <td>{student.studentId}</td>
                <td><strong>{student.name}</strong></td>
                <td>
                  {!isFinalized ? (
                    <select
                      value={student.status}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      className={`status-select ${student.status}`}
                    >
                      <option value="present">✅ Present</option>
                      <option value="absent">❌ Absent</option>
                      <option value="late">⏰ Late</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${getStatusColor(student.status)}`}>
                      {getStatusIcon(student.status)} {student.status}
                    </span>
                  )}
                </td>
                <td>
                  {!isFinalized && (
                    <input
                      type="text"
                      placeholder="Add note..."
                      className="note-input"
                      onChange={(e) => console.log(`Note for ${student.name}: ${e.target.value}`)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        {!isFinalized ? (
          <>
            <button className="cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button className="submit-btn" onClick={handleFinalize} disabled={loading}>
              {loading ? 'Saving...' : 'Finalize & Save Attendance'}
            </button>
          </>
        ) : (
          <div className="finalized-message">
            ✅ Attendance has been finalized. No further changes allowed.
            <button className="view-report-btn" onClick={() => navigate('/attendance-report')}>
              View Report
            </button>
          </div>
        )}
      </div>

      {/* Auto-save Indicator */}
      <div className="auto-save-indicator">
        <span>💾 Auto-saving every 30 seconds</span>
        {offlineMode && <span className="offline-badge">Offline Mode</span>}
      </div>
    </div>
  );
};

export default AttendancePage;