import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Book, ScheduledBlock } from '../types';
interface BookBlockProps {
  book: Book;
  scheduledBlock?: ScheduledBlock;
  isDraggable?: boolean;
}
export function BookBlock({
  book,
  scheduledBlock,
  isDraggable = false
}: BookBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform
  } = useDraggable({
    id: isDraggable ? `book-${book.id}` : `block-${scheduledBlock?.id}`,
    data: {
      book,
      scheduledBlock
    },
    disabled: !isDraggable
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
  } : undefined;
  const pageRange = scheduledBlock ? `${scheduledBlock.pageFrom}-${scheduledBlock.pageTo}` : `${book.pageFrom}-${book.pageTo}`;
  return <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`bg-blue-600 text-white p-2 rounded text-xs ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} hover:bg-blue-700 transition-colors`}>
      <div className="font-semibold truncate">{book.title}</div>
      <div className="text-blue-200 text-[10px]">pp. {pageRange}</div>
      {scheduledBlock && <div className="text-blue-200 text-[10px]">
          Day {scheduledBlock.dayNumber}/{book.duration}
        </div>}
    </div>;
}