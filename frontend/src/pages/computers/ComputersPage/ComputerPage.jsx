import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComputersPage.css';

const ComputersPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLab, setFilterLab] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const computers = [
    { id: 1, code: 'COMP-001', lab: 'Lab 101', workstation: 1, model: 'Dell Optiplex 3090', processor: 'Intel i5', ram: '8GB', storage: '256GB SSD', os: 'Windows 11', status: 'Active', lastMaintenance: '2026-03-15' },
    { id: 2, code: 'COMP-002', lab: 'Lab 101', workstation: 2, model: 'Dell Optiplex 3090', processor: 'Intel i5', ram: '8GB', storage: '256GB SSD', os: 'Windows 11', status: 'In Use', lastMaintenance: '2026-03-10' },
    { id: 3, code: 'COMP-003', lab: 'Lab 101', workstation: 3, model: 'HP EliteDesk', processor: 'Intel i7', ram: '16GB', storage: '512GB SSD', os: 'Ubuntu 22.04', status: 'Maintenance', lastMaintenance: '2026-03-20' },
    { id: 4, code: 'COMP-004', lab: 'Lab 102', workstation: 1, model: 'Lenovo ThinkCentre', processor: 'Intel i5', ram: '8GB', storage: '256GB SSD', os: 'Windows 11', status: 'Active', lastMaintenance: '2026-03-05' },
    { id: 5, code: 'COMP-005', lab: 'Lab 102', workstation: 2, model: 'Dell Optiplex 3090', processor: 'Intel i5', ram: '8GB', storage: '256GB SSD', os: 'Windows 11', status: 'Offline', lastMaintenance: '2026-03-01' },
    { id: 6, code: 'COMP-006', lab: 'Lab 103', workstation: 1, model: 'HP EliteDesk', processor: 'Intel i7', ram: '16GB', storage: '512GB SSD', os: 'Ubuntu 22.04', status: 'Active', lastMaintenance: '2026-03-12' },
    { id: 7, code: 'COMP-007', lab: 'Lab 103', workstation: 2, model: 'Dell Optiplex 3090', processor: 'Intel i5', ram: '8GB', storage: '256GB SSD', os: 'Windows 11', status: 'In Use', lastMaintenance: '2026-03-08' },
    { id: 8, code: 'COMP-008', lab: 'Lab 104', workstation: 1, model: 'Lenovo ThinkCentre', processor: 'Intel i5', ram: '8GB', storage: '256GB SSD', os: 'Windows 11', status: 'Active', lastMaintenance: '2026-03-14' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'In Use': return 'status-inuse';
      case 'Maintenance': return 'status-maintenance';
      case 'Offline': return 'status-offline';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Active': return '🟢';
      case 'In Use': return '🟡';
      case 'Maintenance': return '🟠';
      case 'Offline': return '🔴';
      default: return '⚪';
    }
  };

  const filteredComputers = computers.filter(computer => {
    const matchesSearch = computer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          computer.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLab = filterLab === 'all' || computer.lab === filterLab;
    const matchesStatus = filterStatus === 'all' || computer.status === filterStatus;
    return matchesSearch && matchesLab && matchesStatus;
  });

  const stats = {
    total: computers.length,
    active: computers.filter(c => c.status === 'Active').length,
    inUse: computers.filter(c => c.status === 'In Use').length,
    maintenance: computers.filter(c => c.status === 'Maintenance').length,
    offline: computers.filter(c => c.status === 'Offline').length,
  };

  const labs = [...new Set(computers.map(c => c.lab))];

  return (
    <div className="computers-container">
      <div className="computers-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Computer Inventory</h1>
        <p>Manage and monitor all computers in the laboratory</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-title">Total Computers</div>
        </div>
        <div className="stat-card active">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-title">Active</div>
        </div>
        <div className="stat-card inuse">
          <div className="stat-value">{stats.inUse}</div>
          <div className="stat-title">In Use</div>
        </div>
        <div className="stat-card maintenance">
          <div className="stat-value">{stats.maintenance}</div>
          <div className="stat-title">Maintenance</div>
        </div>
        <div className="stat-card offline">
          <div className="stat-value">{stats.offline}</div>
          <div className="stat-title">Offline</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by computer code or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select value={filterLab} onChange={(e) => setFilterLab(e.target.value)}>
            <option value="all">All Laboratories</option>
            {labs.map(lab => (
              <option key={lab} value={lab}>{lab}</option>
            ))}
          </select>
          
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Active">Active 🟢</option>
            <option value="In Use">In Use 🟡</option>
            <option value="Maintenance">Maintenance 🟠</option>
            <option value="Offline">Offline 🔴</option>
          </select>
        </div>
      </div>

      {/* Computers Table */}
      <div className="computers-table-container">
        <table className="computers-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Computer Code</th>
              <th>Laboratory</th>
              <th>Workstation</th>
              <th>Model</th>
              <th>Processor</th>
              <th>RAM</th>
              <th>Storage</th>
              <th>OS</th>
              <th>Last Maintenance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComputers.map(computer => (
              <tr key={computer.id}>
                <td>
                  <span className={`status-badge ${getStatusColor(computer.status)}`}>
                    {getStatusIcon(computer.status)} {computer.status}
                  </span>
                </td>
                <td><strong>{computer.code}</strong></td>
                <td>{computer.lab}</td>
                <td>{computer.workstation}</td>
                <td>{computer.model}</td>
                <td>{computer.processor}</td>
                <td>{computer.ram}</td>
                <td>{computer.storage}</td>
                <td>{computer.os}</td>
                <td>{computer.lastMaintenance}</td>
                <td>
                  <button className="action-btn view" onClick={() => alert(`View details for ${computer.code}`)}>View</button>
                  <button className="action-btn edit" onClick={() => alert(`Edit ${computer.code}`)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredComputers.length === 0 && (
          <div className="no-results">
            <p>No computers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-btn primary" onClick={() => alert('Add Computer')}>
          + Add New Computer
        </button>
        <button className="action-btn secondary" onClick={() => alert('Export to Excel')}>
          📊 Export to Excel
        </button>
        <button className="action-btn secondary" onClick={() => alert('Generate Report')}>
          📄 Generate Report
        </button>
      </div>
    </div>
  );
};

export default ComputersPage;