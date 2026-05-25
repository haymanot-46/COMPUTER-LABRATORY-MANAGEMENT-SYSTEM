import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceService, apiClient } from '../../../services';
import './AttendanceReportPage.css';

const AttendanceReportPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    course: 'all',
    student: 'all',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    
    try {
      // Load courses
      const coursesData = await apiClient.get('/courses');
      if (coursesData.success) {
        setCourses(coursesData.data);
      } else {
        // Mock courses if API fails
        setCourses([
          { id: 1, name: 'Database Systems', code: 'CS311' },
          { id: 2, name: 'Computer Networks', code: 'CS312' },
          { id: 3, name: 'Software Engineering', code: 'CS313' },
          { id: 4, name: 'Web Development', code: 'CS314' }
        ]);
      }
      
      // Load students
      const studentsData = await apiClient.get('/users', { role: 'student' });
      if (studentsData.success) {
        setStudents(studentsData.data);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      // Set mock data
      setCourses([
        { id: 1, name: 'Database Systems', code: 'CS311' },
        { id: 2, name: 'Computer Networks', code: 'CS312' }
      ]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (filters.course && filters.course !== 'all') params.append('course', filters.course);
    if (filters.student && filters.student !== 'all') params.append('student', filters.student);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    try {
      const data = await attendanceService.getReport(params);
      
      if (data.success) {
        setReportData(data.data);
      } else {
        alert('Failed to generate report: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    }
    
    setLoading(false);
  };

  const handleExportCSV = async () => {
    
    const params = new URLSearchParams();
    if (filters.course && filters.course !== 'all') params.append('course', filters.course);
    if (filters.student && filters.student !== 'all') params.append('student', filters.student);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    params.append('format', 'csv');
    
    try {
      const response = await apiClient.get(`/attendance/export?${params}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'present': return <span className="status-badge present">✓ Present</span>;
      case 'absent': return <span className="status-badge absent">✗ Absent</span>;
      case 'late': return <span className="status-badge late">⏰ Late</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="attendance-report-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>📊 Attendance Report</h1>
        <p>Generate and export attendance reports for courses and students</p>
      </div>

      {/* Filters Section */}
      <div className="filters-card">
        <h3>Filter Options</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Course</label>
            <select name="course" value={filters.course} onChange={handleFilterChange}>
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.name}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Student</label>
            <select name="student" value={filters.student} onChange={handleFilterChange}>
              <option value="all">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.student_id || student.email})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
        </div>

        <div className="action-buttons">
          <button className="generate-btn" onClick={handleGenerateReport} disabled={loading}>
            {loading ? '⏳ Generating...' : '🔍 Generate Report'}
          </button>
          <button className="export-btn" onClick={handleExportCSV} disabled={!reportData}>
            📥 Export as CSV
          </button>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="report-results">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">📊</div>
              <div className="card-info">
                <div className="card-value">{reportData.summary?.total || 0}</div>
                <div className="card-label">Total Records</div>
              </div>
            </div>
            <div className="summary-card present">
              <div className="card-icon">✅</div>
              <div className="card-info">
                <div className="card-value">{reportData.summary?.present || 0}</div>
                <div className="card-label">Present</div>
              </div>
            </div>
            <div className="summary-card absent">
              <div className="card-icon">❌</div>
              <div className="card-info">
                <div className="card-value">{reportData.summary?.absent || 0}</div>
                <div className="card-label">Absent</div>
              </div>
            </div>
            <div className="summary-card late">
              <div className="card-icon">⏰</div>
              <div className="card-info">
                <div className="card-value">{reportData.summary?.late || 0}</div>
                <div className="card-label">Late</div>
              </div>
            </div>
            <div className="summary-card rate">
              <div className="card-icon">📈</div>
              <div className="card-info">
                <div className="card-value">{reportData.summary?.attendanceRate || 0}%</div>
                <div className="card-label">Attendance Rate</div>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="records-table-container">
            <h3>Attendance Records</h3>
            <div className="table-wrapper">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Course</th>
                    <th>Laboratory</th>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>Status</th>
                    <th>Check In Time</th>
                    <th>Late Minutes</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.records && reportData.records.length > 0 ? (
                    reportData.records.map((record, index) => (
                      <tr key={index}>
                        <td>{record.student_name}</td>
                        <td>{record.student_number || '-'}</td>
                        <td>{record.course_name}</td>
                        <td>{record.laboratory_name}</td>
                        <td>{new Date(record.start_time).toLocaleDateString()}</td>
                        <td>{new Date(record.start_time).toLocaleTimeString()}</td>
                        <td>{getStatusBadge(record.status)}</td>
                        <td>{record.check_in_time || '-'}</td>
                        <td>{record.late_minutes || 0}</td>
                        <td>{record.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="no-data">No attendance records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!reportData && !loading && (
        <div className="no-data-card">
          <div className="no-data-icon">📊</div>
          <h3>No Report Generated Yet</h3>
          <p>Select filters and click "Generate Report" to view attendance data</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceReportPage;