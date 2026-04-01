<script lang="ts">
  import '../app.css';
  import { darkMode } from '$lib/stores/theme';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import SyncBadge from '$lib/components/SyncBadge.svelte';
  import { page } from '$app/stores';

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('shortcut:new-note'));
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
  <!-- Navbar -->
  <header class="sticky top-0 z-40 bg-white/75 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 transition-colors duration-200">
    <div class="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
      <a
        href="/"
        class="flex items-center gap-2 font-bold text-[17px] text-gray-900 dark:text-gray-100 tracking-tight hover:opacity-75 transition-opacity duration-150"
        aria-current={$page.url.pathname === '/' ? 'page' : undefined}
      >
        <span class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="13" y2="17"/>
          </svg>
        </span>
        Notely
      </a>

      <div class="flex items-center gap-2">
        <SyncBadge />

        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 text-sm"
          on:click={() => darkMode.update((d) => !d)}
          aria-label="Toggle dark mode"
          title={$darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {#if $darkMode}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </header>

  <!-- Page content -->
  <main class="flex-1 max-w-5xl mx-auto w-full px-5 py-8">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="border-t border-gray-200/60 dark:border-gray-800/60 py-5 text-center text-xs text-gray-400 dark:text-gray-600">
    <a
      href="https://github.com/YOUR_USERNAME/notes-app"
      target="_blank"
      rel="noopener noreferrer"
      class="hover:text-indigo-500 transition-colors duration-150"
    >
      GitHub
    </a>
    <span class="mx-2 opacity-40">·</span>
    <span>Built with SvelteKit + TailwindCSS</span>
  </footer>
</div>

<ToastContainer />
