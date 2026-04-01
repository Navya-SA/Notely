<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>404 – Not Found · Notely</title>
</svelte:head>

<div class="flex flex-col items-center justify-center min-h-[65vh] text-center gap-5 px-4">
  <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-400 mb-1">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="11" x2="12" y2="17"/>
      <line x1="9" y1="14" x2="15" y2="14"/>
    </svg>
  </div>
  <div>
    <h1 class="text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">404</h1>
    <p class="text-base font-medium text-gray-500 dark:text-gray-400 mt-2">Page not found</p>
    <p class="text-sm text-gray-400 dark:text-gray-600 mt-1">
      <code class="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md font-mono text-xs">{$page.url.pathname}</code>
      doesn't exist.
    </p>
  </div>
  <a href="/" class="btn-primary mt-2">← Back to Notes</a>
</div>
