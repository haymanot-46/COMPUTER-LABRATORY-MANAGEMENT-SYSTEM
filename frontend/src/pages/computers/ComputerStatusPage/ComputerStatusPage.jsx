import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '../../../hooks';
import { computerService } from '../../../services';
import { ComputerStatus } from '../../../components/computers';
import './ComputerStatusPage.css';

const ComputerStatusPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();
  
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState('all');

  const laboratories = ['all', 'Lab 101', 'Lab 102', 'Lab 103', 'Lab 104', 'Lab 105'];

  useEffect(() => {
    loadComputers();
  }, [selectedLab]);

  const loadComputers = async () => {
    setLoading(true);
    const filters = selectedLab !== 'all' ? { lab: selectedLab } : {};
    const result = await computerService.getComputers(filters);
    if (result.success) {
      setComputers(result.data);
    } else {
      addToast(result.message || 'Failed to load computer status', 'error');
    }
    setLoading(false);
  };

  const getStatusSummary = () => {
    const total = computers.length;
    const available = computers.filter(c => c.status === 'available').length;
    const inUse = computers.filter(c => c.status === 'in-use').length;
    const maintenance = computers.filter(c => c.status === 'maintenance').length;
    const damaged = computers.filter(c => c.status === 'damaged').length;
    
    return { total, available, inUse, maintenance, damaged };
  };

  const statusSummary = getStatusSummary();

  return (
    <div className="computer-status-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Computer Status Dashboard</h1>
        <p>Real-time monitoring of computer lab equipment</p>
      </div>

      {/* Lab Filter */}
      <div className="lab-filter">
        <label>Filter by Laboratory:</label>
        <select value={selectedLab} onChange={(e) => setSelectedLab(e.target.value)}>
          {laboratories.map(lab => (
            <option key={lab} value={lab}>{lab === 'all' ? 'All Laboratories' : lab}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total">
          <div className="summary-value">{statusSummary.total}</div>
          <div className="summary-label">Total Computers</div>
        </div>
        <div className="summary-card available">
          <div className="summary-value">{statusSummary.available}</div>
          <div className="summary-label">Available</div>
        </div>
        <div className="summary-card in-use">
          <div className="summary-value">{statusSummary.inUse}</div>
          <div className="summary-label">In Use</div>
        </div>
        <div className="summary-card maintenance">
          <div className="summary-value">{statusSummary.maintenance}</div>
          <div className="summary-label">Maintenance</div>
        </div>
        <div className="summary-card damaged">
          <div className="summary-value">{statusSummary.damaged}</div>
          <div className="summary-label">Damaged</div>
        </div>
      </div>

      {/* Status Chart */}
      <div className="status-chart">
        <h3>Status Distribution</h3>
        <div className="chart-bars">
          <div className="chart-item">
            <span className="chart-label">Available</span>
            <div className="chart-bar-container">
              <div 
                className="chart-bar available" 
                style={{ width: `${(statusSummary.available / statusSummary.total) * 100}%` }}
              ></div>
            </div>
            <span className="chart-percent">{Math.round((statusSummary.available / statusSummary.total) * 100)}%</span>
          </div>
          <div className="chart-item">
            <span className="chart-label">In Use</span>
            <div className="chart-bar-container">
              <div 
                className="chart-bar in-use" 
                style={{ width: `${(statusSummary.inUse / statusSummary.total) * 100}%` }}
              ></div>
            </div>
            <span className="chart-percent">{Math.round((statusSummary.inUse / statusSummary.total) * 100)}%</span>
          </div>
          <div className="chart-item">
            <span className="chart-label">Maintenance</span>
            <div className="chart-bar-container">
              <div 
                className="chart-bar maintenance" 
                style={{ width: `${(statusSummary.maintenance / statusSummary.total) * 100}%` }}
              ></div>
            </div>
            <span className="chart-percent">{Math.round((statusSummary.maintenance / statusSummary.total) * 100)}%</span>
          </div>
          <div className="chart-item">
            <span className="chart-label">Damaged</span>
            <div className="chart-bar-container">
              <div 
                className="chart-bar damaged" 
                style={{ width: `${(statusSummary.damaged / statusSummary.total) * 100}%` }}
              ></div>
            </div>
            <span className="chart-percent">{Math.round((statusSummary.damaged / statusSummary.total) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Computer Status Component */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading computer status...</p>
        </div>
      ) : (
        <ComputerStatus computers={computers} />
      )}

      {/* Refresh Button */}
      <div className="refresh-section">
        <button className="refresh-btn" onClick={loadComputers}>
          🔄 Refresh Status
        </button>
        <span className="last-updated">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default ComputerStatusPage;