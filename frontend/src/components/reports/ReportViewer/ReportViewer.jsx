// frontend/src/components/reports/ReportViewer.jsx
import React, { useState } from 'react';
import './ReportViewer.css';

 const ReportViewer = ({ report, onExport, onClose }) => {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleExport = (format) => {
    onExport(report, format);
  };

  return (
    <div className="report-viewer-overlay">
      <div className="report-viewer">
        <div className="viewer-header">
          <div className="header-left">
            <h2>Report Viewer</h2>
            <span className="report-name">{report.name || 'Generated Report'}</span>
          </div>
          <div className="header-right">
            <div className="zoom-controls">
              <button onClick={handleZoomOut} className="zoom-btn">−</button>
              <span className="zoom-level">{Math.round(scale * 100)}%</span>
              <button onClick={handleZoomIn} className="zoom-btn">+</button>
            </div>
            <div className="export-buttons">
              <button onClick={() => handleExport('pdf')} className="export-pdf">📄 PDF</button>
              <button onClick={() => handleExport('excel')} className="export-excel">📊 Excel</button>
              <button onClick={() => handleExport('csv')} className="export-csv">📋 CSV</button>
            </div>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
        </div>
        
        <div className="viewer-content" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {/* Report Header */}
          <div className="report-header">
            <div className="university-header">
              <div className="uni-logo">🏫</div>
              <div className="uni-info">
                <h1>Injibara University</h1>
                <p>Computer Laboratory Management System</p>
              </div>
            </div>
            <div className="report-title">
              <h2>{report.title || `${report.type?.toUpperCase()} Report`}</h2>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Report Summary */}
          <div className="report-summary">
            <div className="summary-card">
              <div className="summary-label">Total Records</div>
              <div className="summary-value">{report.totalRecords || 0}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Date Range</div>
              <div className="summary-value">
                {report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A'} - 
                {report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Report Type</div>
              <div className="summary-value">{report.type || 'Custom'}</div>
            </div>
          </div>

          {/* Report Data Table */}
          {report.data && report.data.length > 0 && (
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    {Object.keys(report.data[0]).map(key => (
                      <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.data.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Report Charts (Placeholder) */}
          {report.charts && (
            <div className="report-charts">
              <h3>Visual Analytics</h3>
              <div className="charts-grid">
                {/* Chart components would go here */}
                <div className="chart-placeholder">
                  📊 Chart visualization will appear here
                </div>
              </div>
            </div>
          )}

          {/* Report Footer */}
          <div className="report-footer">
            <p>This report is generated automatically by CLMS. For any queries, contact system administrator.</p>
            <p className="footer-note">Confidential - For internal use only</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportViewer