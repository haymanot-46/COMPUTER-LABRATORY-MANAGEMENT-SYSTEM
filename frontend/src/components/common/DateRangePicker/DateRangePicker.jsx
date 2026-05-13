import React, { useState } from 'react';
import './DateRangePicker.css';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  const [showPresets, setShowPresets] = useState(false);

  const presets = [
    { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
    { label: 'Yesterday', getValue: () => ({ start: new Date(Date.now() - 86400000), end: new Date(Date.now() - 86400000) }) },
    { label: 'This Week', getValue: () => {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      return { start, end: new Date() };
    }},
    { label: 'This Month', getValue: () => {
      const start = new Date();
      start.setDate(1);
      return { start, end: new Date() };
    }},
    { label: 'Last Month', getValue: () => {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      const end = new Date();
      end.setDate(0);
      return { start, end };
    }},
    { label: 'Last 30 Days', getValue: () => ({ start: new Date(Date.now() - 30 * 86400000), end: new Date() }) },
    { label: 'Last 90 Days', getValue: () => ({ start: new Date(Date.now() - 90 * 86400000), end: new Date() }) },
  ];

  const applyPreset = (preset) => {
    const { start, end } = preset.getValue();
    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
    setShowPresets(false);
  };

  return (
    <div className="date-range-picker">
      <div className="date-inputs">
        <div className="date-input">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>
        <span className="date-separator">to</span>
        <div className="date-input">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
        <button className="presets-btn" onClick={() => setShowPresets(!showPresets)}>
          📅 Quick Select
        </button>
      </div>

      {showPresets && (
        <div className="presets-dropdown">
          {presets.map((preset, index) => (
            <button key={index} className="preset-item" onClick={() => applyPreset(preset)}>
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;