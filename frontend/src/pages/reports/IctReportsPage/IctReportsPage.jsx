// frontend/src/pages/ict/ICTReportsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../hooks';
import { maintenanceService } from '../../../services';
import './ICTReportsPage.css';

const ICTReportsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all'
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await maintenanceService.getMaintenanceReport(filters);
      if (result?.success) {
        setReportData(result.data);
        addToast('Report generated successfully', 'success');
      } else {
        addToast('Failed to generate report', 'error');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      addToast('Failed to generate report', 'error');
    }
    setLoading(false);
  };

  const handleExportCSV = async () => {
    try {
      const blob = await maintenanceService.exportMaintenanceReport(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `maintenance_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Report exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting report:', error);
      addToast('Failed to export report', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      submitted: { class: 'status-submitted', text: 'Submitted' },
      pending: { class: 'status-pending', text: 'Pending' },
      'in-progress': { class: 'status-progress', text: 'In Progress' },
      completed: { class: 'status-completed', text: 'Completed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' }
    };
    const badge = badges[status] || badges.submitted;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return <span className="priority-badge high">🔴 High</span>;
      case 'medium': return <span className="priority-badge medium">🟡 Medium</span>;
      case 'low': return <span className="priority-badge low">🟢 Low</span>;
      default: return <span className="priority-badge medium">🟡 Medium</span>;
    }
  };

  return (
    <div className="ict-reports-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/ict/dashboard')}>← Back to Dashboard</button>
        <h1>📊 Maintenance Reports</h1>
        <p>Generate and export maintenance request reports</p>
      </div>

      {/* Filters Section */}
      <div className="filters-card">
        <div className="filters-row">
          <div className="filter-group">
            <label>Start Date</label>
            <input 
              type="date" 
              name="startDate" 
              value={filters.startDate} 
              onChange={handleFilterChange} 
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input 
              type="date" 
              name="endDate" 
              value={filters.endDate} 
              onChange={handleFilterChange} 
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-actions">
            <button className="generate-btn" onClick={handleGenerateReport} disabled={loading}>
              {loading ? '⏳ Generating...' : '🔍 Generate Report'}
            </button>
            <button className="export-btn" onClick={handleExportCSV} disabled={!reportData}>
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="report-results">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-value">{reportData.summary?.total || 0}</div>
              <div className="card-label">Total Requests</div>
            </div>
            <div className="summary-card completed">
              <div className="card-value">{reportData.summary?.completed || 0}</div>
              <div className="card-label">Completed</div>
            </div>
            <div className="summary-card pending">
              <div className="card-value">{reportData.summary?.pending || 0}</div>
              <div className="card-label">Pending</div>
            </div>
            <div className="summary-card progress">
              <div className="card-value">{reportData.summary?.inProgress || 0}</div>
              <div className="card-label">In Progress</div>
            </div>
            <div className="summary-card rate">
              <div className="card-value">{reportData.summary?.completionRate || 0}%</div>
              <div className="card-label">Completion Rate</div>
            </div>
            <div className="summary-card time">
              <div className="card-value">{reportData.summary?.avgResolutionTime || 0}h</div>
              <div className="card-label">Avg Resolution (Hours)</div>
            </div>
          </div>

          {/* Records Table */}
          <div className="records-table">
            <h3>Maintenance Records</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Computer</th>
                    <th>Reported By</th>
                    <th>Created</th>
                    <th>Completed</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.records?.map(record => (
                    <tr key={record.id}>
                      <td>#{record.id}</td>
                      <td>{record.title || '-'}</td>
                      <td>{getPriorityBadge(record.priority)}</td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td>{record.computer_name || record.computer_code || '-'}</td>
                      <td>{record.reported_by || record.requester_name || '-'}</td>
                      <td>{new Date(record.created_at).toLocaleDateString()}</td>
                      <td>{record.completed_at ? new Date(record.completed_at).toLocaleDateString() : '-'}</td>
                      <td>{record.resolution_hours || record.time_spent || 0}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reportData.records?.length === 0 && (
              <div className="no-data">
                <div className="no-data-icon">📊</div>
                <p>No maintenance records found for the selected filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Report Generated Yet */}
      {!reportData && !loading && (
        <div className="no-report">
          <div className="no-report-icon">📋</div>
          <h3>No Report Generated Yet</h3>
          <p>Select filters and click "Generate Report" to view maintenance data.</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      )}
    </div>
  );
};

export default ICTReportsPage;