import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRole, useNotification } from '../../../hooks';
import { reportService } from '../../../services';
import { ScheduledReports, ReportScheduler } from '../../../components/reports';
import './ScheduledReportPage.css';

const ScheduledReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const { addToast } = useNotification();
  
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      // Try to get from API first
      const result = await reportService.getScheduledReports();
      if (result && result.success && result.data && result.data.length > 0) {
        setSchedules(result.data);
      } else {
        // Fallback to sample data if API fails
        const sampleSchedules = [
          {
            id: 1,
            name: 'Weekly Attendance Report',
            description: 'Weekly attendance summary for all classes',
            reportType: 'attendance',
            frequency: 'weekly',
            dayOfWeek: 'monday',
            time: '09:00',
            format: 'pdf',
            recipients: ['admin@clms.com', 'dean@clms.com'],
            status: 'active',
            lastRun: '2026-04-11T09:00:00',
            nextRun: '2026-04-18T09:00:00'
          },
          {
            id: 2,
            name: 'Computer Inventory Report',
            description: 'Monthly computer inventory status',
            reportType: 'computers',
            frequency: 'monthly',
            dayOfMonth: 1,
            time: '08:00',
            format: 'excel',
            recipients: ['ict@clms.com'],
            status: 'active',
            lastRun: '2026-04-01T08:00:00',
            nextRun: '2026-05-01T08:00:00'
          },
          {
            id: 3,
            name: 'Maintenance Summary',
            description: 'Weekly maintenance request summary',
            reportType: 'maintenance',
            frequency: 'weekly',
            dayOfWeek: 'friday',
            time: '16:00',
            format: 'pdf',
            recipients: ['ict@clms.com'],
            status: 'paused',
            lastRun: '2026-04-08T16:00:00',
            nextRun: '2026-04-15T16:00:00'
          }
        ];
        setSchedules(sampleSchedules);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      addToast('Failed to load scheduled reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setShowScheduler(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowScheduler(true);
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to delete this scheduled report?')) {
      try {
        const result = await reportService.deleteScheduledReport(id);
        if (result && result.success) {
          addToast('Scheduled report deleted', 'success');
          loadSchedules();
        } else {
          addToast(result?.message || 'Failed to delete schedule', 'error');
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
        addToast('Failed to delete schedule', 'error');
      }
    }
  };

  const handleRunNow = async (id) => {
    try {
      const result = await reportService.runScheduledReport(id);
      if (result && result.success) {
        addToast('Report generated and sent', 'success');
      } else {
        addToast(result?.message || 'Failed to run report', 'error');
      }
    } catch (error) {
      console.error('Error running report:', error);
      addToast('Failed to run report', 'error');
    }
  };

  const handleSaveSchedule = async (scheduleData) => {
    try {
      let result;
      if (editingSchedule) {
        result = await reportService.updateScheduledReport(editingSchedule.id, scheduleData);
      } else {
        result = await reportService.createScheduledReport(scheduleData);
      }
      
      if (result && result.success) {
        addToast(editingSchedule ? 'Schedule updated' : 'Schedule created', 'success');
        setShowScheduler(false);
        setEditingSchedule(null);
        loadSchedules();
      } else {
        addToast(result?.message || 'Failed to save schedule', 'error');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      addToast('Failed to save schedule', 'error');
    }
  };

  if (loading) {
    return (
      <div className="scheduled-loading">
        <div className="spinner"></div>
        <p>Loading scheduled reports...</p>
      </div>
    );
  }

  return (
    <div className="scheduled-reports-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Scheduled Reports</h1>
        <p>Automate report generation and delivery</p>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <div className="info-icon">⏰</div>
          <h3>Automated Reports</h3>
          <p>Schedule reports to run automatically at specified intervals</p>
        </div>
        <div className="info-card">
          <div className="info-icon">📧</div>
          <h3>Email Delivery</h3>
          <p>Reports are automatically sent to specified recipients</p>
        </div>
        <div className="info-card">
          <div className="info-icon">📊</div>
          <h3>Multiple Formats</h3>
          <p>Choose between PDF, Excel, or CSV formats</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="add-section">
        <button className="add-schedule-btn" onClick={handleAddSchedule}>
          + Create New Schedule
        </button>
      </div>

      {/* Scheduled Reports List */}
      <ScheduledReports
        schedules={schedules}
        onDelete={handleDeleteSchedule}
        onEdit={handleEditSchedule}
        onRunNow={handleRunNow}
      />

      {/* Tips Section */}
      <div className="tips-section">
        <h3>💡 Tips for Scheduling Reports</h3>
        <ul>
          <li>Schedule weekly reports for regular monitoring</li>
          <li>Use monthly reports for comprehensive analysis</li>
          <li>Add multiple recipients for team distribution</li>
          <li>Pause schedules temporarily when not needed</li>
          <li>Review scheduled reports periodically</li>
        </ul>
      </div>

      {/* Report Scheduler Modal */}
      {showScheduler && (
        <ReportScheduler
          schedule={editingSchedule}
          onSave={handleSaveSchedule}
          onCancel={() => {
            setShowScheduler(false);
            setEditingSchedule(null);
          }}
        />
      )}
    </div>
  );
};

export default ScheduledReportsPage;