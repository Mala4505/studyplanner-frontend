import { Navigate } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../utils/auth';

export function AdminRoute({ children }: { children: JSX.Element }) {
  const user = getCurrentUser();

  if (!user || !isAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
