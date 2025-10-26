import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { BookSidebar } from '../components/BookSidebar';
import { Calendar } from '../components/Calendar';
import { getBooks, getSchedule, scheduleBook } from '../utils/storage';
import { gregorianToHijri, getMonthCalendar } from '../utils/hijriCalendar';
import { Book, ScheduledBlock, CalendarDay } from '../types';
import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
export function Schedule() {
  const [books, setBooks] = useState<Book[]>([]);
  const [schedule, setSchedule] = useState<ScheduledBlock[]>([]);
  const [currentHijriMonth, setCurrentHijriMonth] = useState(() => {
    const today = gregorianToHijri(new Date());
    return {
      year: today.year,
      month: today.month
    };
  });
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  useEffect(() => {
    setBooks(getBooks());
    setSchedule(getSchedule());
  }, []);
  useEffect(() => {
    const days = getMonthCalendar(currentHijriMonth.year, currentHijriMonth.month);
    setCalendarDays(days);
  }, [currentHijriMonth]);
  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (!over) return;
    const bookData = active.data.current?.book as Book;
    const targetDate = over.data.current?.date as string;
    if (bookData && targetDate) {
      const newBlocks = scheduleBook(bookData, targetDate);
      setSchedule(getSchedule());
    }
  };
  const handlePrevMonth = () => {
    setCurrentHijriMonth(prev => {
      if (prev.month === 1) {
        return {
          year: prev.year - 1,
          month: 12
        };
      }
      return {
        year: prev.year,
        month: prev.month - 1
      };
    });
  };
  const handleNextMonth = () => {
    setCurrentHijriMonth(prev => {
      if (prev.month === 12) {
        return {
          year: prev.year + 1,
          month: 1
        };
      }
      return {
        year: prev.year,
        month: prev.month + 1
      };
    });
  };
  const handleExportPDF = async () => {
    const calendarElement = document.getElementById('calendar-container');
    if (!calendarElement) return;
    try {
      const dataUrl = await toCanvas(calendarElement);
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgWidth = 297;
      const imgHeight = calendarElement.offsetHeight * imgWidth / calendarElement.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`schedule-${currentHijriMonth.year}-${currentHijriMonth.month}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };
  const monthName = calendarDays[0]?.hijriDate.monthName || '';
  return <div className="w-full min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <BookSidebar books={books} />
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={handlePrevMonth} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-2xl font-bold text-white">
                    {monthName} {currentHijriMonth.year} AH
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
                <Calendar days={calendarDays} schedule={schedule} books={books} />
              </div>
            </div>
          </div>
        </DndContext>
      </div>
    </div>;
}