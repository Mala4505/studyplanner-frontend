import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, closestCenter, DragOverlay } from '@dnd-kit/core';
// import { DndKitDevTools } from '@dnd-kit/devtools';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { BookSidebar } from '../components/BookSidebar';
import { Calendar } from '../components/Calendar';
import { getBooks, getSchedule, scheduleBook, updateBlock } from '../api/schedule';
import { getMonthCalendar } from '../utils/hijriCalendar';
import { Book, CalendarDay, StudySession, ScheduledBlock } from '../types';
import { getCurrentUser } from '../utils/auth';
import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

export function Schedule() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, []);
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


  useEffect(() => {
    getBooks().then(setBooks).catch(err => console.error('Failed to fetch books:', err));

    getSchedule()
      .then(res => {
        // ✅ Assign colors per book
        const colorMap: Record<number, string> = {};
        let colorIndex = 0;

        res.forEach((block: ScheduledBlock) => {
          if (!colorMap[block.book]) {
            colorMap[block.book] = bookColors[colorIndex % bookColors.length];
            colorIndex++;
          }
        });

        const blocks = res.map(block => ({
          id: `session-${block.id}`,
          bookId: block.book,
          bookTitle: block.book_title || 'Untitled',
          date: block.date_gregorian,
          hijriDate: block.date_hijri,
          pageRange: {
            start: block.page_start,
            end: block.page_end
          },
          color: colorMap[block.book] // ✅ Now this works on refresh
        }));

        setStudySessions(blocks);
      })
      .catch(err => console.error('Failed to fetch schedule:', err));
  }, []);


  useEffect(() => {
    const days = getMonthCalendar(currentMonth.year, currentMonth.month);
    setCalendarDays(days);
  }, [currentMonth]);

  const user = getCurrentUser();

  const handleClearMySchedule = async () => {

    if (!confirm('This will remove all your scheduled blocks. Continue?')) return;

    try {
      const res = await fetch('http://localhost:8000/schedule/clear/', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await res.json();
      setStudySessions([]); // or call fetchStudySessions()
      toast.success(data.message || 'Your schedule has been cleared');
    } catch (err) {
      console.error('Failed to clear schedule:', err);
      toast.error('Error clearing your schedule');
    }
  };

  const handleAddBook = (book: Book) => {
    setBooks(prev => [...prev, book]);
    const sessions = generateStudySessions(book);
    setStudySessions(prev => [...prev, ...sessions]);
  };

  const generateStudySessions = (book: Book): StudySession[] => {
    const color = book.color || bookColors[Number(book.id) % bookColors.length];
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
        // color: book.color
        color: color
      });
    }
    return sessions;
  };

  const bookColors: string[] = [
    '#FF6B6B', '#6BCB77', '#F9F871', '#4D96FF', '#FFD93D', '#845EC2',
    '#00C9A7', '#FF9671', '#FFC75F', '#B39CD0'
  ];


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
      const updated = await getSchedule();
      const colorMap: Record<number, string> = {};

      let colorIndex = 0;

      updated.forEach((block: ScheduledBlock) => {
        if (!colorMap[block.book]) {
          colorMap[block.book] = bookColors[colorIndex % bookColors.length];
          colorIndex++;
        }
      });


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
        color: colorMap[block.book]
      }));
      console.log('Updated schedule:', blocks);
      setStudySessions(blocks);
    } catch (err) {
      console.error('Failed to handle drag end:', err);
    }
  };

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
    <div className="w-full h-screen overflow-hidden bg-gray-950 flex flex-col">
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
          <div
            className="flex gap-4"
            style={{
              transform: 'scale(0.85)',
              transformOrigin: 'top left',
              // width: '133.33%'
              height: '133.33%'  // optional, if height matters

            }}
          >
            <BookSidebar books={books} onAddBook={handleAddBook} />
          </div>


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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Your Calendar</h2>
                <button
                  onClick={handleClearMySchedule}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                  title="Clear all your scheduled blocks"
                >
                  🧹 Clear All
                </button>
              </div>
              <div
                id="calendar-container"
                className="bg-gray-900 rounded-lg p-6"
                style={{
                  transform: 'scale(0.85)',
                  transformOrigin: 'top left',
                  width: '115.33%', // 100 / 0.75
                  height: '133.33%'  // optional, if height matters
                }}
              >
                <Calendar days={calendarDays} schedule={studySessions} books={books} />
              </div>


            </div>
          </div>

        </DndContext>
      </div>
    </div>
  );
}
