import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { reportService, scheduleService, attendanceService } from '../../../services';
import './ReportsPage.css';

const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDean } = useRole();
  const { addToast } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedLab, setSelectedLab] = useState('all');
  const [format, setFormat] = useState('csv');
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [departments, setDepartments] = useState([
    'Computer Science', 'Software Engineering', 'Information Technology', 'Computer Engineering'
  ]);
  const [courses, setCourses] = useState([
    'Database Systems', 'Computer Networks', 'Software Engineering', 'Web Development', 'Data Structures'
  ]);
  const [laboratories, setLaboratories] = useState([]);

  useEffect(() => {
    loadLaboratories();
  }, []);

  const loadLaboratories = async () => {
    try {
      const result = await scheduleService.getLaboratories();
      if (result.success) {
        setLaboratories(result.data);
      }
    } catch (error) {
      console.error('Error loading laboratories:', error);
      setLaboratories([
        { id: 1, name: 'Computer Lab 101', code: 'LAB101' },
        { id: 2, name: 'Computer Lab 102', code: 'LAB102' },
        { id: 3, name: 'Computer Lab 103', code: 'LAB103' }
      ]);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    
    const params = {
      type: reportType,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      course: selectedCourse !== 'all' ? selectedCourse : undefined,
      lab: selectedLab !== 'all' ? selectedLab : undefined,
      format: format
    };
    
    try {
      let result;
      switch (reportType) {
        case 'attendance':
          result = await attendanceService.getReport(params);
          break;
        case 'department':
          result = await reportService.getDepartmentReport(params);
          break;
        case 'lab':
          result = await reportService.getLabUtilizationReport(params);
          break;
        case 'course':
          result = await reportService.getCourseReport(params);
          break;
        default:
          result = await attendanceService.getReport(params);
      }
      
      if (result && result.success) {
        setReportData(result.data);
        setShowPreview(true);
        addToast('Report generated successfully', 'success');
      } else {
        addToast(result?.message || 'Failed to generate report', 'error');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      addToast('Failed to generate report', 'error');
    }
    
    setLoading(false);
  };

  const handleExport = async () => {
    const params = {
      type: reportType,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      course: selectedCourse !== 'all' ? selectedCourse : undefined,
      lab: selectedLab !== 'all' ? selectedLab : undefined,
      format: format
    };
    
    try {
      let result;
      switch (reportType) {
        case 'attendance':
          result = await attendanceService.exportReport(params, format);
          break;
        default:
          result = await reportService.exportReport(params, format);
      }
      
      if (result && result.success) {
        const blob = new Blob([result.data], { type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        addToast(`Report exported as ${format.toUpperCase()}`, 'success');
      } else {
        addToast('Failed to export report', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      addToast('Failed to export report', 'error');
    }
  };

  const getReportPreview = () => {
    if (!reportData) return null;
    
    const { summary, records } = reportData;
    
    return (
      <div className="report-preview">
        <div className="preview-header">
          <h3>Report Preview</h3>
          <button className="close-preview" onClick={() => setShowPreview(false)}>×</button>
        </div>
        <div className="preview-content">
          <div className="preview-summary">
            <h4>Summary Statistics</h4>
            <div className="summary-grid">
              {summary && Object.entries(summary).map(([key, value]) => (
                <div key={key} className="summary-item">
                  <span className="summary-label">{key.replace(/_/g, ' ').toUpperCase()}</span>
                  <span className="summary-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {records && records.length > 0 && (
            <div className="preview-table-container">
              <h4>Sample Records (First 10)</h4>
              <table className="preview-table">
                <thead>
                  <tr>
                    {Object.keys(records[0]).map(key => (
                      <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 10).map((record, idx) => (
                    <tr key={idx}>
                      {Object.values(record).map((value, i) => (
                        <td key={i}>{value || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {records.length > 10 && (
                <p className="more-records">+ {records.length - 10} more records</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const reportOptions = [
    { value: 'attendance', label: 'Attendance Report', icon: '📊', description: 'Student attendance analytics and trends' },
    { value: 'department', label: 'Department Report', icon: '🏛️', description: 'Department performance and resource utilization' },
    { value: 'lab', label: 'Lab Utilization Report', icon: '🔬', description: 'Laboratory usage and efficiency analysis' },
    { value: 'course', label: 'Course Report', icon: '📚', description: 'Course enrollment and performance' }
  ];

  return (
    <div className="reports-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Reports Center</h1>
        <p>Generate and export comprehensive reports for your faculty</p>
      </div>

      <div className="reports-container">
        {/* Report Type Selection */}
        <div className="report-types-section">
          <h3>Select Report Type</h3>
          <div className="report-types-grid">
            {reportOptions.map(option => (
              <div
                key={option.value}
                className={`report-type-card ${reportType === option.value ? 'active' : ''}`}
                onClick={() => setReportType(option.value)}
              >
                <div className="report-type-icon">{option.icon}</div>
                <div className="report-type-info">
                  <h4>{option.label}</h4>
                  <p>{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <h3>Report Filters</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-range">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Department</label>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Course</label>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            {reportType === 'lab' && (
              <div className="filter-group">
                <label>Laboratory</label>
                <select value={selectedLab} onChange={(e) => setSelectedLab(e.target.value)}>
                  <option value="all">All Laboratories</option>
                  {laboratories.map(lab => (
                    <option key={lab.id} value={lab.id}>{lab.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="filter-group">
              <label>Export Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="csv">CSV File</option>
                <option value="excel">Excel File</option>
              </select>
            </div>
          </div>

          <div className="report-actions">
            <button 
              className="generate-btn" 
              onClick={handleGenerateReport} 
              disabled={loading}
            >
              {loading ? 'Generating...' : '📊 Generate Report'}
            </button>
            <button 
              className="export-btn" 
              onClick={handleExport}
              disabled={!reportData}
            >
              📥 Export as {format.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-value">{Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24))}</div>
              <div className="stat-label">Days Range</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <div className="stat-value">{departments.length}</div>
              <div className="stat-label">Departments</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <div className="stat-value">{courses.length}</div>
              <div className="stat-label">Active Courses</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔬</div>
            <div className="stat-info">
              <div className="stat-value">{laboratories.length}</div>
              <div className="stat-label">Laboratories</div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="recent-reports">
          <h3>Recent Reports</h3>
          <div className="reports-list">
            <div className="report-item" onClick={() => {
              setReportType('attendance');
              setDateRange({
                startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              });
              handleGenerateReport();
            }}>
              <div className="report-icon">📊</div>
              <div className="report-info">
                <div className="report-title">Monthly Attendance Summary</div>
                <div className="report-meta">Last 30 days • All Departments</div>
              </div>
              <button className="generate-quick">Generate</button>
            </div>
            <div className="report-item" onClick={() => {
              setReportType('department');
              handleGenerateReport();
            }}>
              <div className="report-icon">🏛️</div>
              <div className="report-info">
                <div className="report-title">Department Performance Report</div>
                <div className="report-meta">Current Semester • All Departments</div>
              </div>
              <button className="generate-quick">Generate</button>
            </div>
            <div className="report-item" onClick={() => {
              setReportType('lab');
              handleGenerateReport();
            }}>
              <div className="report-icon">🔬</div>
              <div className="report-info">
                <div className="report-title">Lab Utilization Report</div>
                <div className="report-meta">Current Month • All Labs</div>
              </div>
              <button className="generate-quick">Generate</button>
            </div>
          </div>
        </div>

        {/* Report Preview Modal */}
        {showPreview && getReportPreview()}
      </div>
    </div>
  );
};

export default ReportsPage;