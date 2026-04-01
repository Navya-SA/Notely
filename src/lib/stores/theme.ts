// src/lib/stores/theme.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const stored = browser ? localStorage.getItem('theme') : null;
const prefersDark = browser ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
const initial = stored ? stored === 'dark' : prefersDark;

export const darkMode = writable<boolean>(initial);

darkMode.subscribe((dark) => {
  if (!browser) return;
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
});
