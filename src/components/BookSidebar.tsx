import { useState } from 'react';
import { Search } from 'lucide-react';
import { Book } from '../types';
import { BookBlock } from './BookBlock';
import { useDraggable } from '@dnd-kit/core';
import 'react-datepicker/dist/react-datepicker.css';
import * as ReactDatePicker from 'react-datepicker';
import { toast } from 'react-toastify';

interface BookSidebarProps {
  books: Book[];
  onAddBook: (book: Book) => void;
}

function DraggableBook({
  book,
  onStartFromDate
}: {
  book: Book;
  onStartFromDate: (book: Book) => void;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: book.id,
    data: { book },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="bg-gray-800 rounded-lg p-3 cursor-move select-none hover:bg-gray-700 transition-colors z-50"
    >
      <div className="pointer-events-none">
        <BookBlock book={book} isDraggable={true} />
        <div className="mt-2 text-xs text-gray-400">
          <div>Pages: {book.pageFrom} - {book.pageTo} ({book.totalPages} pages)</div>
          <div>Duration: {book.duration} days</div>
        </div>
      </div>
      <button
        onClick={() => onStartFromDate(book)}
        className="mt-2 text-xs text-blue-400 hover:text-blue-600 pointer-events-auto"
      >
        📅 Start from date
      </button>
    </div>
  );
}

export function BookSidebar({ books }: BookSidebarProps) {
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleScheduleFromDate = async () => {
    if (!selectedBook || !startDate) return;

    try {
      const res = await fetch('http://localhost:8000/api/schedule/book/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          book_id: selectedBook.id,
          start_date: startDate.toISOString().split('T')[0]
        })
      });

      if (!res.ok) throw new Error('Failed to schedule book');
      toast.success(`Scheduled "${selectedBook.title}" from ${startDate.toDateString()}`);
      setSelectedBook(null);
    } catch (err) {
      console.error(err);
      toast.error('Error scheduling book');
    }
  };

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
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredBooks.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">No books found</p>
        ) : (
          filteredBooks.map(book => (
            <DraggableBook key={book.id} book={book} onStartFromDate={setSelectedBook} />
          ))
        )}
      </div>

      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-white mb-4">Schedule "{selectedBook.title}" from:</h3>
            <ReactDatePicker.default
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              className="px-4 py-2 rounded bg-gray-800 text-white"
            />

            <div className="mt-4 flex gap-4">
              <button
                onClick={handleScheduleFromDate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
