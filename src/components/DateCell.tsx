import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { StudyBlock } from './StudyBlock';
import { StudySession } from '../types';
import { gregorianToHijri } from '../utils/hijriConverter';

interface DateCellProps {
  date: Date;
  dateString: string;
  sessions: StudySession[];
  isCurrentMonth: boolean;
}

export function DateCell({
  date,
  dateString,
  sessions,
  isCurrentMonth
}: DateCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dateString,
    data: { date: dateString } // ✅ Added this line to fix drag-and-drop
  });

  const hijriDate = gregorianToHijri(date);
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateString;

  return (
    <div
    id={`drop-${dateString}`}
      ref={setNodeRef}
      className={`relative z-10 min-h-[120px] border border-border rounded-lg p-2 transition-colors ${
        isOver ? 'bg-accent' : 'bg-card'
      } ${!isCurrentMonth ? 'opacity-50' : ''}`}
    >
      <div className="mb-2">
        <div
          className={`text-sm font-semibold ${
            isToday
              ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center'
              : 'text-primary'
          }`}
        >
          {format(date, 'd')}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{hijriDate}</div>
      </div>
      <div className="space-y-1">
        {sessions.map(session => (
          <StudyBlock key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
