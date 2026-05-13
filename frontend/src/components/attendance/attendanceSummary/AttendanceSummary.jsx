import React from 'react';
import './AttendanceSummary.css';

const AttendanceSummary = ({ data, title }) => {
  const { summary, students, weeklyData } = data;

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'warning';
    return 'poor';
  };

  return (
    <div className="attendance-summary-component">
      <div className="summary-header">
        <h3>{title || 'Attendance Summary'}</h3>
        <div className="summary-period">
          <span>📅 {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card-item">
          <div className="card-icon">👥</div>
          <div className="card-info">
            <div className="card-value">{summary.totalStudents}</div>
            <div className="card-label">Total Students</div>
          </div>
        </div>
        <div className="summary-card-item">
          <div className="card-icon">📅</div>
          <div className="card-info">
            <div className="card-value">{summary.totalSessions}</div>
            <div className="card-label">Total Sessions</div>
          </div>
        </div>
        <div className="summary-card-item">
          <div className="card-icon">📊</div>
          <div className="card-info">
            <div className="card-value">{summary.overallAttendance}%</div>
            <div className="card-label">Overall Attendance</div>
          </div>
        </div>
        <div className="summary-card-item">
          <div className="card-icon">✅</div>
          <div className="card-info">
            <div className="card-value">{summary.present}</div>
            <div className="card-label">Present</div>
          </div>
        </div>
        <div className="summary-card-item">
          <div className="card-icon">❌</div>
          <div className="card-info">
            <div className="card-value">{summary.absent}</div>
            <div className="card-label">Absent</div>
          </div>
        </div>
        <div className="summary-card-item">
          <div className="card-icon">⏰</div>
          <div className="card-info">
            <div className="card-value">{summary.late}</div>
            <div className="card-label">Late</div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      {weeklyData && (
        <div className="weekly-trend">
          <h4>Weekly Attendance Trend</h4>
          <div className="trend-chart">
            {weeklyData.map((week, index) => (
              <div key={index} className="trend-bar-container">
                <div className="trend-label">{week.week}</div>
                <div className="trend-bars">
                  <div 
                    className="trend-bar present" 
                    style={{ width: `${(week.present / summary.totalStudents) * 100}%` }}
                    title={`Present: ${week.present}`}
                  ></div>
                  <div 
                    className="trend-bar absent" 
                    style={{ width: `${(week.absent / summary.totalStudents) * 100}%` }}
                    title={`Absent: ${week.absent}`}
                  ></div>
                  <div 
                    className="trend-bar late" 
                    style={{ width: `${(week.late / summary.totalStudents) * 100}%` }}
                    title={`Late: ${week.late}`}
                  ></div>
                </div>
                <div className="trend-stats">
                  <span className="present-stat">✅ {week.present}</span>
                  <span className="absent-stat">❌ {week.absent}</span>
                  <span className="late-stat">⏰ {week.late}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Details Table */}
      <div className="student-details">
        <h4>Student Attendance Details</h4>
        <div className="student-table-wrapper">
          <table className="student-attendance-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Attendance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.present}</td>
                  <td>{student.absent}</td>
                  <td>{student.late}</td>
                  <td className={`attendance-percent ${getAttendanceColor(student.attendance)}`}>
                    {student.attendance}%
                  </td>
                  <td>
                    <span className={`status-badge ${getAttendanceColor(student.attendance)}`}>
                      {student.attendance >= 90 ? 'Excellent' : 
                       student.attendance >= 75 ? 'Good' : 
                       student.attendance >= 60 ? 'At Risk' : 'Poor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary;