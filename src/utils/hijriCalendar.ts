import { CalendarDay, HijriDate } from '../types';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays
} from 'date-fns';
// @ts-ignore
import moment from 'moment-hijri';

export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhul-Qi'dah",
  'Dhul-Hijjah'
];

// ✅ Normalize to noon to avoid timezone shifts
function normalizeToNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

// ✅ Safe Hijri conversion using addDays
export function gregorianToHijri(date: Date): HijriDate {
  const hijriMoment = moment(date).add(1, 'days'); // ✅ hard-coded +2 day offset

  const year = hijriMoment.iYear();
  const month = hijriMoment.iMonth(); // 0-indexed
  const day = hijriMoment.iDate();

  return {
    year,
    month: month + 1,
    day,
    monthName: HIJRI_MONTHS[month] ?? 'Unknown'
  };
}


// ✅ Calendar generator using frontend Hijri conversion
export async function getMonthCalendar(
  year: number,
  month: number,
  blocks: { date_gregorian: string; date_hijri?: HijriDate }[],
  hijriOffset = 0
): Promise<CalendarDay[]> {
  const baseDate = new Date(year, month - 1);
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const calendarDays = days.map(date => {
    // const localDate = normalizeToNoon(date);
    // const dateStr = localDate.toLocaleDateString('en-CA');
    // const block = blocks.find(b => b.date_gregorian === dateStr);

    // let hijriDate: HijriDate | undefined;
    // if (block?.date_hijri) {
    //   hijriDate = block.date_hijri;
    // } else {
    //   hijriDate = gregorianToHijri(localDate);
    // }
    const localDate = normalizeToNoon(date);
    const dateStr = localDate.toISOString().split('T')[0];
    const block = blocks.find(b => b.date_gregorian === dateStr);

    let hijriDate: HijriDate | undefined;
    if (block?.date_hijri?.year && block?.date_hijri?.month && block?.date_hijri?.day) {
      hijriDate = block.date_hijri;
    } else {
      hijriDate = gregorianToHijri(localDate);
    }

    
    return {
      gregorianDate: localDate,
      hijriDate,
      isCurrentMonth: localDate.getMonth() === monthStart.getMonth()
    };
  });

  return calendarDays;
}
