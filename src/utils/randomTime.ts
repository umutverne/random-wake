import { parse, differenceInMinutes, addMinutes, addSeconds } from 'date-fns';

/**
 * Parse time string to Date object
 */
export const parseTimeString = (timeStr: string, baseDate: Date = new Date()): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

/**
 * Calculate the difference in minutes between two time strings
 */
export const getTimeRangeMinutes = (startTime: string, endTime: string): number => {
  const start = parseTimeString(startTime);
  let end = parseTimeString(endTime);

  // Handle overnight alarms (e.g., 23:30 - 00:30)
  if (end <= start) {
    end = addMinutes(end, 24 * 60);
  }

  return differenceInMinutes(end, start);
};

/**
 * Check if time range exceeds recommended maximum
 */
export const isTimeRangeExceeded = (startTime: string, endTime: string, maxMinutes: number = 30): boolean => {
  return getTimeRangeMinutes(startTime, endTime) > maxMinutes;
};

/**
 * Generate a random alarm time within the given range
 */
export const getRandomAlarmTime = (startTime: string, endTime: string, baseDate: Date = new Date()): Date => {
  const start = parseTimeString(startTime, baseDate);
  let end = parseTimeString(endTime, baseDate);

  // Handle overnight alarms
  if (end <= start) {
    end = addMinutes(end, 24 * 60);
  }

  const diffMs = end.getTime() - start.getTime();
  const randomMs = Math.floor(Math.random() * diffMs);

  return new Date(start.getTime() + randomMs);
};

/**
 * Get the next occurrence of the alarm based on repeat days
 * @param startTime - Start time in "HH:mm" format
 * @param endTime - End time in "HH:mm" format
 * @param repeatDays - Array of days (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export const getNextAlarmDate = (
  startTime: string,
  endTime: string,
  repeatDays: number[]
): Date | null => {
  if (repeatDays.length === 0) {
    // One-time alarm - schedule for today or tomorrow
    const now = new Date();
    const todayStart = parseTimeString(startTime, now);

    if (todayStart > now) {
      return getRandomAlarmTime(startTime, endTime, now);
    } else {
      // Schedule for tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return getRandomAlarmTime(startTime, endTime, tomorrow);
    }
  }

  const now = new Date();
  const currentDay = now.getDay();

  // Check today first
  if (repeatDays.includes(currentDay)) {
    const todayStart = parseTimeString(startTime, now);
    if (todayStart > now) {
      return getRandomAlarmTime(startTime, endTime, now);
    }
  }

  // Find next repeat day
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    if (repeatDays.includes(nextDay)) {
      const nextDate = new Date(now);
      nextDate.setDate(nextDate.getDate() + i);
      return getRandomAlarmTime(startTime, endTime, nextDate);
    }
  }

  return null;
};

/**
 * Format time for display
 */
export const formatTimeDisplay = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format time range for display
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

/**
 * Get human readable time until alarm
 */
export const getTimeUntilAlarm = (alarmTime: Date): string => {
  const now = new Date();
  const diffMs = alarmTime.getTime() - now.getTime();

  if (diffMs <= 0) return 'Now';

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
