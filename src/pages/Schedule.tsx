import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  DragOverlay
} from '@dnd-kit/core';
import {
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { BookSidebar } from '../components/BookSidebar';
import { Calendar } from '../components/Calendar';
import {
  getBooks,
  getSchedule,
  scheduleBook,
  updateBlock,
  getTags
} from '../api/schedule';
import { getMonthCalendar } from '../utils/hijriCalendar';
import {
  Book,
  CalendarDay,
  ScheduledBlock,
  Tag
} from '../types';
import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { BASE } from '../api/schedule';
import { tagColorMap } from '../constants';

export function Schedule() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [studySessions, setStudySessions] = useState<ScheduledBlock[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  });
  const [draggedBook, setDraggedBook] = useState<Book | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(true);

  const bookColors: string[] = [
    '#FF6B6B', '#6BCB77', '#F9F871', '#4D96FF', '#FFD93D', '#845EC2',
    '#00C9A7', '#FF9671', '#FFC75F', '#B39CD0'
  ];

  const hijriMonthsInView = Array.from(
    new Set(
      calendarDays
        .filter(day => day.isCurrentMonth)
        .map(day => day.hijriDate?.monthName)
        .filter(Boolean)
    )
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [booksData, tagsData] = await Promise.all([getBooks(), getTags()]);
        setBooks(booksData);
        setTags(tagsData);
        await refreshSchedule(tagsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        toast.error('Error loading initial data');
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadCalendar = async () => {
      setLoadingCalendar(true);
      const minimalBlocks = studySessions.map(({ date_gregorian, date_hijri }) => ({
        date_gregorian,
        date_hijri: date_hijri ?? undefined
      }));

      try {
        const days = await getMonthCalendar(currentMonth.year, currentMonth.month, minimalBlocks);
        setCalendarDays(days);
      } catch (err) {
        console.error('Failed to load calendar:', err);
        toast.error('Error loading calendar');
      } finally {
        setLoadingCalendar(false);
      }
    };

    loadCalendar();
  }, [currentMonth, studySessions]);

  const refreshSchedule = async (tagList: Tag[] = tags) => {
    setLoadingCalendar(true);
    try {
      const updated = await getSchedule();
      const tagMap = new Map(tagList.map(t => [t.id, t]));

      const hydrated = updated.map(block => {
        const tagId =
          typeof block.tag === 'number' ? block.tag :
            block.tag?.id ?? block.bookTag?.id;

        const fullTag = typeof tagId === 'number' ? tagMap.get(tagId) : undefined;
        const color = fullTag?.name ? tagColorMap[fullTag.name] : bookColors[block.book % bookColors.length];

        return {
          ...block,
          id: `session-${block.id}`,
          tag: fullTag ?? block.tag ?? block.bookTag,
          color,
          date_hijri: block.date_hijri
        };
      });

      setStudySessions(hydrated);
    } catch (err) {
      console.error('Failed to refresh schedule:', err);
      toast.error('Error refreshing schedule');
    } finally {
      setLoadingCalendar(false);
    }
  };

  const refreshAll = async () => {
    try {
      const [bookList, scheduleList] = await Promise.all([getBooks(), getSchedule()]);
      setBooks(bookList);

      const colorMap: Record<number, string> = {};
      let colorIndex = 0;

      const blocks = scheduleList.map(block => {
        if (!colorMap[block.book]) {
          colorMap[block.book] = bookColors[colorIndex % bookColors.length];
          colorIndex++;
        }
        const tag = block.tag || block.bookTag;
        const color = tag?.name ? tagColorMap[tag.name] : colorMap[block.book];
        return {
          ...block,
          id: `session-${block.id}`,
          color,
        };
      });

      setStudySessions(blocks);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const bookData = active.data.current?.book as Book;
    const sessionData = active.data.current?.session as ScheduledBlock;
    const targetDate = over.data.current?.date as string;

    try {
      if (bookData && !sessionData && targetDate) {
        await scheduleBook(bookData.id, targetDate);
      } else if (sessionData && targetDate) {
        const blockId = sessionData.id.replace('session-', '');
        await updateBlock(blockId, targetDate);
      }
      await refreshSchedule();
    } catch (err) {
      console.error('Failed to handle drag end:', err);
      toast.error('Error updating schedule');
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

  const handleClearMySchedule = async () => {
    if (!confirm('This will remove all your scheduled blocks. Continue?')) return;
    try {
      const res = await fetch(`${BASE}/schedule/clear/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await res.json();
      setStudySessions([]);
      toast.success(data.message || 'Your schedule has been cleared');
    } catch (err) {
      console.error('Failed to clear schedule:', err);
      toast.error('Error clearing your schedule');
    }
  };

  const monthName = format(new Date(currentMonth.year, currentMonth.month - 1), 'MMMM');

  const visibleSessions = selectedTags.length === 0
    ? studySessions
    : studySessions.filter(session => {
      const tag = session.tag || session.bookTag;
      return tag && selectedTags.includes(tag.name);
    });

  return (
    // <div className="w-full h-screen overflow-hidden bg-gray-950 flex flex-col relative">
    <div>
      {loadingCalendar && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-opacity-50"></div>
        </div>
      )}

      {/* <Navbar /> */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={event => {
            const book = event.active.data.current?.book;
            if (book) setDraggedBook(book);
          }}
          onDragEnd={event => {
            setDraggedBook(null);
            handleDragEnd(event);
          }}
        >
          <div className="flex gap-4" style={{ transform: 'scale(0.85)', transformOrigin: 'top left', height: '133.33%' }}>
            <BookSidebar
              books={books}
              onAddBook={book => {
                setBooks(prev => [...prev, book]);
                refreshAll();
              }}
              onScheduleChange={refreshAll}
            />
          </div>

          <DragOverlay>
            {draggedBook && (
              <div className="bg-gray-800 rounded-lg p-3 text-white shadow-lg w-64">
                <div className="font-semibold">{draggedBook.title}</div>
                <div className="text-xs text-gray-400">
                  Pages: {draggedBook.pageFrom}–{draggedBook.pageTo} ({draggedBook.totalPages} pages)
                </div>
                <div className="text-xs text-gray-400">Duration: {draggedBook.duration} days</div>
              </div>
            )}
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
                    <span className="text-sm text-gray-300 ml-3">({hijriMonthsInView.join(' | ')})</span>
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
                <PageHeader title="Schedule" />

                {/* <h2 className="text-xl font-bold text-white">Your Calendar</h2> */}
                <button
                  onClick={handleClearMySchedule}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                  title="Clear all your scheduled blocks"
                >
                  🧹 Clear All
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {Object.keys(tagColorMap).map(tagName => {
                  const isSelected = selectedTags.includes(tagName);
                  return (
                    <button
                      key={tagName}
                      onClick={() => {
                        setSelectedTags(prev =>
                          isSelected ? prev.filter(t => t !== tagName) : [...prev, tagName]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${isSelected ? 'bg-white text-black' : 'bg-gray-700 text-white'
                        }`}
                      style={{ border: `2px solid ${tagColorMap[tagName]}` }}
                    >
                      {tagName}
                    </button>
                  );
                })}
              </div>

              <div
                id="calendar-container"
                className="bg-gray-900 rounded-lg p-6"
                style={{
                  transform: 'scale(0.85)',
                  transformOrigin: 'top left',
                  width: '115.33%',
                  height: '133.33%',
                }}
              >
                <Calendar
                  days={calendarDays}
                  schedule={visibleSessions} // ✅ should be updated
                  tags={tags}
                  onRefresh={refreshSchedule}
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  hijriMonthsInView={hijriMonthsInView}
                />
              </div>
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
