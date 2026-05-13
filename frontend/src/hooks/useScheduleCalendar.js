import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services'; // Fixed import

const useScheduleCalendar = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    
    // Load initial data
    loadSchedules();
    loadScheduleStats();
  }, []);

  const loadSchedules = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await scheduleService.getSchedules(filters);
      if (result.success) {
        setSchedules(result.data || []);
      }
      return result;
    } catch (err) {
      console.error('Failed to load schedules:', err);
      setError(err.response?.data?.message || 'Failed to load schedules');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadScheduleStats = useCallback(async () => {
    try {
      const result = await scheduleService.getScheduleStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load schedule stats:', err);
    }
  }, []);

  const createSchedule = useCallback(async (scheduleData) => {
    try {
      setLoading(true);
      const result = await scheduleService.createSchedule(scheduleData);
      if (result.success) {
        await loadSchedules();
      }
      return result;
    } catch (err) {
      console.error('Failed to create schedule:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to create schedule' 
      };
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  const approveSchedule = useCallback(async (id, comments) => {
    try {
      setLoading(true);
      const result = await scheduleService.approveSchedule(id, comments);
      if (result.success) {
        await loadSchedules();
      }
      return result;
    } catch (err) {
      console.error('Failed to approve schedule:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to approve schedule' 
      };
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  const rejectSchedule = useCallback(async (id, reason) => {
    try {
      setLoading(true);
      const result = await scheduleService.rejectSchedule(id, reason);
      if (result.success) {
        await loadSchedules();
      }
      return result;
    } catch (err) {
      console.error('Failed to reject schedule:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to reject schedule' 
      };
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  const cancelSchedule = useCallback(async (id, reason) => {
    try {
      setLoading(true);
      const result = await scheduleService.cancelSchedule(id, reason);
      if (result.success) {
        await loadSchedules();
      }
      return result;
    } catch (err) {
      console.error('Failed to cancel schedule:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to cancel schedule' 
      };
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  const checkAvailability = useCallback(async (labId, date, startTime, endTime) => {
    try {
      const result = await scheduleService.checkAvailability(labId, date, startTime, endTime);
      return result;
    } catch (err) {
      console.error('Failed to check availability:', err);
      return { 
        success: false, 
        available: false,
        message: err.response?.data?.message || 'Failed to check availability' 
      };
    }
  }, []);

  const getSchedulesByDateRange = useCallback(async (startDate, endDate) => {
    try {
      const result = await scheduleService.getSchedulesByDateRange(startDate, endDate);
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Failed to get schedules by date range:', err);
      return [];
    }
  }, []);

  const getAvailableTimeSlots = useCallback(async (labId, date) => {
    try {
      const result = await scheduleService.getAvailableTimeSlots(labId, date);
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Failed to get available time slots:', err);
      return [];
    }
  }, []);

  return {
    schedules,
    loading,
    error,
    stats,
    currentUser,
    loadSchedules,
    loadScheduleStats,
    createSchedule,
    approveSchedule,
    rejectSchedule,
    cancelSchedule,
    checkAvailability,
    getSchedulesByDateRange,
    getAvailableTimeSlots
  };
};

export default useScheduleCalendar;