import { Book, ScheduledBlock, Tag, HijriDate } from '../types';
import { tagColorMap } from '../constants';

export const BASE = 'http://localhost:8000';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function normalizeBlockId(id: string): string {
  return id.replace(/^session-/, '');
}


export async function getBooks(): Promise<Book[]> {
  const res = await fetch(`${BASE}/api/books/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch books');
  return await res.json();
}

export async function getSchedule(): Promise<ScheduledBlock[]> {
  const res = await fetch(`${BASE}/schedule/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch schedule');

  const data = await res.json();

  return data.map((block: any): ScheduledBlock => {
    const tag = block.tag || block.bookTag;
    const color = tagColorMap[tag?.name] || '#3B82F6';
    console.log('Fetched block:', block, 'with resolved color:', color);

    return {
      id: block.id.toString(),
      book: block.book,
      book_title: block.book_title,
      date_gregorian: block.date_gregorian,
      date_hijri: block.date_hijri,
      day_of_week: block.day_of_week,
      page_start: block.page_start,
      page_end: block.page_end,
      tag: block.tag || undefined,
      bookTag: block.bookTag || undefined,
      color,
    };
  });
}

export async function scheduleBook(bookId: number, date: string) {
  const res = await fetch(`${BASE}/schedule/book/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      book_id: bookId,
      start_date: date,
    }),
  });
  if (!res.ok) throw new Error('Failed to schedule');
  return await res.json();
}

export async function updateBlock(id: string, newDate: string, tagId?: number): Promise<void> {
  const body: any = { date_gregorian: newDate };
  if (tagId !== undefined) body.tag_id = tagId;

  const res = await fetch(`${BASE}/schedule/block/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  console.log('Updating block with:', body);
  if (!res.ok) throw new Error('Failed to update block');
}

export async function getTags(): Promise<Tag[]> {
  const res = await fetch(`${BASE}/api/tags/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch tags');
  return await res.json();
}

export async function updateBlockTag(blockId: string, tagId: number): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/schedule/${blockId}/tag/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ tag_id: tagId }),
  });
  if (!res.ok) throw new Error('Failed to update tag');
  return await res.json();
}

export async function createBook(data: { title: string; tag_id?: number }) {
  const res = await fetch(`${BASE}/api/books/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateBook(id: number, data: { title?: string; tag_id?: number }) {
  const res = await fetch(`${BASE}/api/books/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  console.log('Updating book with:', data);
  if (!res.ok) {
    const error = await res.json();
    console.error('Update failed:', error);
    throw new Error('Failed to update book');
  }
  return await res.json();
}
