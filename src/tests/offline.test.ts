// src/tests/offline.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { pendingOps, queueOp, syncPendingOps } from '$lib/stores/offline';
import { notesApi } from '$lib/api/notes';

describe('offline queue', () => {
  beforeEach(() => {
    pendingOps.set([]);
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('queueOp appends a pending op with a unique id', () => {
    queueOp({ type: 'create', payload: { title: 'A', content: 'B' } });
    queueOp({ type: 'delete', noteId: 5 });

    const ops = get(pendingOps);
    expect(ops).toHaveLength(2);
    expect(ops[0].type).toBe('create');
    expect(ops[1].type).toBe('delete');
    expect(ops[0].id).not.toBe(ops[1].id);
  });

  it('syncPendingOps calls the correct API methods and clears queue on success', async () => {
    const createSpy = vi.spyOn(notesApi, 'create').mockResolvedValue({
      id: 99, title: 'A', content: 'B', createdAt: new Date().toISOString(),
    });
    const deleteSpy = vi.spyOn(notesApi, 'delete').mockResolvedValue(undefined);

    queueOp({ type: 'create', payload: { title: 'A', content: 'B' } });
    queueOp({ type: 'delete', noteId: 7 });

    await syncPendingOps();

    expect(createSpy).toHaveBeenCalledOnce();
    expect(deleteSpy).toHaveBeenCalledWith(7);
    expect(get(pendingOps)).toHaveLength(0);
  });

  it('keeps failed ops in the queue', async () => {
    vi.spyOn(notesApi, 'create').mockRejectedValue(new Error('Network error'));

    queueOp({ type: 'create', payload: { title: 'Fail', content: 'X' } });

    await syncPendingOps();

    expect(get(pendingOps)).toHaveLength(1);
  });

  it('persists pending ops to localStorage', () => {
    queueOp({ type: 'delete', noteId: 3 });
    const stored = JSON.parse(localStorage.getItem('notes_pending_ops') ?? '[]') as unknown[];
    expect(stored).toHaveLength(1);
  });
});
