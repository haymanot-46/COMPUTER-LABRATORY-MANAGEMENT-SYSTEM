// frontend/src/components/attendance/AttendanceGrid.jsx
import React, { useState } from 'react';
import './AttendanceGrid.css';

const AttendanceGrid = ({ students, scheduleId, onSave, onSync, saving }) => {
  const [attendanceRecords, setAttendanceRecords] = useState(
    students.map(student => ({
      studentId: student.id,
      studentName: student.name,
      studentNumber: student.studentId,
      status: 'present',
      notes: '',
      markedAt: new Date().toISOString()
    }))
  );

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const updateAttendance = (studentId, field, value) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.studentId === studentId
          ? { ...record, [field]: value }
          : record
      )
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return '#4caf50';
      case 'absent': return '#f44336';
      case 'late': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return '✓';
      case 'absent': return '✗';
      case 'late': return '⏰';
      default: return '?';
    }
  };

  const filteredStudents = attendanceRecords.filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statistics = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length
  };

  const handleSave = () => {
    onSave({ attendance: attendanceRecords });
  };

  const handleMarkAll = (status) => {
    setAttendanceRecords(prev =>
      prev.map(record => ({ ...record, status }))
    );
  };

  const handleBulkNotes = (notes) => {
    setAttendanceRecords(prev =>
      prev.map(record => ({ ...record, notes }))
    );
  };

  return (
    <div className="attendance-grid-container">
      {/* Toolbar */}
      <div className="attendance-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({statistics.total})
          </button>
          <button 
            className={`filter-btn present ${filterStatus === 'present' ? 'active' : ''}`}
            onClick={() => setFilterStatus('present')}
          >
            Present ({statistics.present})
          </button>
          <button 
            className={`filter-btn absent ${filterStatus === 'absent' ? 'active' : ''}`}
            onClick={() => setFilterStatus('absent')}
          >
            Absent ({statistics.absent})
          </button>
          <button 
            className={`filter-btn late ${filterStatus === 'late' ? 'active' : ''}`}
            onClick={() => setFilterStatus('late')}
          >
            Late ({statistics.late})
          </button>
        </div>

        <div className="bulk-actions">
          <button onClick={() => handleMarkAll('present')} className="bulk-present">✓ All Present</button>
          <button onClick={() => handleMarkAll('absent')} className="bulk-absent">✗ All Absent</button>
          <button onClick={() => handleMarkAll('late')} className="bulk-late">⏰ All Late</button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="attendance-stats">
        <div className="stat-card">
          <div className="stat-value">{statistics.total}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card present">
          <div className="stat-value">{statistics.present}</div>
          <div className="stat-label">Present</div>
          <div className="stat-percent">{((statistics.present/statistics.total)*100).toFixed(1)}%</div>
        </div>
        <div className="stat-card absent">
          <div className="stat-value">{statistics.absent}</div>
          <div className="stat-label">Absent</div>
          <div className="stat-percent">{((statistics.absent/statistics.total)*100).toFixed(1)}%</div>
        </div>
        <div className="stat-card late">
          <div className="stat-value">{statistics.late}</div>
          <div className="stat-label">Late</div>
          <div className="stat-percent">{((statistics.late/statistics.total)*100).toFixed(1)}%</div>
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
            {filteredStudents.map((record, index) => (
              <tr key={record.studentId} className={`status-${record.status}`}>
                <td>{index + 1}</td>
                <td>{record.studentNumber}</td>
                <td className="student-name-cell">
                  <div className="student-info">
                    <span className="student-avatar-small">👨‍🎓</span>
                    {record.studentName}
                  </div>
                </td>
                <td>
                  <div className="status-buttons">
                    <button
                      className={`status-btn present ${record.status === 'present' ? 'active' : ''}`}
                      onClick={() => updateAttendance(record.studentId, 'status', 'present')}
                      title="Present"
                    >
                      ✓
                    </button>
                    <button
                      className={`status-btn absent ${record.status === 'absent' ? 'active' : ''}`}
                      onClick={() => updateAttendance(record.studentId, 'status', 'absent')}
                      title="Absent"
                    >
                      ✗
                    </button>
                    <button
                      className={`status-btn late ${record.status === 'late' ? 'active' : ''}`}
                      onClick={() => updateAttendance(record.studentId, 'status', 'late')}
                      title="Late"
                    >
                      ⏰
                    </button>
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Add note..."
                    value={record.notes}
                    onChange={(e) => updateAttendance(record.studentId, 'notes', e.target.value)}
                    className="notes-input"
                  />
                </td>
                <td className="time-cell">
                  {new Date(record.markedAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="attendance-actions">
        <button 
          className="save-attendance-btn" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save Attendance'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceGrid;