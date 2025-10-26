import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Trash2 } from 'lucide-react';
interface User {
  trNumber: string;
  role: 'student' | 'admin';
}
export function Admin() {
  const [users, setUsers] = useState<User[]>([{
    trNumber: 'TR001',
    role: 'student'
  }, {
    trNumber: 'TR002',
    role: 'student'
  }, {
    trNumber: 'ADMIN',
    role: 'admin'
  }]);
  const [newTrNumber, setNewTrNumber] = useState('');
  const [newRole, setNewRole] = useState<'student' | 'admin'>('student');
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.trNumber === newTrNumber)) {
      alert('TR number already exists');
      return;
    }
    setUsers([...users, {
      trNumber: newTrNumber,
      role: newRole
    }]);
    setNewTrNumber('');
  };
  const handleDeleteUser = (trNumber: string) => {
    if (confirm(`Delete user ${trNumber}?`)) {
      setUsers(users.filter(u => u.trNumber !== trNumber));
    }
  };
  return <div className="w-full min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            User Management
          </h2>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add New User
            </h3>
            <form onSubmit={handleAddUser} className="flex gap-4">
              <input type="text" value={newTrNumber} onChange={e => setNewTrNumber(e.target.value)} className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600" placeholder="TR Number" required />
              <select value={newRole} onChange={e => setNewRole(e.target.value as 'student' | 'admin')} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600">
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Add User
              </button>
            </form>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    TR Number
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(user => <tr key={user.trNumber} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 text-white">{user.trNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteUser(user.trNumber)} className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>;
}