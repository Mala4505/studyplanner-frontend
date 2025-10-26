import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
export function Login() {
  const [trNumber, setTrNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(trNumber, password);
    if (user) {
      navigate('/schedule');
    } else {
      setError('Invalid TR number or password');
    }
  };
  return <div className="w-full min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Study Planner
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              TR Number
            </label>
            <input type="text" value={trNumber} onChange={e => setTrNumber(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600" placeholder="Enter your TR number" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600" placeholder="Enter your password" required />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Login
          </button>
        </form>
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Demo accounts:</p>
          <p>Student: TR001 / student123</p>
          <p>Admin: ADMIN / admin123</p>
        </div>
      </div>
    </div>;
}