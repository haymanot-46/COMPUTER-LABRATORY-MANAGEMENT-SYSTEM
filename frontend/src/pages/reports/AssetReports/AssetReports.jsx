// frontend/src/pages/asset/Reports/AssetReports.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../hooks';
import './AssetReports.css';

const AssetReports = () => {
  const { addToast } = useNotification();
  
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [format, setFormat] = useState('csv');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/reports/asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: reportType,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          format
        })
      });
      
      if (format === 'csv') {
        // Handle CSV download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asset_report_${reportType}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        addToast('Report downloaded successfully', 'success');
      } else {
        const data = await response.json();
        if (data.success) {
          setReportData(data.data);
          setSummary(data.summary);
          addToast('Report generated successfully', 'success');
        } else {
          addToast(data.message || 'Failed to generate report', 'error');
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      addToast('Error generating report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    generateReport();
  };

  const reportTypes = [
    { value: 'inventory', label: 'Equipment Inventory Report', icon: 'inventory_2' },
    { value: 'warranty', label: 'Warranty Status Report', icon: 'verified' },
    { value: 'audit', label: 'Audit History Report', icon: 'fact_check' },
    { value: 'borrowing', label: 'Borrowing History Report', icon: 'handshake' },
    { value: 'valuation', label: 'Asset Valuation Report', icon: 'attach_money' },
    { value: 'maintenance', label: 'Maintenance Cost Report', icon: 'build' }
  ];

  return (
    <div className="asset-reports-container">
      <div className="page-header">
        <h1>Asset Reports</h1>
        <p>Generate and export asset management reports</p>
      </div>

      <div className="reports-layout">
        <div className="filters-section">
          <h3>Report Parameters</h3>
          
          <div className="form-group">
            <label>Report Type</label>
            <div className="report-types">
              {reportTypes.map(type => (
                <button
                  key={type.value}
                  className={`report-type-btn ${reportType === type.value ? 'active' : ''}`}
                  onClick={() => setReportType(type.value)}
                >
                  <span className="material-icons">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Export Format</label>
            <div className="format-options">
              <label className="radio-label">
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value)}
                />
                CSV (Excel)
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value)}
                />
                PDF Document
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value)}
                />
                JSON Data
              </label>
            </div>
          </div>

          <button 
            className="generate-btn"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {/* Report Preview */}
        {reportData && (
          <div className="preview-section">
            <h3>Report Preview</h3>
            
            {summary && (
              <div className="summary-cards">
                {Object.entries(summary).map(([key, value]) => (
                  <div key={key} className="summary-card">
                    <div className="summary-value">{value}</div>
                    <div className="summary-label">{key.replace(/_/g, ' ').toUpperCase()}</div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    {reportData.length > 0 && Object.keys(reportData[0]).map(key => (
                      <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.slice(0, 10).map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.length > 10 && (
                <div className="preview-note">
                  Showing first 10 of {reportData.length} records
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetReports;