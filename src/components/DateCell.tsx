import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { StudyBlock } from './StudyBlock';
import { ScheduledBlock, Tag, HijriDate } from '../types';

interface DateCellProps {
  date: Date;
  dateString: string;
  hijriDate?: HijriDate | null;
  sessions: ScheduledBlock[];
  isCurrentMonth: boolean;
  tags: Tag[];
  onRefresh?: () => void;
}

export function DateCell({
  date,
  dateString,
  hijriDate,
  sessions,
  isCurrentMonth,
  tags,
  onRefresh
}: DateCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dateString,
    data: { date: dateString }
  });

  const isToday = format(new Date(), 'yyyy-MM-dd') === dateString;

  return (
    <div
      id={`drop-${dateString}`}
      ref={setNodeRef}
      className={`bg-foreground relative z-10 min-h-[120px] border border-border rounded-lg p-2 transition-colors ${
        isOver ? 'bg-accent' : 'bg-card'
      } ${!isCurrentMonth ? 'opacity-50' : ''}`}
    >
      <div className="mb-2">
        <div
          className={`text-accent text-sm font-semibold ${
            isToday
              ? 'bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center'
              : 'text-primary'
          }`}
        >
          {format(date, 'd')}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {hijriDate ? `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year}` : ''}
        </div>
      </div>

      <div className="space-y-1">
        {sessions.map(session => (
          <StudyBlock
            key={session.id}
            session={session}
            tags={tags}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}
