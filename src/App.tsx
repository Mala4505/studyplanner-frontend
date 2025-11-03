import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Signup } from './pages/Signup';
import { Login } from './pages/Login';
import { Schedule } from './pages/Schedule';
import { Book } from './pages/Book';
import { Admin } from './pages/Admin';
import { getCurrentUser, isAdmin } from './utils/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProtectedRoute({
  children,
  adminOnly = false
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    console.log('User:', getCurrentUser());
  }, []);

  if (user === null) return null; // or a loading spinner


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && isAdmin(user)) {
    return <Navigate to="/schedule" replace />;
  }

  return <>{children}</>;
}


export function App() {
  return (
    <>
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="/book" element={<ProtectedRoute><Book /></ProtectedRoute>} />
<Route
  path="/admin"
  element={
    <AdminRoute>
      <Admin />
    </AdminRoute>
  }
/>            {/* <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} /> */}
            <Route path="/" element={<Navigate to="/schedule" replace />} />
            <Route path="*" element={<div>404: Page not found</div>} />
          </Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar aria-label="Notifications" />
    </>
  );
}
