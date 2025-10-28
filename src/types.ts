export interface Book {
  id: string;
  title: string;
  totalPages: number;
  duration: number;
  startDate: Date;
  color: string;
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
}
