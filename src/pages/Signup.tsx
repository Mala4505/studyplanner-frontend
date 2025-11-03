import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader } from '../components/PageHeader';

export function Signup() {
  const navigate = useNavigate();
  const [tr_number, setTrNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidTrNumber = /^\d{5}$/.test(tr_number);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTrNumber) {
      toast.error('TR Number must be exactly 5 digits');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/users/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tr_number: tr_number,
          password,
          confirm_password: confirmPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg =
          errorData.tr_number?.[0] ||
          errorData.non_field_errors?.[0] ||
          'Signup failed. Please try again.';
        throw new Error(errorMsg);
      }

      toast.success('Signup successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 border border-gray-800">
        <div className='text-center'><PageHeader title="Create Account" /></div>

        {/* <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Create Account
        </h1> */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              TR Number
            </label>
            <input
              type="text"
              value={tr_number}
              onChange={e => setTrNumber(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
              placeholder="e.g. 12345"
              maxLength={5}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          <span>Already have an account? </span>
          <button
            onClick={() => navigate('/login')}
            className="text-blue-400 hover:underline"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
