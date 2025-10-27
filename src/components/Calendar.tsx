import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CalendarDay, ScheduledBlock, Book } from '../types';
import { formatGregorianDate, dateToString } from '../utils/hijriCalendar';
import { BookBlock } from './BookBlock';

interface CalendarProps {
  days: CalendarDay[];
  schedule: ScheduledBlock[];
  books: Book[];
}

const DAY_HEADERS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function Calendar({ days, schedule, books }: CalendarProps) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAY_HEADERS.map(day => (
          <div key={day} className="text-center font-semibold text-white py-2 bg-gray-800 rounded-lg">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dateStr = dateToString(day.gregorianDate);
          const blocks = schedule.filter(b => b.date === dateStr);
          return <CalendarCell key={index} day={day} blocks={blocks} books={books} />;
        })}
      </div>
    </div>
  );
}

interface CalendarCellProps {
  day: CalendarDay;
  blocks: ScheduledBlock[];
  books: Book[];
}

function CalendarCell({ day, blocks, books }: CalendarCellProps) {
  const dateStr = dateToString(day.gregorianDate);
  const isDisabled = day.isPast;

  const { setNodeRef, isOver } = useDroppable({
    id: `date-${dateStr}`,
    data: { date: dateStr },
    disabled: isDisabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-32 rounded-lg p-3 border transition-colors ${
        isDisabled
          ? 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed'
          : isOver
          ? 'bg-gray-800 border-blue-500'
          : 'bg-gray-800 border-gray-700'
      } ${!day.isCurrentMonth ? 'opacity-60' : ''}`}
    >
      <div className="mb-2">
        <div className={`text-2xl font-bold ${day.isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
          {day.hijriDate.day}
        </div>
        <div className="text-xs text-gray-400">{formatGregorianDate(day.gregorianDate)}</div>
      </div>
      <div className="space-y-1">
        {blocks.map(block => {
          const book = books.find(b => b.id === block.bookId);
          if (!book) return null;
          return <BookBlock key={block.id} book={book} scheduledBlock={block} />;
        })}
      </div>
    </div>
  );
}
