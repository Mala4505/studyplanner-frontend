export interface User {
  trNumber: string;
  password: string;
  role: 'student' | 'admin';
}
export interface Book {
  id: string;
  title: string;
  pageFrom: number;
  pageTo: number;
  duration: number;
  totalPages: number;
}
export interface ScheduledBlock {
  id: string;
  bookId: string;
  date: string; // YYYY-MM-DD format
  pageFrom: number;
  pageTo: number;
  dayNumber: number; // Which day of the duration (1-based)
}
export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}
export interface CalendarDay {
  gregorianDate: Date;
  hijriDate: HijriDate;
  dayName: string;
  isCurrentMonth: boolean;
  isPast: boolean;
}