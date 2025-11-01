import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Book, ScheduledBlock } from '../types';
import { BookBlock } from './BookBlock';
import { useDraggable } from '@dnd-kit/core';
import { toast } from 'react-toastify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { getSchedule } from '../api/schedule';

interface BookSidebarProps {
  books: Book[];
  onAddBook: (book: Book) => void;
  onScheduleChange?: () => void;
}

function DraggableBook({
  book,
  isScheduling,
  startDate,
  onScheduleClick,
  onDateChange,
  onConfirmSchedule,
  onCancelSchedule,
  onDeleteSchedule
}: {
  book: Book;
  isScheduling: boolean;
  startDate: Date | null;
  onScheduleClick: () => void;
  onDateChange: (date: Date | null) => void;
  onConfirmSchedule: () => void;
  onCancelSchedule: () => void;
  onDeleteSchedule: (book: Book) => void;
}) {
  const { setNodeRef } = useDraggable({
    id: book.id,
    data: { book },
  });

  return (
    <div
      ref={setNodeRef}
      className="group bg-gray-800 rounded-lg p-3 select-none hover:bg-gray-700 transition-colors relative"
    >
      <BookBlock
        book={book}
        isDraggable={true}
        onSchedule={() => {
          console.log('Schedule clicked for', book.title);
          onScheduleClick(); // ✅ fixed missing call
        }}
        onDelete={() => onDeleteSchedule(book)}
      />
      <div className="mt-2 text-xs text-gray-400">
        <div>Pages: {book.pageFrom} - {book.pageTo} ({book.totalPages} pages)</div>
        <div>Duration: {book.duration} days</div>
      </div>

      {isScheduling && (
        <div className="mt-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={onDateChange}
              disablePast
              openTo="day" // ✅ This forces it to open with day selection
              // views={['day', 'month', 'year']}
            />
          </LocalizationProvider>
          <div className="mt-2 flex gap-2 justify-end">
            <button
              onClick={onConfirmSchedule}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ✅
            </button>
            <button
              onClick={onCancelSchedule}
              className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              ❌
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BookSidebar({ books, onAddBook, onScheduleChange }: BookSidebarProps) {
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [scheduleBookId, setScheduleBookId] = useState<string | null>(null);
  const [scheduledBlocks, setScheduledBlocks] = useState<ScheduledBlock[]>([]);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleScheduleFromDate = async () => {
    if (!selectedBook || !startDate) return;

    try {
      const res = await fetch('http://localhost:8000/schedule/book/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          book_id: selectedBook.id,
          start_date: format(startDate, 'yyyy-MM-dd')
        })
      });

      if (!res.ok) throw new Error('Failed to schedule book');
      toast.success(`Scheduled "${selectedBook.title}" from ${format(startDate, 'dd-MM-yyyy')}`);
      setSelectedBook(null);
      setScheduleBookId(null);
      onScheduleChange?.();
    } catch (err) {
      console.error(err);
      toast.error('Error scheduling book');
    }
  };

  const handleDeleteSchedule = async (book: Book) => {
    const confirmed = window.confirm(`Remove schedule for "${book.title}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/schedule/book/${book.id}/delete/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to delete schedule');
      toast.success(`Removed all blocks for "${book.title}"`);
      onScheduleChange?.();
    } catch (err) {
      console.error(err);
      toast.error('Error removing schedule');
    }
  };

  const refreshSchedule = async () => {
    try {
      const blocks = await getSchedule();
      setScheduledBlocks(blocks);
    } catch (err) {
      console.error('Failed to refresh schedule', err);
    }
  };

  useEffect(() => {
    refreshSchedule();
  }, []);

  return (
    <div
      className="w-80 bg-gray-900 border-r border-gray-800 p-4 flex flex-col h-full"
      style={{
        transform: 'scale(0.75)',
        transformOrigin: 'top left',
        width: '133.33%'
      }}
    >
      <h2 className="text-lg font-bold text-white mb-4">My Books</h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredBooks.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">No books found</p>
        ) : (
          filteredBooks.map(book => (
            <DraggableBook
              key={book.id}
              book={book}
              isScheduling={scheduleBookId === book.id}
              startDate={startDate}
              onScheduleClick={() => {
                setScheduleBookId(book.id);
                setSelectedBook(book);
              }}
              onDateChange={setStartDate}
              onConfirmSchedule={handleScheduleFromDate}
              onCancelSchedule={() => {
                setScheduleBookId(null);
                setSelectedBook(null);
              }}
              onDeleteSchedule={handleDeleteSchedule}
            />
          ))
        )}
      </div>
    </div>
  );
}
