// frontend/src/components/dashboard/activityfeed/ActivityFeed.jsx
import React from 'react';
import './ActivityFeed.css';

const ActivityFeed = ({ activities, title = "Recent Activities" }) => {
  const defaultActivities = [
    { id: 1, user: 'Dr. Abebe', action: 'marked attendance for Database Systems lab', time: '5 minutes ago', avatar: 'DA', type: 'attendance' },
    { id: 2, user: 'Student', action: 'submitted maintenance request for Computer #45', time: '12 minutes ago', avatar: 'ST', type: 'maintenance' },
    { id: 3, user: 'Admin', action: 'added new computer to Lab 101', time: '25 minutes ago', avatar: 'AD', type: 'computer' },
  ];

  const displayActivities = activities && activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="activity-feed">
      <div className="activity-feed-header">
        <h3>{title}</h3>
      </div>
      <div className="activity-feed-list">
        {displayActivities.map((activity, index) => (
          <div key={activity.id || index} className="activity-item">
            <div className="activity-avatar">{activity.avatar || '👤'}</div>
            <div className="activity-content">
              <p><strong>{activity.user}</strong> {activity.action}</p>
              <span className="activity-time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;