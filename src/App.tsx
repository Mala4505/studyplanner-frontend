// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Login } from './pages/Login';
// import { Schedule } from './pages/Schedule';
// import { Book } from './pages/Book';
// import { Admin } from './pages/Admin';
// import { getCurrentUser, isAdmin } from './utils/auth';


// function ProtectedRoute({
//   children,
//   adminOnly = false
// }: {
//   children: React.ReactNode;
//   adminOnly?: boolean;
// }) {
//   const user = getCurrentUser();
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//   if (adminOnly && !isAdmin(user)) {
//     return <Navigate to="/schedule" replace />;
//   }
//   return <>{children}</>;
// }
// export function App() {
//   return <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/schedule" element={<ProtectedRoute>
//               <Schedule />
//             </ProtectedRoute>} />
//         <Route path="/book" element={<ProtectedRoute>
//               <Book />
//             </ProtectedRoute>} />
//         <Route path="/admin" element={<ProtectedRoute adminOnly>
//               <Admin />
//             </ProtectedRoute>} />
//         <Route path="/" element={<Navigate to="/schedule" replace />} />
//       </Routes>
//     </BrowserRouter>;
// }
// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Login } from './pages/Login';
// import { Schedule } from './pages/Schedule';
// import { Book } from './pages/Book';
// import { Admin } from './pages/Admin';
// // import { Planner } from './pages/Planner'; // ✅ new planner page
// import { getCurrentUser, isAdmin } from './utils/auth';

// function ProtectedRoute({
//   children,
//   adminOnly = false
// }: {
//   children: React.ReactNode;
//   adminOnly?: boolean;
// }) {
//   const user = getCurrentUser();
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//   if (adminOnly && !isAdmin(user)) {
//     return <Navigate to="/schedule" replace />;
//   }
//   return <>{children}</>;
// }

// export function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
//         <Route path="/book" element={<ProtectedRoute><Book /></ProtectedRoute>} />
//         <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
//         {/* <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} /> */}
//         <Route path="/" element={<Navigate to="/planner" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Schedule } from './pages/Schedule';
import { Book } from './pages/Book';
import { Admin } from './pages/Admin';
import { getCurrentUser, isAdmin } from './utils/auth';

function ProtectedRoute({
  children,
  adminOnly = false
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !isAdmin(user)) {
    return <Navigate to="/schedule" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/book" element={<ProtectedRoute><Book /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/schedule" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
