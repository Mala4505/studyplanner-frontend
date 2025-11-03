import { useState, useEffect } from 'react';
import { DateCell } from './DateCell';
import { ScheduledBlock, CalendarDay, Tag } from '../types';

interface CalendarProps {
  days: CalendarDay[];
  schedule: ScheduledBlock[];
  tags: Tag[];
  onRefresh: () => void;
  currentMonth: { year: number; month: number };
  setCurrentMonth: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>;
  hijriMonthsInView: (string | undefined)[];
}

export function Calendar({
  days,
  schedule,
  tags,
  onRefresh
}: CalendarProps) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [studySessions, setStudySessions] = useState<ScheduledBlock[]>([]);

  // ✅ Hydrate tags when schedule or tags update
  useEffect(() => {
    const tagMap = new Map(tags.map(t => [t.id, t]));

    const hydrated = schedule.map(block => {
      const tagId =
        typeof block.tag === 'number' ? block.tag :
          block.tag?.id ?? block.bookTag?.id;

      const fullTag = tagMap.get(tagId ?? -1); // -1 ensures no match if undefined

      return {
        ...block,
        tag: fullTag ?? block.tag ?? block.bookTag
      };
    });

    setStudySessions(hydrated);
    console.log('Calendar received updated sessions:', hydrated);
  }, [schedule, tags]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-muted">
      {/* <div className="mb-6">
        <h1 className="text-3xl font-semibold flex items-center gap-3 text-white">
          Study Calendar
        </h1>
        <p className="text-muted-foreground mt-1">
          {days[0]?.hijriDate?.monthName && days[0]?.hijriDate?.year
            ? `${days[0].hijriDate.monthName} ${days[0].hijriDate.year} AH`
            : 'Hijri date unavailable'}
        </p>
      </div> */}

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center font-semibold text-sm py-2 text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 h-full">
        {days.map(day => {
          const dateStr = day.gregorianDate.toISOString().split('T')[0];
          const sessions = studySessions.filter(s => s.date_gregorian === dateStr);

          return (
            <DateCell
              key={dateStr}
              date={day.gregorianDate}
              dateString={dateStr}
              hijriDate={day.hijriDate}
              sessions={sessions}
              tags={tags}
              isCurrentMonth={day.isCurrentMonth}
              onRefresh={onRefresh}
            />
          );
        })}
      </div>
    </div>
  );
}
