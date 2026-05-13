// frontend/src/components/attendance/AttendanceSummary.jsx
import React from 'react';
import './AttendanceSummary.css';

const AttendanceSummary = ({ data, title = "Attendance Summary" }) => {
  if (!data || !data.summary) {
    return (
      <div className="attendance-summary-empty">
        <p>No attendance data available</p>
      </div>
    );
  }

  const { summary, courseBreakdown, monthlyTrend } = data;

  return (
    <div className="attendance-summary">
      <h3 className="summary-title">{title}</h3>
      
      {/* Overall Stats */}
      <div className="summary-stats">
        <div className="stat-circle">
          <div className="circle-percent">{summary.overallAttendance || 0}%</div>
          <div className="circle-label">Overall</div>
        </div>
        <div className="stat-details">
          <div className="detail-item">
            <span className="detail-label">Total Sessions:</span>
            <span className="detail-value">{summary.totalSessions || 0}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Present:</span>
            <span className="detail-value present">{summary.present || 0}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Absent:</span>
            <span className="detail-value absent">{summary.absent || 0}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Late:</span>
            <span className="detail-value late">{summary.late || 0}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="attendance-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill present" 
            style={{ width: `${(summary.present / summary.totalSessions) * 100 || 0}%` }}
          >
            <span className="progress-label">Present</span>
          </div>
          <div 
            className="progress-fill late" 
            style={{ width: `${(summary.late / summary.totalSessions) * 100 || 0}%` }}
          >
            <span className="progress-label">Late</span>
          </div>
          <div 
            className="progress-fill absent" 
            style={{ width: `${(summary.absent / summary.totalSessions) * 100 || 0}%` }}
          >
            <span className="progress-label">Absent</span>
          </div>
        </div>
      </div>

      {/* Course Breakdown */}
      {courseBreakdown && courseBreakdown.length > 0 && (
        <div className="course-breakdown">
          <h4>Per Course Attendance</h4>
          {courseBreakdown.map((course, idx) => (
            <div key={idx} className="course-item">
              <div className="course-header">
                <span className="course-name">{course.courseName}</span>
                <span className="course-percent">{course.attendanceRate}%</span>
              </div>
              <div className="course-progress">
                <div 
                  className="course-progress-fill"
                  style={{ width: `${course.attendanceRate}%` }}
                />
              </div>
              <div className="course-stats">
                <span>Present: {course.present}</span>
                <span>Absent: {course.absent}</span>
                <span>Late: {course.late}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Trend */}
      {monthlyTrend && monthlyTrend.length > 0 && (
        <div className="monthly-trend">
          <h4>Monthly Trend</h4>
          <div className="trend-bars">
            {monthlyTrend.map((month, idx) => (
              <div key={idx} className="trend-item">
                <div className="trend-bar-container">
                  <div 
                    className="trend-bar"
                    style={{ height: `${month.attendanceRate}%` }}
                  />
                </div>
                <div className="trend-label">{month.month}</div>
                <div className="trend-value">{month.attendanceRate}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning if attendance is low */}
      {summary.overallAttendance < 75 && (
        <div className="attendance-warning">
          ⚠️ Your attendance is below 75%. Please attend more sessions to meet the requirement.
        </div>
      )}

      {summary.overallAttendance >= 75 && summary.overallAttendance < 85 && (
        <div className="attendance-info">
          ℹ️ Your attendance is satisfactory. Keep it up!
        </div>
      )}

      {summary.overallAttendance >= 85 && (
        <div className="attendance-success">
          🎉 Excellent attendance! You're doing great!
        </div>
      )}
    </div>
  );
};

export default AttendanceSummary;