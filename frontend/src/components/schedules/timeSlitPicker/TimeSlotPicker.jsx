import React, { useState } from 'react';
import './TimeSlotPicker.css';

const TimeSlotPicker = ({ selectedDate, labId, onSelect, onClose }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const timeSlots = [
    { start: '08:00', end: '10:00' },
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
    { start: '18:00', end: '20:00' }
  ];

  const handleSelect = () => {
    if (selectedSlot) onSelect(selectedSlot.start, selectedSlot.end);
  };

  return (
    <div className="timeslot-modal">
      <div className="timeslot-overlay" onClick={onClose}></div>
      <div className="timeslot-content">
        <div className="timeslot-header">
          <h3>Select Time Slot</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="timeslot-body">
          {timeSlots.map(slot => (
            <div 
              key={slot.start} 
              className={`timeslot ${selectedSlot?.start === slot.start ? 'selected' : ''}`} 
              onClick={() => setSelectedSlot(slot)}
            >
              {slot.start} - {slot.end}
            </div>
          ))}
        </div>
        <div className="timeslot-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="select-btn" onClick={handleSelect} disabled={!selectedSlot}>Select</button>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotPicker;