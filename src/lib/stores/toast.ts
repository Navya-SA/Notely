// src/lib/stores/toast.ts
import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  undoFn?: () => void;
  duration: number;
}

export const toasts = writable<Toast[]>([]);

export function addToast(toast: Omit<Toast, 'id'>) {
  const id = crypto.randomUUID();
  toasts.update((t) => [...t, { ...toast, id }]);
  setTimeout(() => removeToast(id), toast.duration);
  return id;
}

export function removeToast(id: string) {
  toasts.update((t) => t.filter((x) => x.id !== id));
}
