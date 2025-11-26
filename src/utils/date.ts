/**
 * Date utility functions
 */

/**
 * Get the current week's Monday date
 */
export function getCurrentWeekMonday(): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(today.setDate(diff));
}

/**
 * Get the current week's Saturday date
 */
export function getCurrentWeekSaturday(): Date {
  const monday = getCurrentWeekMonday();
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  return saturday;
}

/**
 * Check if today is Sunday
 */
export function isSunday(): boolean {
  return new Date().getDay() === 0;
}

/**
 * Check if today is between Monday and Saturday
 */
export function isActiveSeasonDay(): boolean {
  const day = new Date().getDay();
  return day >= 1 && day <= 6; // Monday = 1, Saturday = 6
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

