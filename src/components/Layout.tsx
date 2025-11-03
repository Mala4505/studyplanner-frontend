import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import { Navbar } from './Navbar';

export function Layout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="p-0">
        <Outlet />
      </main>
    </div>
  );
}
