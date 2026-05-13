// frontend/src/components/reports/ReportFilters/ReportFilters.jsx
import React, { useState } from 'react';
import { useNotification } from '../../../hooks';
import './ReportFilter.css';

const ReportFilters = ({ onGenerate, onExport, loading: externalLoading }) => {
  const { addToast } = useNotification();
  const [internalLoading, setInternalLoading] = useState(false);
  const [filters, setFilters] = useState({
    reportType: 'attendance',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'csv',
    lab: 'all',
    course: 'all',
    department: 'all'
  });

  const loading = externalLoading || internalLoading;

  const reportTypes = [
    { value: 'attendance', label: '📊 Attendance Report', endpoint: '/api/reports/attendance' },
    { value: 'computers', label: '🖥️ Computer Report', endpoint: '/api/reports/computers' },
    { value: 'maintenance', label: '🔧 Maintenance Report', endpoint: '/api/reports/maintenance' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInternalLoading(true);
    
    const selectedReport = reportTypes.find(r => r.value === filters.reportType);
    
    try {
      const response = await fetch(`http://localhost:5001${selectedReport.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          startDate: filters.startDate,
          endDate: filters.endDate,
          format: filters.format
        })
      });
      
      const contentType = response.headers.get('content-type');
      
      // Check if response is CSV (for export)
      if (contentType && contentType.includes('text/csv')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${selectedReport.value}_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        addToast(`Report exported as CSV successfully`, 'success');
        setInternalLoading(false);
        return;
      }
      
      // Handle JSON response (for preview)
      const data = await response.json();
      
      if (data.success) {
        if (filters.format === 'json') {
          // Download as JSON file
          const jsonStr = JSON.stringify(data.data, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${selectedReport.value}_report_${Date.now()}.json`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          addToast(`Report exported as JSON successfully`, 'success');
        } else {
          // Show preview
          onGenerate(data.data);
        }
      } else {
        addToast(data.message || 'Failed to generate report', 'error');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      addToast('Failed to generate report', 'error');
    } finally {
      setInternalLoading(false);
    }
  };

  const handleExport = () => {
    // Trigger the same as generate with export format
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="report-filters">
      <form onSubmit={handleSubmit}>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Report Type *</label>
            <select name="reportType" value={filters.reportType} onChange={handleChange} required>
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="filter-group">
            <label>Export Format</label>
            <select name="format" value={filters.format} onChange={handleChange}>
              <option value="csv">📋 CSV File</option>
              <option value="json">🔧 JSON Data</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button type="submit" className="generate-btn" disabled={loading}>
            {loading ? '⏳ Generating...' : '📊 Generate Report'}
          </button>
          {filters.format !== 'json' && (
            <button type="button" className="export-btn" onClick={handleExport} disabled={loading}>
              📥 Export as {filters.format.toUpperCase()}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReportFilters;