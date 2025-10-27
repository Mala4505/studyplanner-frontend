const BASE = 'http://localhost:8000';

export async function getUsers() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/users/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

export async function createUser(tr_number, role) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/users/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tr_number, role }),
  });
  return await res.json();
}

export async function deleteUser(tr_number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/users/${tr_number}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}
