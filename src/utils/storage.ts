import { Book, ScheduledBlock } from '../types';
const BOOKS_KEY = 'studyplanner_books';
const SCHEDULE_KEY = 'studyplanner_schedule';
export function getBooks(): Book[] {
  const stored = localStorage.getItem(BOOKS_KEY);
  return stored ? JSON.parse(stored) : [];
}
export function saveBooks(books: Book[]): void {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}
export function addBook(book: Book): void {
  const books = getBooks();
  books.push(book);
  saveBooks(books);
}
export function getSchedule(): ScheduledBlock[] {
  const stored = localStorage.getItem(SCHEDULE_KEY);
  return stored ? JSON.parse(stored) : [];
}
export function saveSchedule(schedule: ScheduledBlock[]): void {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
}
export function scheduleBook(book: Book, startDate: string): ScheduledBlock[] {
  const schedule = getSchedule();
  const pagesPerDay = Math.ceil(book.totalPages / book.duration);
  const newBlocks: ScheduledBlock[] = [];
  for (let day = 0; day < book.duration; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const pageFrom = book.pageFrom + day * pagesPerDay;
    const pageTo = Math.min(pageFrom + pagesPerDay - 1, book.pageTo);
    const block: ScheduledBlock = {
      id: `${book.id}-${day}`,
      bookId: book.id,
      date: date.toISOString().split('T')[0],
      pageFrom,
      pageTo,
      dayNumber: day + 1
    };
    newBlocks.push(block);
  }
  // Remove existing blocks for this book
  const filtered = schedule.filter(b => b.bookId !== book.id);
  const updated = [...filtered, ...newBlocks];
  saveSchedule(updated);
  return newBlocks;
}