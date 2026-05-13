import React from 'react';
import './HomePage.css';

/**
 * FeaturesSection Component
 * Showcases main features of CLMS
 * 
 * Traceability: UI-FEATURES-001
 */

const features = [
  {
    id: 1,
    icon: '📅',
    title: 'Laboratory Scheduling',
    description: 'Book computer laboratories for academic sessions with automated conflict detection and approval workflows.',
    color: '#667eea',
    traceId: 'FR-TEACHER-SCHEDULE-CREATE-001'
  },
  {
    id: 2,
    icon: '🖥️',
    title: 'Computer Tracking',
    description: 'Maintain an up-to-date inventory of all computers including specifications, status, and maintenance history.',
    color: '#48bb78',
    traceId: 'FR-ADMIN-COMPUTER-CREATE-001'
  },
  {
    id: 3,
    icon: '📋',
    title: 'Attendance Management',
    description: 'Digital attendance marking with offline support and automatic sync when internet is restored.',
    color: '#ed8936',
    traceId: 'FR-TEACHER-ATTENDANCE-MARK-001'
  },
  {
    id: 4,
    icon: '🔧',
    title: 'Maintenance Requests',
    description: 'Streamline the process of reporting, tracking, and resolving computer hardware/software issues.',
    color: '#e53e3e',
    traceId: 'FR-ALL-MAINTENANCE-CREATE-001'
  },
  {
    id: 5,
    icon: '📦',
    title: 'Asset Management',
    description: 'Track all laboratory equipment including monitors, UPS, projectors, and peripherals with audit trails.',
    color: '#8b5cf6',
    traceId: 'FR-ASSET-EQUIPMENT-CREATE-001'
  },
  {
    id: 6,
    icon: '📊',
    title: 'Comprehensive Reports',
    description: 'Generate attendance, utilization, inventory, and maintenance reports in multiple formats.',
    color: '#06b6d4',
    traceId: 'FR-ALL-REPORT-EXPORT-007'
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2 className="section-title">
            Everything You Need to Manage
            <span className="title-highlight"> Computer Labs</span>
          </h2>
          <p className="section-subtitle">
            CLMS provides a complete solution for laboratory management with
            role-based access for all stakeholders.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-trace" data-trace={feature.traceId}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;