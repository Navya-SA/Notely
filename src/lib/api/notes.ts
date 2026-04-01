// src/lib/api/notes.ts
// Reusable API wrapper for the Notes resource

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  pinned?: boolean;
}

export interface PaginatedNotes {
  data: Note[];
  total: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  pinned?: boolean;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  pinned?: boolean;
}

export interface FetchNotesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'id';
  order?: 'asc' | 'desc';
}

// Replace with your mockapi.io base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://69cd4760ddc3cabb7bd270bd.mockapi.io';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const notesApi = {
  /** Fetch paginated/filtered notes. Returns data array + total count from header. */
  async list(params: FetchNotesParams = {}): Promise<PaginatedNotes> {
    const { page = 1, limit = 20, search, sortBy = 'id', order = 'desc' } = params;
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      order,
    });
    if (search) qs.set('search', search);

    const res = await fetch(`${BASE_URL}/notes?${qs}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const data = (await res.json()) as Note[];
    // mockapi returns X-Total-Count header for pagination
    const total = Number(res.headers.get('X-Total-Count') ?? data.length);
    return { data, total };
  },

  async get(id: number): Promise<Note> {
    return request<Note>(`/notes/${id}`);
  },

  async create(payload: CreateNotePayload): Promise<Note> {
    return request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: number, payload: UpdateNotePayload): Promise<Note> {
    return request<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<void> {
    await request<Note>(`/notes/${id}`, { method: 'DELETE' });
  },
};
