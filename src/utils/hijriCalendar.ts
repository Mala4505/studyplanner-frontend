// import { HijriDate, CalendarDay } from '../types';

// const HIJRI_MONTHS = [
//   'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
//   'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
//   'Ramadan', 'Shawwal', "Dhul-Qi'dah", 'Dhul-Hijjah'
// ];

// const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// // Approximate Hijri conversion (simplified algorithm)
// export function gregorianToHijri(date: Date): HijriDate {
//   const timestamp = date.getTime();
//   const hijriEpoch = new Date(622, 6, 16).getTime();
//   const daysSinceEpoch = Math.floor((timestamp - hijriEpoch) / (1000 * 60 * 60 * 24));
//   const lunarYear = 354.36667;
//   const year = Math.floor(daysSinceEpoch / lunarYear) + 1;
//   const dayOfYear = Math.floor(daysSinceEpoch % lunarYear);
//   const month = Math.min(Math.floor(dayOfYear / 29.5) + 1, 12);
//   const day = Math.floor(dayOfYear % 29.5) + 1;

//   return {
//     year,
//     month,
//     day,
//     monthName: HIJRI_MONTHS[month - 1]
//   };
// }

// // Approximate Gregorian conversion from Hijri (simplified)
// export function hijriToGregorian(hYear: number, hMonth: number, hDay: number): Date {
//   const hijriEpoch = new Date(622, 6, 16).getTime();
//   const lunarYear = 354.36667;
//   const days = Math.floor((hYear - 1) * lunarYear + (hMonth - 1) * 29.5 + (hDay - 1));
//   return new Date(hijriEpoch + days * 24 * 60 * 60 * 1000);
// }

// // Approximate Hijri month length (alternating 30/29 days)
// export function getHijriMonthLength(year: number, month: number): number {
//   // Simple alternating logic: odd months = 30, even = 29
//   return month % 2 === 1 ? 30 : 29;
// }

// export function getMonthCalendar(hijriYear: number, hijriMonth: number): CalendarDay[] {
//   const hijriStart = hijriToGregorian(hijriYear, hijriMonth, 1);
//   const hijriLength = getHijriMonthLength(hijriYear, hijriMonth);

//   const days: CalendarDay[] = [];

//   for (let i = 0; i < hijriLength; i++) {
//     const gregorianDate = new Date(hijriStart);
//     gregorianDate.setDate(gregorianDate.getDate() + i);
//     const hijriDate = gregorianToHijri(gregorianDate);

//     days.push({
//       gregorianDate,
//       hijriDate,
//       isCurrentMonth: hijriDate.month === hijriMonth
//     });
//   }

//   // Pad start of week
//   const startDay = days[0].gregorianDate.getDay();
//   for (let i = 1; i <= startDay; i++) {
//     const padDate = new Date(days[0].gregorianDate);
//     padDate.setDate(padDate.getDate() - i);
//     days.unshift({
//       gregorianDate: padDate,
//       hijriDate: gregorianToHijri(padDate),
//       isCurrentMonth: false
//     });
//   }

//   // Pad end of week
//   const endDay = days[days.length - 1].gregorianDate.getDay();
//   for (let i = 1; i < 7 - endDay; i++) {
//     const padDate = new Date(days[days.length - 1].gregorianDate);
//     padDate.setDate(padDate.getDate() + i);
//     days.push({
//       gregorianDate: padDate,
//       hijriDate: gregorianToHijri(padDate),
//       isCurrentMonth: false
//     });
//   }

//   return days;
// }

// export function formatGregorianDate(date: Date): string {
//   return date.toLocaleDateString('en-US', {
//     month: 'short',
//     day: 'numeric'
//   });
// }

// export function dateToString(date: Date): string {
//   return date.toISOString().split('T')[0];
// }

import { CalendarDay, HijriDate } from '../types';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval
} from 'date-fns';

// Optional: Hijri month names if you want to show them later
const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul-Qi'dah", 'Dhul-Hijjah'
];

// Optional Hijri conversion using moment-hijri
import moment from 'moment-hijri';

export function gregorianToHijri(date: Date): HijriDate {
  const m = moment(date).locale('en'); // ensure locale is set
  const year = m.iYear();              // Hijri year
  const month = m.iMonth() + 1;        // Hijri month (0-indexed)
  const day = m.iDate();               // Hijri day
  const monthName = HIJRI_MONTHS[month - 1];

  return { year, month, day, monthName };
}


export function getMonthCalendar(year: number, month: number): CalendarDay[] {
  console.log(gregorianToHijri(new Date()));
  const baseDate = new Date(year, month - 1); // month is 1-indexed
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days.map(date => ({
    gregorianDate: date,
    hijriDate: gregorianToHijri(date), // optional: remove if not needed
    isCurrentMonth: date.getMonth() === monthStart.getMonth()
  }));
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
