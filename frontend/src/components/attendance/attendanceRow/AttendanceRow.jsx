import React, { useState } from 'react';
import './AttendanceRow.css';

const AttendanceRow = ({ index, student, attendance, onStatusChange, onNoteChange }) => {
  const [showNote, setShowNote] = useState(false);

  const statusOptions = [
    { value: 'present', label: '✅ Present', color: '#2e7d32' },
    { value: 'absent', label: '❌ Absent', color: '#c62828' },
    { value: 'late', label: '⏰ Late', color: '#ed8936' },
    { value: 'excused', label: '📝 Excused', color: '#4299e1' }
  ];

  const getStatusClass = (status) => {
    switch(status) {
      case 'present': return 'status-present';
      case 'absent': return 'status-absent';
      case 'late': return 'status-late';
      case 'excused': return 'status-excused';
      default: return '';
    }
  };

  return (
    <tr className="attendance-row">
      <td className="row-index">{index}</td>
      <td className="student-id">{student.studentId}</td>
      <td className="student-name">
        <strong>{student.name}</strong>
      </td>
      <td className="status-cell">
        <div className="status-selector">
          {statusOptions.map(option => (
            <button
              key={option.value}
              className={`status-btn ${getStatusClass(option.value)} ${attendance?.status === option.value ? 'active' : ''}`}
              onClick={() => onStatusChange(student.id, option.value)}
              title={option.label}
            >
              {option.label}
            </button>
          ))}
        </div>
      </td>
      <td className="notes-cell">
        <div className="notes-wrapper">
          {showNote ? (
            <input
              type="text"
              className="notes-input"
              value={attendance?.note || ''}
              onChange={(e) => onNoteChange(student.id, e.target.value)}
              placeholder="Add note..."
              onBlur={() => setShowNote(false)}
              autoFocus
            />
          ) : (
            <button 
              className="add-note-btn"
              onClick={() => setShowNote(true)}
            >
              {attendance?.note ? '✏️ Edit Note' : '📝 Add Note'}
            </button>
          )}
          {attendance?.note && !showNote && (
            <div className="note-preview" title={attendance.note}>
              {attendance.note.length > 20 ? attendance.note.substring(0, 20) + '...' : attendance.note}
            </div>
          )}
        </div>
      </td>
      <td className="time-cell">
        {attendance?.timestamp && new Date(attendance.timestamp).toLocaleTimeString()}
      </td>
    </tr>
  );
};

export default AttendanceRow;