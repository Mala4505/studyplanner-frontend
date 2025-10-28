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
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return await res.json();
}

export async function scheduleBook(bookId: string, date: string) {
  const token = localStorage.getItem('token');
  return fetch('http://localhost:8000/schedule/book/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      book_id: bookId,
      start_date: date
    })
  }).then(res => {
    if (!res.ok) throw new Error('Failed to schedule');
    return res.json();
  });
}


export async function updateBlock(id: string, newDate: string): Promise<void> {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:8000/schedule/block/${id}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date_gregorian: newDate }),
  });
  if (!res.ok) throw new Error('Failed to update block');
}
