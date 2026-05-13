import React, { useState } from 'react';
import './ExportButtons.css';

const ExportButtons = ({ onExport, reportData, disabled }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const formats = [
    { value: 'pdf', label: 'PDF Document', icon: '📄', color: '#e53e3e' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: '📊', color: '#48bb78' },
    { value: 'csv', label: 'CSV File', icon: '📎', color: '#4299e1' },
    { value: 'json', label: 'JSON Data', icon: '🔧', color: '#ed8936' }
  ];

  const handleExport = () => {
    onExport(reportData, selectedFormat);
    setShowOptions(false);
  };

  return (
    <div className="export-buttons">
      <button 
        className="export-main-btn"
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled}
      >
        📥 Export Report
      </button>

      {showOptions && (
        <div className="export-dropdown">
          <div className="dropdown-header">
            <h4>Export Format</h4>
            <button className="close-dropdown" onClick={() => setShowOptions(false)}>×</button>
          </div>
          <div className="dropdown-body">
            {formats.map(format => (
              <label key={format.value} className="format-option">
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={selectedFormat === format.value}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                />
                <span className="format-icon">{format.icon}</span>
                <span className="format-label">{format.label}</span>
              </label>
            ))}
          </div>
          <div className="dropdown-footer">
            <button className="cancel-btn" onClick={() => setShowOptions(false)}>
              Cancel
            </button>
            <button className="export-btn" onClick={handleExport}>
              Export as {selectedFormat.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButtons;