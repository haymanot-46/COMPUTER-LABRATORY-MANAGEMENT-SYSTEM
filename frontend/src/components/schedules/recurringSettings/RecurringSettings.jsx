import React from 'react';
import './RecurringSettings.css';

const RecurringSettings = ({ recurringType, recurringEndDate, onChange }) => {
  const recurringTypes = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  return (
    <div className="recurring-settings">
      <div className="form-group">
        <label>Repeat Every</label>
        <select value={recurringType} onChange={(e) => onChange({ recurringType: e.target.value })}>
          {recurringTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>End Date</label>
        <input 
          type="date" 
          value={recurringEndDate} 
          onChange={(e) => onChange({ recurringEndDate: e.target.value })} 
        />
      </div>
    </div>
  );
};

export default RecurringSettings;