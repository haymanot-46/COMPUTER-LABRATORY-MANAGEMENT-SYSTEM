import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyAttendancePage.css';

const MyAttendancePage = () => {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState('2025/2026');

  const attendanceRecords = [
    { id: 1, date: '2026-04-10', course: 'Database Systems', status: 'Present', time: '10:05 AM', lab: 'Lab 101' },
    { id: 2, date: '2026-04-09', course: 'Computer Networks', status: 'Present', time: '2:10 PM', lab: 'Lab 102' },
    { id: 3, date: '2026-04-08', course: 'Software Engineering', status: 'Absent', time: '-', lab: 'Lab 103' },
    { id: 4, date: '2026-04-07', course: 'Database Systems', status: 'Late', time: '10:20 AM', lab: 'Lab 101' },
    { id: 5, date: '2026-04-04', course: 'Computer Networks', status: 'Present', time: '2:05 PM', lab: 'Lab 102' },
    { id: 6, date: '2026-04-03', course: 'Software Engineering', status: 'Present', time: '9:10 AM', lab: 'Lab 103' },
    { id: 7, date: '2026-04-02', course: 'Database Systems', status: 'Present', time: '10:00 AM', lab: 'Lab 101' },
    { id: 8, date: '2026-04-01', course: 'Computer Networks', status: 'Absent', time: '-', lab: 'Lab 102' },
  ];

  const summary = {
    totalClasses: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === 'Present').length,
    absent: attendanceRecords.filter(r => r.status === 'Absent').length,
    late: attendanceRecords.filter(r => r.status === 'Late').length,
    percentage: Math.round((attendanceRecords.filter(r => r.status === 'Present').length / attendanceRecords.length) * 100)
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Present': return <span className="badge present">✅ Present</span>;
      case 'Absent': return <span className="badge absent">❌ Absent</span>;
      case 'Late': return <span className="badge late">⏰ Late</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="myattendance-container">
      <div className="myattendance-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>My Attendance Record</h1>
        <p>Track your laboratory session attendance</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total">
          <div className="summary-value">{summary.totalClasses}</div>
          <div className="summary-label">Total Classes</div>
        </div>
        <div className="summary-card present">
          <div className="summary-value">{summary.present}</div>
          <div className="summary-label">Present</div>
        </div>
        <div className="summary-card absent">
          <div className="summary-value">{summary.absent}</div>
          <div className="summary-label">Absent</div>
        </div>
        <div className="summary-card late">
          <div className="summary-value">{summary.late}</div>
          <div className="summary-label">Late</div>
        </div>
        <div className="summary-card percentage">
          <div className="summary-value">{summary.percentage}%</div>
          <div className="summary-label">Attendance Rate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-label">
          <span>Overall Attendance</span>
          <span className="progress-percentage">{summary.percentage}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${summary.percentage}%` }}></div>
        </div>
        <p className="progress-message">
          {summary.percentage >= 75 ? 
            '✅ Good standing! Keep it up!' : 
            '⚠️ Your attendance is below 75%. Please attend more classes.'}
        </p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
          <option value="2025/2026">2025/2026 Academic Year</option>
          <option value="2024/2025">2024/2025 Academic Year</option>
        </select>
        <button className="export-btn" onClick={() => alert('Exporting attendance report...')}>
          📊 Export Report
        </button>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Laboratory</th>
              <th>Status</th>
              <th>Check-in Time</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map(record => (
              <tr key={record.id}>
                <td>{record.date}</td>
                <td><strong>{record.course}</strong></td>
                <td>{record.lab}</td>
                <td>{getStatusBadge(record.status)}</td>
                <td>{record.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Download Certificate */}
      {summary.percentage === 100 && (
        <div className="certificate-section">
          <button className="certificate-btn" onClick={() => alert('Generating perfect attendance certificate...')}>
            🎓 Download Perfect Attendance Certificate
          </button>
        </div>
      )}
    </div>
  );
};

export default MyAttendancePage;