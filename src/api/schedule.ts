export async function getBooks(): Promise<Book[]> {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:8000/books/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch books');
  return await res.json();
}

export async function getSchedule(): Promise<ScheduledBlock[]> {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:8000/schedule/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return await res.json();
}

export async function scheduleBook(bookId: string, hijriDate: string): Promise<void> {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:8000/schedule/book/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ book_id: bookId, hijri_date: hijriDate }),
  });
  if (!res.ok) throw new Error('Failed to schedule book');
}
