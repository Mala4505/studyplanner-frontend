export interface User {
  id: number;
  tr_number: string;
  role: 'student' | 'admin';
  password?: string;
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

export interface CalendarDay {
  gregorianDate: Date;
  hijriDate?: HijriDate | null;
  // dayName: string;
  isCurrentMonth: boolean;
  // isPast: boolean;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  icon?: string;
  category?: string;
  is_block_only?: boolean;
}

export interface Book {
  id: number;
  title: string;
  pageFrom: number;
  pageTo: number;
  totalPages: number;
  duration: number;
  tag?: Tag;
}

export interface ScheduledBlock {
  id: string;
  book: number;
  book_title: string;
  date_gregorian: string;
  date_hijri?: HijriDate;
  day_of_week?: string;
  page_start: number;
  page_end: number;
  tag?: Tag;
  bookTag?: Tag;
  color?: string;
}

export interface StudySession {
  id: string;
  bookId: string;
  bookTitle: string;
  pageRange: {
    start: number;
    end: number;
  };
  date: string;
  hijriDate: string;
  color: string;
  tag?: Tag;
  bookTag?: Tag;
}
