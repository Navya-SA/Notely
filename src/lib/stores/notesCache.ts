// src/lib/stores/notesCache.ts
// Persists the last-fetched notes list to localStorage so the app
// can display stale data when the user is offline.

import type { Note } from '$lib/api/notes';

const CACHE_KEY = 'notes_cache';
const META_KEY = 'notes_cache_meta';

interface CacheMeta {
  fetchedAt: string; // ISO timestamp
  total: number;
}

export function writeCachedNotes(notes: Note[], total: number): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(notes));
    localStorage.setItem(META_KEY, JSON.stringify({ fetchedAt: new Date().toISOString(), total }));
  } catch {
    // Storage quota exceeded – silently ignore
  }
}

export function readCachedNotes(): { notes: Note[]; meta: CacheMeta } | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const metaRaw = localStorage.getItem(META_KEY);
    if (!raw || !metaRaw) return null;
    return {
      notes: JSON.parse(raw) as Note[],
      meta: JSON.parse(metaRaw) as CacheMeta,
    };
  } catch {
    return null;
  }
}

export function clearNotesCache(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(META_KEY);
}
