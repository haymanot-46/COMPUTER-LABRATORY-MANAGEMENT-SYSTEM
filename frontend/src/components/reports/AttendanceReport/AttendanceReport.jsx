import React from 'react';
import './AttendanceReport.css';

const AttendanceReport = ({ data, onExport }) => {
  if (!data) {
    return (
      <div className="attendance-report-empty">
        <p>No attendance data available. Generate a report first.</p>
      </div>
    );
  }

  const { summary, records = [] } = data;

  return (
    <div className="attendance-report">
      <div className="report-header">
        <h3>📊 Attendance Report</h3>
        <button onClick={() => onExport('pdf')} className="export-btn">
          Export PDF
        </button>
      </div>
      
      {summary && (
        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-value">{summary.total || 0}</div>
            <div className="summary-label">Total Records</div>
          </div>
          <div className="summary-card present">
            <div className="summary-value">{summary.present || 0}</div>
            <div className="summary-label">Present</div>
          </div>
          <div className="summary-card absent">
            <div className="summary-value">{summary.absent || 0}</div>
            <div className="summary-label">Absent</div>
          </div>
          <div className="summary-card late">
            <div className="summary-value">{summary.late || 0}</div>
            <div className="summary-label">Late</div>
          </div>
          <div className="summary-card rate">
            <div className="summary-value">{summary.attendanceRate || 0}%</div>
            <div className="summary-label">Attendance Rate</div>
          </div>
        </div>
      )}
      
      {records.length > 0 && (
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Course</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 10).map((record, index) => (
                <tr key={index}>
                  <td>{record.studentName || record.student?.name || '-'}</td>
                  <td>{record.studentNumber || record.student?.studentId || '-'}</td>
                  <td>{record.course || record.Schedule?.course || '-'}</td>
                  <td>{record.date || record.createdAt?.split('T')[0] || '-'}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length > 10 && (
            <div className="more-records">
              +{records.length - 10} more records
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;