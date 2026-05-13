import React, { useState } from 'react';
import './ChartCard.css';

const ChartCard = ({ title, data, type = 'bar', height = 300, onExport }) => {
  const [chartType, setChartType] = useState(type);
  const [showOptions, setShowOptions] = useState(false);

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <h3>{title}</h3>
        </div>
        <div className="chart-card-body" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#999' }}>No data available</p>
        </div>
      </div>
    );
  }

  const getMaxValue = () => {
    if (chartType === 'pie') return 100;
    return Math.max(...data.map(item => item.value)) * 1.2;
  };

  const renderBarChart = () => {
    const maxValue = getMaxValue();
    return (
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div className="bar-label">{item.label}</div>
            <div className="bar-container">
              <div 
                className="bar-fill" 
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#667eea'
                }}
              >
                <span className="bar-value">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = () => {
    const maxValue = getMaxValue();
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - ((item.value / maxValue) * 100)
    }));

    const linePath = points.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <div className="line-chart">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart-svg">
          <polyline
            points={linePath}
            fill="none"
            stroke="#667eea"
            strokeWidth="2"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill="#667eea"
            />
          ))}
        </svg>
        <div className="line-labels">
          {data.map((item, index) => (
            <div key={index} className="line-label">{item.label}</div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    let cumulativePercent = 0;
    const total = data.reduce((sum, i) => sum + i.value, 0);
    
    return (
      <div className="pie-chart">
        <svg viewBox="0 0 100 100" className="pie-svg">
          {data.map((item, index) => {
            const percent = (item.value / total) * 100;
            const startAngle = cumulativePercent * 3.6;
            cumulativePercent += percent;
            const endAngle = cumulativePercent * 3.6;
            
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 + 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 + 40 * Math.sin(endRad);
            
            const largeArc = percent > 50 ? 1 : 0;
            
            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color || `hsl(${index * 45}, 70%, 60%)`}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="white" />
        </svg>
        <div className="pie-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: item.color || `hsl(${index * 45}, 70%, 60%)` }}></span>
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch(chartType) {
      case 'line': return renderLineChart();
      case 'pie': return renderPieChart();
      default: return renderBarChart();
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>{title}</h3>
        <div className="chart-actions">
          <button 
            className="chart-option-btn"
            onClick={() => setShowOptions(!showOptions)}
          >
            ⋮
          </button>
          {showOptions && (
            <div className="chart-dropdown">
              <button onClick={() => setChartType('bar')}>📊 Bar Chart</button>
              <button onClick={() => setChartType('line')}>📈 Line Chart</button>
              <button onClick={() => setChartType('pie')}>🥧 Pie Chart</button>
              <div className="dropdown-divider"></div>
              <button onClick={onExport}>📥 Export Data</button>
            </div>
          )}
        </div>
      </div>
      <div className="chart-card-body" style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartCard;