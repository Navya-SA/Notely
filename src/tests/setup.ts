// src/tests/setup.ts
// Global test setup — runs before every test file

// Provide a minimal localStorage shim for stores that use it
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    },
  });
}

// Stub crypto.randomUUID for Node environments that lack it
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.randomUUID) {
  let counter = 0;
  Object.defineProperty(globalThis, 'crypto', {
    value: { randomUUID: () => `test-uuid-${++counter}` },
  });
}
