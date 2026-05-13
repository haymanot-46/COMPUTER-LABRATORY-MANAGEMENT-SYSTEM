import React, { useState, useEffect } from 'react';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { attendanceService, scheduleService } from '../../../services';
import './AttendanceReport.css';

const AttendanceReport = ({ onGenerate, onExport, loading: externalLoading }) => {
  const { user } = useAuth();
  const { isTeacher, isAdmin, isLabManager } = useRole();
  const { addToast } = useNotification();
  
  const [filters, setFilters] = useState({
    reportType: 'overall',
    classId: '',
    courseId: '',
    studentId: '',
    laboratoryId: '',
    dateRange: 'this-month',
    startDate: '',
    endDate: '',
    format: 'csv'
  });

  const [internalLoading, setInternalLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const loading = externalLoading || internalLoading;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load courses
      const coursesRes = await scheduleService.getCourses();
      if (coursesRes?.success) {
        setCourses(coursesRes.data);
      } else {
        // Fallback mock data
        setCourses([
          { id: 1, name: 'Database Systems', code: 'CS311' },
          { id: 2, name: 'Computer Networks', code: 'CS312' },
          { id: 3, name: 'Software Engineering', code: 'CS313' },
          { id: 4, name: 'Web Development', code: 'CS314' },
        ]);
      }

      // Load laboratories
      const labsRes = await attendanceService.getLaboratories?.() || await fetch('/api/laboratories').then(r => r.json());
      if (labsRes?.success) {
        setLaboratories(labsRes.data);
      }

      // Load students (if admin/teacher)
      if (isAdmin() || isTeacher()) {
        const studentsRes = await fetch('/api/users?role=student').then(r => r.json());
        if (studentsRes?.success) {
          setStudents(studentsRes.data);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleDateRangeChange = (e) => {
    const { value } = e.target;
    setFilters({ ...filters, dateRange: value });
    
    // Auto-set dates based on range
    const now = new Date();
    let startDate = '';
    let endDate = '';
    
    switch(value) {
      case 'this-week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'this-semester':
        const semesterStart = now.getMonth() < 6 ? new Date(now.getFullYear(), 0, 1) : new Date(now.getFullYear(), 6, 1);
        startDate = semesterStart.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      default:
        startDate = '';
        endDate = '';
    }
    
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleGenerate = async () => {
    if (filters.reportType === 'class' && !filters.classId) {
      addToast?.('Please select a class', 'warning');
      return;
    }
    
    if (filters.reportType === 'course' && !filters.courseId) {
      addToast?.('Please select a course', 'warning');
      return;
    }
    
    if (filters.reportType === 'student' && !filters.studentId) {
      addToast?.('Please select a student', 'warning');
      return;
    }
    
    setInternalLoading(true);
    
    const params = {
      type: filters.reportType,
      classId: filters.classId,
      courseId: filters.courseId,
      studentId: filters.studentId,
      laboratoryId: filters.laboratoryId,
      startDate: filters.startDate,
      endDate: filters.endDate
    };
    
    try {
      const result = await attendanceService.getAttendanceReport(params);
      if (result?.success) {
        setReportData(result.data);
        setShowPreview(true);
        addToast?.('Report generated successfully', 'success');
        if (onGenerate) onGenerate(result.data);
      } else {
        addToast?.(result?.message || 'Failed to generate report', 'error');
      }
    } catch (error) {
      console.error('Generate error:', error);
      addToast?.('Error generating report', 'error');
    }
    
    setInternalLoading(false);
  };

  const handleExport = async () => {
    const params = {
      type: filters.reportType,
      classId: filters.classId,
      courseId: filters.courseId,
      studentId: filters.studentId,
      laboratoryId: filters.laboratoryId,
      startDate: filters.startDate,
      endDate: filters.endDate,
      format: filters.format
    };
    
    try {
      const result = await attendanceService.exportAttendanceReport(params, filters.format);
      if (result?.success) {
        const extension = filters.format === 'excel' ? 'xlsx' : filters.format;
        const blob = new Blob([result.data], { type: filters.format === 'csv' ? 'text/csv' : 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        addToast?.('Report exported successfully', 'success');
        if (onExport) onExport(params);
      } else {
        addToast?.('Failed to export report', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      addToast?.('Error exporting report', 'error');
    }
  };

  const getDateRangeLabel = () => {
    switch(filters.dateRange) {
      case 'this-week': return 'This Week';
      case 'this-month': return 'This Month';
      case 'this-semester': return 'This Semester';
      case 'custom': return 'Custom Range';
      default: return 'Select Range';
    }
  };

  return (
    <div className="attendance-report-component">
      <div className="report-header">
        <div className="header-icon">📊</div>
        <div className="header-text">
          <h3>Attendance Report</h3>
          <p>Generate and export comprehensive attendance reports</p>
        </div>
      </div>

      <div className="report-filters">
        <div className="filter-section">
          <div className="filter-group full-width">
            <label>Report Type</label>
            <div className="report-type-buttons">
              <button 
                className={`type-btn ${filters.reportType === 'overall' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, reportType: 'overall', classId: '', courseId: '', studentId: ''})}
              >
                📈 Overall
              </button>
              <button 
                className={`type-btn ${filters.reportType === 'class' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, reportType: 'class'})}
              >
                🏫 By Class
              </button>
              <button 
                className={`type-btn ${filters.reportType === 'course' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, reportType: 'course'})}
              >
                📚 By Course
              </button>
              <button 
                className={`type-btn ${filters.reportType === 'student' ? 'active' : ''}`}
                onClick={() => setFilters({...filters, reportType: 'student'})}
              >
                👨‍🎓 By Student
              </button>
            </div>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-row">
            {filters.reportType === 'class' && (
              <div className="filter-group">
                <label>Select Class / Batch</label>
                <select name="classId" value={filters.classId} onChange={handleFilterChange}>
                  <option value="">-- Select Class --</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            )}

            {filters.reportType === 'course' && (
              <div className="filter-group">
                <label>Select Course</label>
                <select name="courseId" value={filters.courseId} onChange={handleFilterChange}>
                  <option value="">-- Select Course --</option>
                  {courses.map(crs => (
                    <option key={crs.id} value={crs.id}>{crs.name} ({crs.code})</option>
                  ))}
                </select>
              </div>
            )}

            {filters.reportType === 'student' && (
              <div className="filter-group">
                <label>Select Student</label>
                <select name="studentId" value={filters.studentId} onChange={handleFilterChange}>
                  <option value="">-- Select Student --</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name} ({student.student_id})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="filter-group">
              <label>Laboratory (Optional)</label>
              <select name="laboratoryId" value={filters.laboratoryId} onChange={handleFilterChange}>
                <option value="">All Laboratories</option>
                {laboratories.map(lab => (
                  <option key={lab.id} value={lab.id}>{lab.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-range-selector">
                <button 
                  className={`range-btn ${filters.dateRange === 'this-week' ? 'active' : ''}`}
                  onClick={() => handleDateRangeChange({ target: { value: 'this-week' } })}
                >
                  This Week
                </button>
                <button 
                  className={`range-btn ${filters.dateRange === 'this-month' ? 'active' : ''}`}
                  onClick={() => handleDateRangeChange({ target: { value: 'this-month' } })}
                >
                  This Month
                </button>
                <button 
                  className={`range-btn ${filters.dateRange === 'this-semester' ? 'active' : ''}`}
                  onClick={() => handleDateRangeChange({ target: { value: 'this-semester' } })}
                >
                  This Semester
                </button>
                <button 
                  className={`range-btn ${filters.dateRange === 'custom' ? 'active' : ''}`}
                  onClick={() => handleDateRangeChange({ target: { value: 'custom' } })}
                >
                  Custom
                </button>
              </div>
            </div>
          </div>

          {filters.dateRange === 'custom' && (
            <div className="filter-row">
              <div className="filter-group">
                <label>Start Date</label>
                <input 
                  type="date" 
                  name="startDate" 
                  value={filters.startDate} 
                  onChange={handleFilterChange}
                  className="date-input"
                />
              </div>
              <div className="filter-group">
                <label>End Date</label>
                <input 
                  type="date" 
                  name="endDate" 
                  value={filters.endDate} 
                  onChange={handleFilterChange}
                  className="date-input"
                />
              </div>
            </div>
          )}

          <div className="filter-row">
            <div className="filter-group">
              <label>Export Format</label>
              <div className="format-buttons">
                <button 
                  className={`format-btn ${filters.format === 'csv' ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, format: 'csv'})}
                >
                  📄 CSV
                </button>
                <button 
                  className={`format-btn ${filters.format === 'pdf' ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, format: 'pdf'})}
                >
                  📑 PDF
                </button>
                <button 
                  className={`format-btn ${filters.format === 'excel' ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, format: 'excel'})}
                >
                  📊 Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="report-actions">
          <button 
            className="generate-btn" 
            onClick={handleGenerate} 
            disabled={loading}
          >
            {loading ? '⏳ Generating...' : '🔍 Generate Report'}
          </button>
          <button 
            className="export-btn" 
            onClick={handleExport}
            disabled={!reportData && !showPreview}
          >
            📥 Export as {filters.format.toUpperCase()}
          </button>
          <button 
            className="clear-btn" 
            onClick={() => {
              setFilters({
                reportType: 'overall',
                classId: '',
                courseId: '',
                studentId: '',
                laboratoryId: '',
                dateRange: 'this-month',
                startDate: '',
                endDate: '',
                format: 'csv'
              });
              setReportData(null);
              setShowPreview(false);
            }}
          >
            🔄 Clear Filters
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {showPreview && reportData && (
        <div className="report-preview">
          <div className="preview-header">
            <h4>📋 Report Preview</h4>
            <button className="close-preview" onClick={() => setShowPreview(false)}>×</button>
          </div>
          <div className="preview-content">
            <div className="preview-stats">
              <div className="stat-item">
                <span className="stat-label">Total Sessions:</span>
                <span className="stat-value">{reportData.summary?.total || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Present:</span>
                <span className="stat-value present">{reportData.summary?.present || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Absent:</span>
                <span className="stat-value absent">{reportData.summary?.absent || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Late:</span>
                <span className="stat-value late">{reportData.summary?.late || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Attendance Rate:</span>
                <span className="stat-value rate">{reportData.summary?.attendanceRate || 0}%</span>
              </div>
            </div>
            {reportData.records && reportData.records.length > 0 && (
              <div className="preview-records">
                <p>{reportData.records.length} records found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;