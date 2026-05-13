import React, { useState } from 'react';
import AttendanceRow from '../attendanceRow/AttendanceRow'; // FIXED: Import from correct file
import './AttendanceGrid.css';

const AttendanceGrid = ({ students, scheduleId, onSave, onSync }) => {
  const [attendanceData, setAttendanceData] = useState(() => {
    const initial = {};
    students.forEach(student => {
      initial[student.id] = {
        status: 'present',
        note: '',
        timestamp: new Date().toISOString()
      };
    });
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        timestamp: new Date().toISOString()
      }
    }));
    setSaved(false);
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note
      }
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(student => {
      updated[student.id] = {
        status,
        note: attendanceData[student.id]?.note || '',
        timestamp: new Date().toISOString()
      };
    });
    setAttendanceData(updated);
    setSaved(false);
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    const payload = {
      scheduleId,
      date: new Date().toISOString().split('T')[0],
      attendance: students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        status: attendanceData[student.id].status,
        note: attendanceData[student.id].note,
        timestamp: attendanceData[student.id].timestamp
      }))
    };
    
    await onSave(payload);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getStatistics = () => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };
    
    students.forEach(student => {
      const status = attendanceData[student.id]?.status;
      if (status === 'present') stats.present++;
      else if (status === 'absent') stats.absent++;
      else if (status === 'late') stats.late++;
      else if (status === 'excused') stats.excused++;
    });
    
    stats.total = students.length;
    stats.percentage = stats.total > 0 ? ((stats.present + stats.late * 0.5) / stats.total * 100).toFixed(1) : 0;
    
    return stats;
  };

  const stats = getStatistics();

  return (
    <div className="attendance-grid-container">
      {/* Header */}
      <div className="attendance-header">
        <div className="header-title">
          <h2>📝 Mark Attendance</h2>
          <p>Schedule ID: {scheduleId} | Date: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn mark-all-present"
            onClick={() => handleMarkAll('present')}
          >
            ✅ Mark All Present
          </button>
          <button 
            className="action-btn mark-all-absent"
            onClick={() => handleMarkAll('absent')}
          >
            ❌ Mark All Absent
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="attendance-summary">
        <div className="summary-card">
          <div className="summary-value">{stats.total}</div>
          <div className="summary-label">Total Students</div>
        </div>
        <div className="summary-card present">
          <div className="summary-value">{stats.present}</div>
          <div className="summary-label">Present</div>
        </div>
        <div className="summary-card absent">
          <div className="summary-value">{stats.absent}</div>
          <div className="summary-label">Absent</div>
        </div>
        <div className="summary-card late">
          <div className="summary-value">{stats.late}</div>
          <div className="summary-label">Late</div>
        </div>
        <div className="summary-card excused">
          <div className="summary-value">{stats.excused}</div>
          <div className="summary-label">Excused</div>
        </div>
        <div className="summary-card percentage">
          <div className="summary-value">{stats.percentage}%</div>
          <div className="summary-label">Attendance Rate</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <AttendanceRow
                key={student.id}
                index={index + 1}
                student={student}
                attendance={attendanceData[student.id]}
                onStatusChange={handleStatusChange}
                onNoteChange={handleNoteChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="attendance-footer">
        <div className="sync-status">
          {saved && <span className="saved-indicator">✅ Saved locally</span>}
          <button className="sync-btn" onClick={onSync}>
            🔄 Sync with Server
          </button>
        </div>
        <button 
          className="save-btn" 
          onClick={handleSaveAttendance}
          disabled={loading}
        >
          {loading ? 'Saving...' : '💾 Save Attendance'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceGrid;