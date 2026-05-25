/**
 * Scheduling Algorithm Utility
 * Handles conflict detection, time slot finding, and schedule optimization
 */

const TIME_SLOTS = {
  MORNING: { start: '08:00', end: '12:00', label: 'Morning' },
  AFTERNOON: { start: '13:00', end: '17:00', label: 'Afternoon' },
  EVENING: { start: '18:00', end: '20:00', label: 'Evening' },
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function timeToMinutes(time) {
  if (typeof time === 'string') return parseTime(time);
  return time;
}

/**
 * Check if two time ranges overlap
 */
function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

/**
 * Detect conflicts between a proposed booking and existing schedules
 */
export function detectConflicts(proposed, existingSchedules) {
  const conflicts = [];
  const { labId, date, startTime, endTime } = proposed;

  for (const schedule of existingSchedules) {
    const sameLab = schedule.laboratory_id === labId || schedule.lab_id === labId;
    const sameDate = schedule.date === date || schedule.schedule_date === date;

    if (sameLab && sameDate) {
      const sTime = schedule.start_time || schedule.startTime;
      const eTime = schedule.end_time || schedule.endTime;

      if (timesOverlap(startTime, endTime, sTime, eTime)) {
        conflicts.push({
          id: schedule.id,
          course: schedule.course_name || schedule.course,
          instructor: schedule.instructor_name || schedule.instructor,
          startTime: sTime,
          endTime: eTime,
          status: schedule.status,
        });
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Find available time slots for a lab on a given date
 */
export function findAvailableSlots(laboratoryId, date, existingSchedules, durationMinutes = 120) {
  const bookedSlots = existingSchedules
    .filter(s => (s.laboratory_id === laboratoryId || s.lab_id === laboratoryId) &&
                 (s.date === date || s.schedule_date === date) &&
                 s.status !== 'cancelled' && s.status !== 'rejected')
    .map(s => ({
      start: timeToMinutes(s.start_time || s.startTime),
      end: timeToMinutes(s.end_time || s.endTime),
    }))
    .sort((a, b) => a.start - b.start);

  const availableSlots = [];
  const daySlots = Object.values(TIME_SLOTS);

  for (const slot of daySlots) {
    let slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);

    while (slotStart + durationMinutes <= slotEnd) {
      const slotEndTime = slotStart + durationMinutes;
      let isBooked = false;

      for (const booked of bookedSlots) {
        if (timesOverlap(slotStart, slotEndTime, booked.start, booked.end)) {
          slotStart = booked.end;
          isBooked = true;
          break;
        }
      }

      if (!isBooked) {
        availableSlots.push({
          start: formatTime(slotStart),
          end: formatTime(slotStart + durationMinutes),
          duration: durationMinutes,
          period: slot.label,
        });
        slotStart += durationMinutes;
      }
    }
  }

  return availableSlots;
}

/**
 * Auto-schedule: find the best time slot for a booking
 * Prioritizes: preferred time → least conflicts → earliest available
 */
export function autoSchedule(laboratoryId, date, existingSchedules, preferences = {}) {
  const {
    preferredPeriod,
    durationMinutes = 120,
    avoidDays = [],
  } = preferences;

  const dayOfWeek = new Date(date).getDay();
  if (avoidDays.includes(dayOfWeek)) {
    return { found: false, reason: 'Date falls on an avoided day' };
  }

  let available = findAvailableSlots(laboratoryId, date, existingSchedules, durationMinutes);

  if (preferredPeriod) {
    const preferred = available.filter(s => s.period === preferredPeriod);
    if (preferred.length > 0) available = preferred;
  }

  if (available.length === 0) {
    return {
      found: false,
      reason: 'No available time slots found for the requested duration',
      alternativeDates: [],
    };
  }

  const best = available[0];
  return {
    found: true,
    slot: best,
    allAvailable: available,
  };
}

/**
 * Batch schedule: distribute multiple sessions across available slots
 */
export function batchSchedule(sessions, existingSchedules) {
  const results = [];
  const updatedSchedules = [...existingSchedules];

  for (const session of sessions) {
    const { laboratoryId, date, durationMinutes, course, instructor } = session;
    const available = findAvailableSlots(laboratoryId, date, updatedSchedules, durationMinutes);

    if (available.length === 0) {
      results.push({ ...session, scheduled: false, reason: 'No available slot' });
      continue;
    }

    const slot = available[0];
    updatedSchedules.push({
      laboratory_id: laboratoryId,
      date,
      start_time: slot.start,
      end_time: slot.end,
      course_name: course,
      instructor_name: instructor,
    });

    results.push({ ...session, scheduled: true, slot });
  }

  return {
    results,
    scheduled: results.filter(r => r.scheduled).length,
    failed: results.filter(r => !r.scheduled).length,
  };
}

/**
 * Get available time periods for a day
 */
export function getTimePeriods() {
  return Object.entries(TIME_SLOTS).map(([key, val]) => ({
    id: key,
    ...val,
  }));
}

/**
 * Check if schedule can be moved to alternative time
 */
export function suggestAlternatives(proposed, existingSchedules, maxSuggestions = 3) {
  const suggestions = [];
  const { labId, date, startTime, endTime } = proposed;
  const duration = timeToMinutes(endTime) - timeToMinutes(startTime);

  const available = findAvailableSlots(labId, date, existingSchedules, duration);

  for (const slot of available) {
    if (!timesOverlap(startTime, endTime, slot.start, slot.end)) {
      suggestions.push(slot);
      if (suggestions.length >= maxSuggestions) break;
    }
  }

  return suggestions;
}

export { TIME_SLOTS, DAYS_OF_WEEK };
