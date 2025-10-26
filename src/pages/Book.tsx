import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { addBook } from '../utils/storage';
import { Book as BookType } from '../types';
export function Book() {
  const [title, setTitle] = useState('');
  const [pageFrom, setPageFrom] = useState('');
  const [pageTo, setPageTo] = useState('');
  const [duration, setDuration] = useState('');
  const navigate = useNavigate();
  const totalPages = pageFrom && pageTo ? Math.max(0, parseInt(pageTo) - parseInt(pageFrom) + 1) : 0;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const book: BookType = {
      id: Date.now().toString(),
      title,
      pageFrom: parseInt(pageFrom),
      pageTo: parseInt(pageTo),
      duration: parseInt(duration),
      totalPages
    };
    addBook(book);
    navigate('/schedule');
  };
  return <div className="w-full min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-gray-900 rounded-lg p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">Add New Book</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Book Title
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600" placeholder="Enter book title" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Page From
                </label>
                <input type="number" value={pageFrom} onChange={e => setPageFrom(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600" placeholder="1" min="1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Page To
                </label>
                <input type="number" value={pageTo} onChange={e => setPageTo(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600" placeholder="100" min="1" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (days)
              </label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600" placeholder="7" min="1" required />
            </div>
            {totalPages > 0 && <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300">
                  Total Pages:{' '}
                  <span className="font-bold text-white">{totalPages}</span>
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  ~{Math.ceil(totalPages / parseInt(duration || '1'))} pages per
                  day
                </p>
              </div>}
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Add Book
            </button>
          </form>
        </div>
      </div>
    </div>;
}