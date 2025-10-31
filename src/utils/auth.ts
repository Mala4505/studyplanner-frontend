import { User } from '../types';

const TOKEN_KEY = 'token';

interface JwtPayload {
  username: string;
  role: string;
  exp: number;
  [key: string]: any;
}

// ✅ Decode JWT payload
function decodeToken(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1];
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
}
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}
export function getCurrentUser(): User | null {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || !role) return null;

  // You can decode token for username if needed
  const payload = JSON.parse(atob(token.split('.')[1]));
  return {
    trNumber: payload.tr_number,
    role: role as 'student' | 'admin'
  };
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}