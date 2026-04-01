<script lang="ts">
  import { toasts, removeToast } from '$lib/stores/toast';
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
  {#each $toasts as toast (toast.id)}
    <div
      class="pointer-events-auto flex items-start justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium
        shadow-lg shadow-black/10 dark:shadow-black/30
        border border-white/10
        animate-slide-up
        {toast.type === 'success' ? 'bg-emerald-600 text-white' : ''}
        {toast.type === 'error'   ? 'bg-red-600 text-white' : ''}
        {toast.type === 'info'    ? 'bg-gray-900 text-gray-100 dark:bg-gray-100 dark:text-gray-900' : ''}"
      role="alert"
      aria-live="polite"
    >
      <!-- Icon -->
      <span class="mt-px shrink-0 opacity-80">
        {#if toast.type === 'success'}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        {:else if toast.type === 'error'}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {:else}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {/if}
      </span>

      <span class="flex-1 leading-snug">{toast.message}</span>

      <div class="flex items-center gap-2 shrink-0 mt-px">
        {#if toast.undoFn}
          <button
            class="text-xs font-semibold underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity"
            on:click={() => { toast.undoFn?.(); removeToast(toast.id); }}
          >
            Undo
          </button>
        {/if}
        <button
          class="opacity-50 hover:opacity-100 transition-opacity leading-none"
          on:click={() => removeToast(toast.id)}
          aria-label="Dismiss"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  {/each}
</div>
