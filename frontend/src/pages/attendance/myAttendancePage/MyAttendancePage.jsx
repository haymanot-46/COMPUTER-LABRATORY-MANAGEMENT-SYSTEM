import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { attendanceService } from '../../../services';
import './MyAttendancePage.css';

const MyAttendancePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();
  
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  const semesters = ['all', '1st Semester 2025', '2nd Semester 2025', '1st Semester 2026'];
  const courses = ['all', 'Database Systems', 'Computer Networks', 'Software Engineering', 'Web Development'];

  useEffect(() => {
    loadAttendanceData();
  }, [filterSemester, filterCourse]);

  const loadAttendanceData = async () => {
    setLoading(true);
    
    const filters = {
      semester: filterSemester !== 'all' ? filterSemester : undefined,
      course: filterCourse !== 'all' ? filterCourse : undefined
    };
    
    try {
      const result = await attendanceService.getMyAttendance(filters);
      console.log('Attendance result:', result);
      
      if (result && result.success) {
        setAttendanceData(result.data);
      } else {
        addToast?.(result?.message || 'Failed to load attendance', 'error');
      }
    } catch (error) {
      console.error('Load attendance error:', error);
      addToast?.('Error loading attendance data', 'error');
    }
    
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const result = await attendanceService.exportAttendanceReport({
        studentId: user?.studentId,
        semester: filterSemester !== 'all' ? filterSemester : undefined
      }, 'pdf');
      
      if (result?.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'my_attendance_report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        addToast?.('Export successful', 'success');
      } else {
        addToast?.('Export failed', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      addToast?.('Export failed', 'error');
    }
  };

  // Calculate statistics from the data
  const summary = attendanceData?.summary || {
    overallAttendance: 0,
    totalSessions: 0,
    present: 0,
    absent: 0,
    late: 0
  };

  const records = attendanceData?.records || [];

  if (loading) {
    return (
      <div className="my-attendance-loading">
        <div className="spinner"></div>
        <p>Loading your attendance records...</p>
      </div>
    );
  }

  return (
    <div className="my-attendance-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>My Attendance Records</h1>
        <button className="export-btn" onClick={handleExport}>📥 Export Report</button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Semester:</label>
          <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
            {semesters.map(sem => (
              <option key={sem} value={sem}>{sem === 'all' ? 'All Semesters' : sem}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Course:</label>
          <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
            {courses.map(course => (
              <option key={course} value={course}>{course === 'all' ? 'All Courses' : course}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="student-info-card">
        <div className="student-avatar">👨‍🎓</div>
        <div className="student-details">
          <h3>{user?.name || 'Student Name'}</h3>
          <p>Student ID: {user?.studentId || 'Not assigned'}</p>
          <p>Department: {user?.department || 'Computer Science'}</p>
        </div>
        <div className="attendance-badge">
          <div className="badge-value">{summary.overallAttendance || 0}%</div>
          <div className="badge-label">Overall Attendance</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-value">{summary.totalSessions}</div>
          <div className="card-label">Total Sessions</div>
        </div>
        <div className="summary-card present">
          <div className="card-value">{summary.present}</div>
          <div className="card-label">Present</div>
        </div>
        <div className="summary-card absent">
          <div className="card-value">{summary.absent}</div>
          <div className="card-label">Absent</div>
        </div>
        <div className="summary-card late">
          <div className="card-value">{summary.late}</div>
          <div className="card-label">Late</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="attendance-progress-container">
        <div className="progress-label">Attendance Rate</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${summary.overallAttendance}%` }}
          ></div>
        </div>
        <div className="progress-percent">{summary.overallAttendance}%</div>
      </div>

      {/* Records Table */}
      {records.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <h3>No Attendance Records Found</h3>
          <p>No attendance records match your filters.</p>
        </div>
      ) : (
        <div className="records-table-container">
          <h3>Attendance Records</h3>
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                  <th>Check In Time</th>
                  <th>Late Minutes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.date ? new Date(record.date).toLocaleDateString() : '-'}</td>
                    <td>{record.course || '-'}</td>
                    <td>{record.startTime ? new Date(record.startTime).toLocaleTimeString() : '-'}</td>
                    <td>{record.endTime ? new Date(record.endTime).toLocaleTimeString() : '-'}</td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status === 'present' && '✓ Present'}
                        {record.status === 'absent' && '✗ Absent'}
                        {record.status === 'late' && '⏰ Late'}
                      </span>
                    </td>
                    <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
                    <td>{record.lateMinutes || 0} mins</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="attendance-tips">
        <h4>💡 Tips to Improve Attendance</h4>
        <ul>
          <li>Arrive on time for all lab sessions</li>
          <li>Submit absence requests in advance when possible</li>
          <li>Check your schedule regularly for updates</li>
          <li>Contact your instructor if you have attendance concerns</li>
        </ul>
      </div>
    </div>
  );
};

export default MyAttendancePage;