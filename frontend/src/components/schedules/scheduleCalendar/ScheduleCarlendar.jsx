// frontend/src/components/schedules/ScheduleCalendar.jsx
import React, { useState } from 'react';
import './ScheduleCalendar.css';

const ScheduleCalendar = ({ schedules, onDateClick, onEventClick, viewMode, onViewChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#3b82f6';
      case 'completed': return '#8b5cf6';
      default: return '#6b7280';
    }
  };
  
  const getSchedulesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(s => s.date === dateStr);
  };
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const schedulesForDay = getSchedulesForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      
      calendarDays.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${schedulesForDay.length > 0 ? 'has-events' : ''}`}
          onClick={() => onDateClick(date)}
        >
          <div className="day-number">{day}</div>
          {schedulesForDay.length > 0 && (
            <div className="day-events">
              {schedulesForDay.slice(0, 2).map(schedule => (
                <div 
                  key={schedule.id} 
                  className="event-badge"
                  style={{ backgroundColor: getStatusColor(schedule.status) }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(schedule);
                  }}
                >
                  {schedule.title.length > 15 ? schedule.title.substring(0, 12) + '...' : schedule.title}
                </div>
              ))}
              {schedulesForDay.length > 2 && (
                <div className="more-events">+{schedulesForDay.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return calendarDays;
  };
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return (
    <div className="schedule-calendar">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="nav-btn" onClick={prevMonth}>←</button>
          <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button className="nav-btn" onClick={nextMonth}>→</button>
        </div>
        <button className="today-btn" onClick={goToToday}>Today</button>
      </div>
      
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar-days">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default ScheduleCalendar;