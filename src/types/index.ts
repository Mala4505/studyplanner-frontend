// export interface User {
//   trNumber: string;
//   password: string;
//   role: 'student' | 'admin';
// }
// export interface Book {
//   id: string;
//   title: string;
//   pageFrom: number;
//   pageTo: number;
//   duration: number;
//   totalPages: number;
// }
// export interface ScheduledBlock {
//   id: string;
//   bookId: string;
//   date: string; // YYYY-MM-DD format
//   pageFrom: number;
//   pageTo: number;
//   dayNumber: number; // Which day of the duration (1-based)
// }
// export interface HijriDate {
//   year: number;
//   month: number;
//   day: number;
//   monthName: string;
// }
// export interface CalendarDay {
//   gregorianDate: Date;
//   hijriDate: HijriDate;
//   dayName: string;
//   isCurrentMonth: boolean;
//   isPast: boolean;
// }
// // export interface Book {
// //   id: string;
// //   title: string;
// //   totalPages: number;
// //   duration: number;
// //   startDate: Date;
// //   color: string;
// // }

// export interface StudySession {
//   id: string;
//   bookId: string;
//   bookTitle: string;
//   pageRange: {
//     start: number;
//     end: number;
//   };
//   date: string;
//   hijriDate: string;
//   color: string;
// }

// // export type CalendarDay = {
// //   date: string;
// //   hijriDate?: string;
// //   blocks: ScheduledBlock[];
// // };
