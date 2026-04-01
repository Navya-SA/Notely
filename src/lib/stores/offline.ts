// src/lib/stores/offline.ts
import { writable, get } from 'svelte/store';
import { notesApi, type CreateNotePayload, type UpdateNotePayload } from '$lib/api/notes';

type OpType = 'create' | 'update' | 'delete';

interface PendingOp {
  id: string;
  type: OpType;
  noteId?: number;
  payload?: CreateNotePayload | UpdateNotePayload;
  timestamp: number;
}

const STORAGE_KEY = 'notes_pending_ops';

function loadPending(): PendingOp[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as PendingOp[];
  } catch {
    return [];
  }
}

function savePending(ops: PendingOp[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ops));
}

export const isOnline = writable(typeof navigator !== 'undefined' ? navigator.onLine : true);
export const syncStatus = writable<'idle' | 'syncing' | 'error'>('idle');
export const pendingOps = writable<PendingOp[]>(loadPending());

pendingOps.subscribe(savePending);

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => isOnline.set(true));
  window.addEventListener('offline', () => isOnline.set(false));

  isOnline.subscribe((online) => {
    if (online && get(pendingOps).length > 0) {
      syncPendingOps();
    }
  });
}

export function queueOp(op: Omit<PendingOp, 'id' | 'timestamp'>) {
  pendingOps.update((ops) => [
    ...ops,
    { ...op, id: crypto.randomUUID(), timestamp: Date.now() },
  ]);
}

export async function syncPendingOps() {
  const ops = get(pendingOps);
  if (ops.length === 0) return;

  syncStatus.set('syncing');
  const failed: PendingOp[] = [];

  for (const op of ops) {
    try {
      if (op.type === 'create' && op.payload) {
        await notesApi.create(op.payload as CreateNotePayload);
      } else if (op.type === 'update' && op.noteId && op.payload) {
        await notesApi.update(op.noteId, op.payload as UpdateNotePayload);
      } else if (op.type === 'delete' && op.noteId) {
        await notesApi.delete(op.noteId);
      }
    } catch {
      failed.push(op);
    }
  }

  pendingOps.set(failed);
  syncStatus.set(failed.length > 0 ? 'error' : 'idle');
}
