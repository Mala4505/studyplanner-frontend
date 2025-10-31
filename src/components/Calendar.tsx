// import React, { useMemo } from 'react';
// import { CalendarDays } from 'lucide-react';
// import {
//   format,
//   startOfMonth,
//   endOfMonth,
//   eachDayOfInterval,
//   startOfWeek,
//   endOfWeek
// } from 'date-fns';
import { DateCell } from './DateCell';
import { StudySession, CalendarDay, Book } from '../types'; // ✅ moved from App to types

interface CalendarProps {
  days: CalendarDay[];
  schedule: StudySession[];
  books: Book[];
}



export function Calendar({ days, schedule, books }: CalendarProps) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {/* <div className="mb-6">
        <h1 className="text-3xl font-semibold flex items-center gap-3 text-white">
          Study Calendar
        </h1>
        <p className="text-muted-foreground mt-1">
          {days[0]?.hijriDate.monthName} {days[0]?.hijriDate.year} AH
        </p>
      </div> */}

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-sm py-2 text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 h-full">
        {days.map(day => {
          const dateString = day.gregorianDate.toISOString().split('T')[0];
          const sessions = schedule.filter(s => s.date === dateString);
          return (
            <DateCell
              key={dateString}
              date={day.gregorianDate}
              dateString={dateString}
              sessions={sessions}
              isCurrentMonth={day.isCurrentMonth}
            />
          );
        })}
      </div>
    </div>
  );
}
