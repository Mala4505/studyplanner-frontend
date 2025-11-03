// import React from 'react';
// import { useDraggable } from '@dnd-kit/core';
// import { Book, ScheduledBlock } from '../types';
// import { Calendar, Trash2 } from 'lucide-react';

// interface BookBlockProps {
//   book: Book;
//   scheduledBlock?: ScheduledBlock;
//   isDraggable?: boolean;
//   onSchedule?: () => void;
//   onDelete?: () => void;
// }

// export function BookBlock({
//   book,
//   scheduledBlock,
//   isDraggable = false,
//   onSchedule,
//   onDelete
// }: BookBlockProps) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform
//   } = useDraggable({
//     id: isDraggable ? `book-${book.id}` : `block-${scheduledBlock?.id}`,
//     data: {
//       book,
//       scheduledBlock
//     },
//     disabled: !isDraggable
//   });

//   const style = transform
//     ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
//     : undefined;

//   const pageRange = scheduledBlock
//     ? `${scheduledBlock.page_start}-${scheduledBlock.page_end}`
//     : `${book.pageFrom}-${book.pageTo}`;

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       {...listeners}
//       {...attributes}
//       className={`group relative bg-blue-600 text-white p-2 rounded text-xs ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
//         } hover:bg-blue-700 transition-colors`}
//     >
//       <div className="font-semibold truncate">{book.title}</div>
//       <div className="text-blue-200 text-[10px]">pp. {pageRange}</div>
//       {scheduledBlock && (
//         <div className="text-blue-200 text-[10px]">
//           Day {scheduledBlock.day_of_week}/{book.duration}
//         </div>
//       )}

//       {isDraggable && (
//         <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onSchedule?.();
//             }}
//             className="p-1 rounded-full text-white hover:text-blue-300 hover:bg-blue-800"
//             title="Schedule from date"
//           >
//             <Calendar size={14} />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onDelete?.();
//             }}
//             className="p-1 rounded-full text-white hover:text-red-300 hover:bg-red-800"
//             title="Remove all blocks"
//           >
//             <Trash2 size={14} />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


import { useDraggable } from '@dnd-kit/core';
import { Book, ScheduledBlock } from '../types';
import { Calendar, Trash2 } from 'lucide-react';

interface BookBlockProps {
  book: Book;
  scheduledBlock?: ScheduledBlock;
  isDraggable?: boolean;
  onSchedule?: () => void;
  onDelete?: () => void;
}

export function BookBlock({
  book,
  scheduledBlock,
  isDraggable = false,
  onSchedule,
  onDelete
}: BookBlockProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: isDraggable ? `book-${book.id}` : `block-${scheduledBlock?.id}`,
    data: { book, scheduledBlock },
    disabled: !isDraggable
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const pageRange = scheduledBlock
    ? `${scheduledBlock.page_start}-${scheduledBlock.page_end}`
    : `${book.pageFrom}-${book.pageTo}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-blue-600 text-white p-2 rounded text-xs hover:bg-blue-700 transition-colors"
    >
      {/* Drag handle only on title */}
      <div
        {...listeners}
        {...attributes}
        className={isDraggable ? 'cursor-grab active:cursor-grabbing touch-none' : 'cursor-default'}
      >
        <div className="font-semibold truncate">{book.title}</div>
      </div>

      <div className="text-blue-200 text-[10px]">pp. {pageRange}</div>
      {scheduledBlock && (
        <div className="text-blue-200 text-[10px]">
          Day {scheduledBlock.day_of_week}/{book.duration}
        </div>
      )}

      {/* Hover-reveal icon buttons */}
      {isDraggable && (
        <div className="absolute bottom-1 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-10">
          <button
            onClick={e => {
              e.stopPropagation();
              onSchedule?.();
            }}
            className="p-1.5 rounded-full text-white hover:text-blue-300 hover:bg-blue-800"
            title="Schedule from date"
          >
            <Calendar size={14} />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="p-1.5 rounded-full text-white hover:text-red-300 hover:bg-red-800"
            title="Remove all blocks"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
