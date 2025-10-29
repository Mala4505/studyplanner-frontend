import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, BookOpen } from 'lucide-react';
import { StudySession } from '../types';

interface StudyBlockProps {
  session: StudySession;
}

export function StudyBlock({ session }: StudyBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
    data: { session }
  });


  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.5 : 1
  };


  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative cursor-move"
      {...attributes}
      {...listeners}
    >
      <div
        className="rounded-md p-2 text-xs border border-border hover:shadow-md transition-shadow"
        style={{
          backgroundColor: `${session.color}20`,
          borderLeftColor: session.color,
          borderLeftWidth: '3px'
        }}
      >
        <div className="flex items-start gap-1">
          <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate flex items-center gap-1">
              <BookOpen className="w-3 h-3 flex-shrink-0" />
              {session.bookTitle}
            </div>
            <div className="text-muted-foreground mt-1">
              Pages {session.pageRange.start}–{session.pageRange.end}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
