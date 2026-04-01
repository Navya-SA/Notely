// src/tests/toast.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { toasts, addToast, removeToast } from '$lib/stores/toast';

describe('toast store', () => {
  beforeEach(() => {
    // Clear store between tests
    toasts.set([]);
    vi.useFakeTimers();
  });

  it('addToast adds a toast with a unique id', () => {
    addToast({ message: 'Hello', type: 'success', duration: 3000 });
    const state = get(toasts);
    expect(state).toHaveLength(1);
    expect(state[0].message).toBe('Hello');
    expect(state[0].type).toBe('success');
    expect(typeof state[0].id).toBe('string');
  });

  it('addToast auto-removes after duration', () => {
    addToast({ message: 'Temporary', type: 'info', duration: 1000 });
    expect(get(toasts)).toHaveLength(1);

    vi.advanceTimersByTime(1001);
    expect(get(toasts)).toHaveLength(0);
  });

  it('removeToast removes the correct toast by id', () => {
    addToast({ message: 'A', type: 'success', duration: 5000 });
    addToast({ message: 'B', type: 'error', duration: 5000 });
    const [a] = get(toasts);

    removeToast(a.id);
    const remaining = get(toasts);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe('B');
  });

  it('supports an optional undoFn', () => {
    const undo = vi.fn();
    addToast({ message: 'Deleted', type: 'info', duration: 5000, undoFn: undo });

    const [toast] = get(toasts);
    expect(typeof toast.undoFn).toBe('function');
    toast.undoFn?.();
    expect(undo).toHaveBeenCalledOnce();
  });
});
