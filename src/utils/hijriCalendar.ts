import { HijriDate, CalendarDay } from '../types';
const HIJRI_MONTHS = ['Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani", 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhul-Qi'dah", 'Dhul-Hijjah'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Approximate Hijri conversion (simplified algorithm)
export function gregorianToHijri(date: Date): HijriDate {
  const timestamp = date.getTime();
  const hijriEpoch = new Date(622, 6, 16).getTime();
  const daysSinceEpoch = Math.floor((timestamp - hijriEpoch) / (1000 * 60 * 60 * 24));
  // Approximate lunar year length
  const lunarYear = 354.36667;
  const year = Math.floor(daysSinceEpoch / lunarYear) + 1;
  const dayOfYear = Math.floor(daysSinceEpoch % lunarYear);
  // Approximate month (29.5 days per month)
  const month = Math.min(Math.floor(dayOfYear / 29.5) + 1, 12);
  const day = Math.floor(dayOfYear % 29.5) + 1;
  return {
    year,
    month,
    day,
    monthName: HIJRI_MONTHS[month - 1]
  };
}
export function getMonthCalendar(hijriYear: number, hijriMonth: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start with an approximate Gregorian date for this Hijri month
  const baseDate = new Date(2024, 0, 1);
  const currentHijri = gregorianToHijri(baseDate);
  // Adjust to target month
  const monthDiff = (hijriYear - currentHijri.year) * 12 + (hijriMonth - currentHijri.month);
  const targetDate = new Date(baseDate);
  targetDate.setDate(targetDate.getDate() + monthDiff * 29.5);
  // Find the first day of the month
  let firstDayOfMonth: Date | null = null;
  for (let i = -5; i < 35; i++) {
    const date = new Date(targetDate);
    date.setDate(date.getDate() + i);
    const hijri = gregorianToHijri(date);
    if (hijri.month === hijriMonth && hijri.day === 1) {
      firstDayOfMonth = date;
      break;
    }
  }
  if (!firstDayOfMonth) {
    firstDayOfMonth = targetDate;
  }
  // Get all days in the month
  const monthDays: Date[] = [];
  for (let i = 0; i < 35; i++) {
    const date = new Date(firstDayOfMonth);
    date.setDate(date.getDate() + i);
    const hijri = gregorianToHijri(date);
    if (hijri.month === hijriMonth) {
      monthDays.push(date);
    } else if (monthDays.length > 0) {
      break;
    }
  }
  // Add padding days before the month starts
  const firstDay = monthDays[0];
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(firstDay);
    date.setDate(date.getDate() - (i + 1));
    const hijri = gregorianToHijri(date);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    days.push({
      gregorianDate: date,
      hijriDate: hijri,
      dayName: DAY_NAMES[date.getDay()],
      isCurrentMonth: false,
      isPast: dateOnly < today
    });
  }
  // Add all days in the month
  for (const date of monthDays) {
    const hijri = gregorianToHijri(date);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    days.push({
      gregorianDate: date,
      hijriDate: hijri,
      dayName: DAY_NAMES[date.getDay()],
      isCurrentMonth: true,
      isPast: dateOnly < today
    });
  }
  // Add padding days after the month ends to complete the grid
  const lastDay = monthDays[monthDays.length - 1];
  const remainingCells = 35 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(lastDay);
    date.setDate(date.getDate() + i);
    const hijri = gregorianToHijri(date);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    days.push({
      gregorianDate: date,
      hijriDate: hijri,
      dayName: DAY_NAMES[date.getDay()],
      isCurrentMonth: false,
      isPast: dateOnly < today
    });
  }
  return days;
}
export function formatGregorianDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
export function dateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}