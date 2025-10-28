// // import React, { useState } from 'react';
// // import { Search } from 'lucide-react';
// // import { Book } from '../types';
// // import { BookBlock } from './BookBlock';
// // interface BookSidebarProps {
// //   books: Book[];
// // }
// // export function BookSidebar({
// //   books
// // }: BookSidebarProps) {
// //   const [search, setSearch] = useState('');
// //   const filteredBooks = books.filter(book => book.title.toLowerCase().includes(search.toLowerCase()));
// //   return <div className="w-80 bg-gray-900 border-r border-gray-800 p-4 flex flex-col h-full">
// //       <h2 className="text-lg font-bold text-white mb-4">My Books</h2>
// //       <div className="relative mb-4">
// //         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
// //         <input type="text" placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600" />
// //       </div>
// //       <div className="flex-1 overflow-y-auto space-y-3">
// //         {filteredBooks.length === 0 ? <p className="text-gray-500 text-sm text-center mt-8">
// //             No books found
// //           </p> : filteredBooks.map(book => <div key={book.id} className="bg-gray-800 rounded-lg p-3">
// //               <BookBlock book={book} isDraggable={true} />
// //               <div className="mt-2 text-xs text-gray-400">
// //                 <div>
// //                   Pages: {book.pageFrom} - {book.pageTo} ({book.totalPages}{' '}
// //                   pages)
// //                 </div>
// //                 <div>Duration: {book.duration} days</div>
// //               </div>
// //             </div>)}
// //       </div>
// //     </div>;
// // }

// import React, { useState } from 'react';
// import { Search } from 'lucide-react';
// import { Book } from '../types';
// import { BookBlock } from './BookBlock';

// interface BookSidebarProps {
//   books: Book[];
// }

// export function BookSidebar({ books }: BookSidebarProps) {
//   const [search, setSearch] = useState('');
//   const filteredBooks = books.filter(book =>
//     book.title.toLowerCase().includes(search.toLowerCase())
//   );

//   const handleDragStart = (e: React.DragEvent, book: Book) => {
//     e.dataTransfer.setData('application/json', JSON.stringify(book));
//   };

//   return (
//     <div className="w-80 bg-gray-900 border-r border-gray-800 p-4 flex flex-col h-full">
//       <h2 className="text-lg font-bold text-white mb-4">My Books</h2>
//       <div className="relative mb-4">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
//         <input
//           type="text"
//           placeholder="Search books..."
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
//         />
//       </div>
//       <div className="flex-1 overflow-y-auto space-y-3">
//         {filteredBooks.length === 0 ? (
//           <p className="text-gray-500 text-sm text-center mt-8">No books found</p>
//         ) : (
//           filteredBooks.map(book => (
//             <div
//               key={book.id}
//               className="bg-gray-800 rounded-lg p-3 cursor-move hover:bg-gray-700 transition-colors"
//               draggable
//               onDragStart={e => handleDragStart(e, book)}
//             >
//               <BookBlock book={book} isDraggable={true} />
//               <div className="mt-2 text-xs text-gray-400">
//                 <div>
//                   Pages: {book.pageFrom} - {book.pageTo} ({book.totalPages} pages)
//                 </div>
//                 <div>Duration: {book.duration} days</div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Book } from '../types';
import { BookBlock } from './BookBlock';
import { useDraggable } from '@dnd-kit/core';

interface BookSidebarProps {
  books: Book[];
}

function DraggableBook({ book }: { book: Book }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: book.id,
    data: { book },
  });

  return (
    // <div
    //   ref={setNodeRef}
    //   {...listeners}
    //   {...attributes}
    //   className="bg-gray-800 rounded-lg p-3 cursor-move select-none hover:bg-gray-700 transition-colors"
    // >
    //   <BookBlock book={book} isDraggable={true} />
    //   <div className="mt-2 text-xs text-gray-400">
    //     <div>
    //       Pages: {book.pageFrom} - {book.pageTo} ({book.totalPages} pages)
    //     </div>
    //     <div>Duration: {book.duration} days</div>
    //   </div>
    // </div>
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="bg-gray-800 rounded-lg p-3 cursor-move select-none hover:bg-gray-700 transition-colors z-50"
    >
      <div className="pointer-events-none">
        <BookBlock book={book} isDraggable={true} />
        <div className="mt-2 text-xs text-gray-400">
          <div>Pages: {book.pageFrom} - {book.pageTo} ({book.totalPages} pages)</div>
          <div>Duration: {book.duration} days</div>
        </div>
      </div>
    </div>

  );
}

export function BookSidebar({ books }: BookSidebarProps) {
  const [search, setSearch] = useState('');
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 p-4 flex flex-col h-full">
      <h2 className="text-lg font-bold text-white mb-4">My Books</h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredBooks.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">No books found</p>
        ) : (
          filteredBooks.map(book => <DraggableBook key={book.id} book={book} />)
        )}
      </div>
    </div>
  );
}
