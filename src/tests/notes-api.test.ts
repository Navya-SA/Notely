// src/tests/notes-api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notesApi, type Note } from '$lib/api/notes';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeFetchMock(body: unknown, opts: { status?: number; totalCount?: number } = {}) {
  const { status = 200, totalCount } = opts;
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (totalCount !== undefined) headers.set('X-Total-Count', String(totalCount));

  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(String(body)),
  });
}

const SAMPLE_NOTE: Note = {
  id: 1,
  title: 'Test Note',
  content: 'Hello world',
  createdAt: '2025-06-01T00:00:00.000Z',
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('notesApi.list', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('returns data array and total from X-Total-Count header', async () => {
    vi.stubGlobal('fetch', makeFetchMock([SAMPLE_NOTE], { totalCount: 42 }));

    const result = await notesApi.list({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('Test Note');
    expect(result.total).toBe(42);
  });

  it('falls back to data.length when header is absent', async () => {
    vi.stubGlobal('fetch', makeFetchMock([SAMPLE_NOTE, SAMPLE_NOTE]));

    const result = await notesApi.list();

    expect(result.total).toBe(2);
  });

  it('passes search param to the query string', async () => {
    const mockFetch = makeFetchMock([], { totalCount: 0 });
    vi.stubGlobal('fetch', mockFetch);

    await notesApi.list({ search: 'water' });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('search=water');
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', makeFetchMock('Not Found', { status: 404 }));

    await expect(notesApi.list()).rejects.toThrow('API error 404');
  });
});

describe('notesApi.create', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('POSTs JSON body and returns created note', async () => {
    const mockFetch = makeFetchMock(SAMPLE_NOTE);
    vi.stubGlobal('fetch', mockFetch);

    const result = await notesApi.create({ title: 'Test Note', content: 'Hello world' });

    expect(result.id).toBe(1);
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string) as { title: string };
    expect(body.title).toBe('Test Note');
  });
});

describe('notesApi.update', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('sends PUT with partial payload', async () => {
    const updated = { ...SAMPLE_NOTE, title: 'Updated' };
    const mockFetch = makeFetchMock(updated);
    vi.stubGlobal('fetch', mockFetch);

    const result = await notesApi.update(1, { title: 'Updated' });

    expect(result.title).toBe('Updated');
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('PUT');
  });
});

describe('notesApi.delete', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('sends DELETE and resolves without value', async () => {
    const mockFetch = makeFetchMock({});
    vi.stubGlobal('fetch', mockFetch);

    await expect(notesApi.delete(1)).resolves.toBeUndefined();

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/notes/1');
    expect(init.method).toBe('DELETE');
  });

  it('throws on server error', async () => {
    vi.stubGlobal('fetch', makeFetchMock('Server Error', { status: 500 }));

    await expect(notesApi.delete(99)).rejects.toThrow('API error 500');
  });
});
