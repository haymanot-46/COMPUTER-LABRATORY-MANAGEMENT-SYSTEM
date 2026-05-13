import React, { useState } from 'react';
import './BulkImport.css';

const BulkImport = ({ onImport, onCancel }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    
    if (!selectedFile) return;
    
    if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split('\n').slice(0, 6);
        setPreview(rows);
      };
      reader.readAsText(selectedFile);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    setLoading(true);
    setError('');
    await onImport(file);
    setLoading(false);
  };

  const downloadTemplate = () => {
    const headers = ['name', 'email', 'role', 'department', 'studentId', 'phone'];
    const csvContent = headers.join(',') + '\n' + 'John Doe,john@example.com,student,Computer Science,CNS/1234/12,0912345678';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bulk-import-modal">
      <div className="import-overlay" onClick={onCancel}></div>
      <div className="import-content">
        <div className="import-header">
          <h2>📎 Bulk Import Users</h2>
          <button onClick={onCancel}>×</button>
        </div>
        <div className="import-body">
          <div className="import-instructions">
            <h3>Instructions</h3>
            <ul>
              <li>File must be in CSV format</li>
              <li>Required columns: name, email, role</li>
              <li>Optional columns: department, studentId, phone</li>
              <li>Valid roles: admin, teacher, student, lab-manager, dean, lab-assistant, ict, asset</li>
            </ul>
            <button className="template-btn" onClick={downloadTemplate}>📥 Download Template</button>
          </div>
          <div className="file-upload-area">
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <p>Drag & drop or click to select CSV file</p>
            {error && <div className="error-message">{error}</div>}
          </div>
          {preview && (
            <div className="preview-area">
              <h4>Preview (first 5 rows)</h4>
              <pre>{preview.join('\n')}</pre>
            </div>
          )}
        </div>
        <div className="import-footer">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="import-btn" onClick={handleSubmit} disabled={!file || loading}>
            {loading ? 'Importing...' : 'Import Users'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImport;