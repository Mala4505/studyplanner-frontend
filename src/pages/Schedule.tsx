import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, closestCenter, DragOverlay } from '@dnd-kit/core';
// import { DndKitDevTools } from '@dnd-kit/devtools';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { BookSidebar } from '../components/BookSidebar';
import { Calendar } from '../components/Calendar';
import { getBooks, getSchedule, scheduleBook, updateBlock } from '../api/schedule';
import { getMonthCalendar } from '../utils/hijriCalendar';
import { Book, CalendarDay, StudySession } from '../types';
import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { format } from 'date-fns';

export function Schedule() {
  const [books, setBooks] = useState<Book[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  });
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [draggedBook, setDraggedBook] = useState<Book | null>(null);

  const hijriMonthsInView = Array.from(
    new Set(
      calendarDays
        .filter(day => day.isCurrentMonth)
        .map(day => day.hijriDate?.monthName)
        .filter(Boolean)
    )
  );
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, []);


  useEffect(() => {
    getBooks().then(setBooks).catch(err => console.error('Failed to fetch books:', err));
    getSchedule()
      .then(res => {
        const blocks = res.data.map(block => ({
          id: `session-${block.id}`,
          bookId: block.book,
          bookTitle: block.book_title || 'Untitled',
          date: block.date_gregorian,
          hijriDate: block.date_hijri,
          pageRange: {
            start: block.page_start,
            end: block.page_end
          },
          color: '#FF6B6B'
        }));
        setStudySessions(blocks);
      })
      .catch(err => console.error('Failed to fetch schedule:', err));
  }, []);

  useEffect(() => {
    const days = getMonthCalendar(currentMonth.year, currentMonth.month);
    setCalendarDays(days);
  }, [currentMonth]);

  const handleAddBook = (book: Book) => {
    setBooks(prev => [...prev, book]);
    const sessions = generateStudySessions(book);
    setStudySessions(prev => [...prev, ...sessions]);
  };

  const generateStudySessions = (book: Book): StudySession[] => {
    const sessions: StudySession[] = [];
    const pagesPerDay = Math.ceil(book.totalPages / book.duration);
    for (let day = 0; day < book.duration; day++) {
      const sessionDate = new Date(book.startDate);
      sessionDate.setDate(sessionDate.getDate() + day);
      const startPage = day * pagesPerDay + 1;
      const endPage = Math.min((day + 1) * pagesPerDay, book.totalPages);
      sessions.push({
        id: `${book.id}-session-${day}`,
        bookId: book.id,
        bookTitle: book.title,
        pageRange: {
          start: startPage,
          end: endPage
        },
        date: sessionDate.toISOString().split('T')[0],
        hijriDate: '',
        color: book.color
      });
    }
    return sessions;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const bookData = active.data.current?.book as Book;
    const sessionData = active.data.current?.session as StudySession;
    const targetDate = over.data.current?.date as string;

    console.log('Dragged:', bookData || sessionData);
    console.log('Dropped on:', targetDate);

    try {
      if (bookData && !sessionData && targetDate) {
        // 🟢 Dragged from sidebar — schedule new blocks
        console.log('Scheduling new book:', { bookId: bookData.id, date: targetDate });
        await scheduleBook(bookData.id, targetDate);
      } else if (sessionData && targetDate) {
        // 🟡 Dragged an existing block — update its date
        const blockId = sessionData.id.replace('session-', '');
        console.log('Updating existing block:', { blockId, newDate: targetDate });
        await updateBlock(blockId, targetDate);
      }

      // 🔄 Refresh schedule after either action
      const updated = await getSchedule();
      const blocks = updated.map(block => ({
        id: `session-${block.id}`,
        bookId: block.book,
        bookTitle: block.book_title || 'Untitled',
        date: block.date_gregorian,
        hijriDate: block.date_hijri,
        pageRange: {
          start: block.page_start,
          end: block.page_end
        },
        color: '#FF6B6B'
      }));
      console.log('Updated schedule:', blocks);
      setStudySessions(blocks);
    } catch (err) {
      console.error('Failed to handle drag end:', err);
    }
  };

  // const handleDragEnd = async (event: DragEndEvent) => {
  //   const { active, over } = event;
  //   if (!over || active.id === over.id) return;

  //   const bookData = active.data.current?.book as Book;
  //   const targetDate = over.data.current?.date as string;
  //   console.log('Dragged:', active.data.current?.book);
  //   console.log('Dropped on:', over?.data.current?.date);


  //   if (bookData && targetDate) {
  //     try {
  //       console.log('Sending POST request with:', {
  //         bookId: bookData.id,
  //         date: targetDate
  //       });
  //       await scheduleBook(bookData.id, targetDate);
  //       const updated = await getSchedule();
  //       // console.log('Updated schedule:', updated);
  //       const blocks = updated.map(block => ({
  //         id: `session-${block.id}`,
  //         bookId: block.book,
  //         bookTitle: block.book_title || 'Untitled',
  //         date: block.date_gregorian,
  //         hijriDate: block.date_hijri,
  //         pageRange: {
  //           start: block.page_start,
  //           end: block.page_end
  //         },
  //         color: '#FF6B6B'
  //       }));
  //     console.log('Updated schedule:', blocks);
  //       setStudySessions(blocks);
  //     } catch (err) {
  //       console.error('Failed to schedule book:', err);
  //     }
  //   }
  // };

  const handlePrevMonth = () => {
    setCurrentMonth(prev =>
      prev.month === 1
        ? { year: prev.year - 1, month: 12 }
        : { year: prev.year, month: prev.month - 1 }
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev =>
      prev.month === 12
        ? { year: prev.year + 1, month: 1 }
        : { year: prev.year, month: prev.month + 1 }
    );
  };

  const handleExportPDF = async () => {
    const calendarElement = document.getElementById('calendar-container');
    if (!calendarElement) return;
    try {
      const dataUrl = await toCanvas(calendarElement);
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgWidth = 297;
      const imgHeight = (calendarElement.offsetHeight * imgWidth) / calendarElement.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`schedule-${currentMonth.year}-${currentMonth.month}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  const monthName = format(new Date(currentMonth.year, currentMonth.month - 1), 'MMMM');

  return (
    <div className="w-full min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={(event) => {
            const book = event.active.data.current?.book;
            if (book) {
              setDraggedBook(book);
            }
          }}
          onDragEnd={(event) => {
            setDraggedBook(null);
            handleDragEnd(event);
          }}

        // onDragEnd={handleDragEnd}
        >
          <BookSidebar books={books} onAddBook={handleAddBook} />
          {/* <DndKitDevTools /> */}
          <DragOverlay>
            {draggedBook ? (
              <div className="bg-gray-800 rounded-lg p-3 text-white shadow-lg w-64">
                <div className="font-semibold">{draggedBook.title}</div>
                <div className="text-xs text-gray-400">
                  Pages: {draggedBook.pageFrom}–{draggedBook.pageTo} ({draggedBook.totalPages} pages)
                </div>
                <div className="text-xs text-gray-400">Duration: {draggedBook.duration} days</div>
              </div>
            ) : null}
          </DragOverlay>
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={handlePrevMonth} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-2xl font-bold text-white">
                    {monthName} {currentMonth.year}
                    <span className="text-sm text-gray-300 ml-3">
                      ({hijriMonthsInView.join(' | ')})
                    </span>
                  </h2>

                  <button onClick={handleNextMonth} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
                <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  <Download size={18} />
                  Export PDF
                </button>
              </div>
              <div id="calendar-container" className="bg-gray-900 rounded-lg p-6">
                <Calendar days={calendarDays} schedule={studySessions} books={books} />
              </div>
            </div>
          </div>

        </DndContext>
      </div>
    </div>
  );
}
