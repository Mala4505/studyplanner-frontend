import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: {
    trNumber: string;
    password: string;
    role: 'admin' | 'student';
  }) => void;
}

export function AddUserModal({ isOpen, onClose, onAdd }: AddUserModalProps) {
  const [trNumber, setTrNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'student'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trNumber.trim()) {
      toast.error('TR Number is required');
      return;
    }
    if (!password.trim()) {
      toast.error('Password is required');
      return;
    }

    onAdd({ trNumber, password, role });

    setTrNumber('');
    setPassword('');
    setRole('student');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              TR Number
            </label>
            <input
              type="text"
              value={trNumber}
              onChange={(e) => setTrNumber(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Enter TR number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'student')}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
