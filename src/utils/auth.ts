import { User } from '../types';
const STORAGE_KEY = 'studyplanner_user';
// Demo users
const DEMO_USERS: User[] = [{
  trNumber: 'TR001',
  password: 'student123',
  role: 'student'
}, {
  trNumber: 'TR002',
  password: 'student123',
  role: 'student'
}, {
  trNumber: 'ADMIN',
  password: 'admin123',
  role: 'admin'
}];
export function login(trNumber: string, password: string): User | null {
  const user = DEMO_USERS.find(u => u.trNumber === trNumber && u.password === password);
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}
export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
export function getCurrentUser() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || !role) return null;
  return { token, role };
}

export function isAdmin(user) {
  return user.role === 'admin';
}
