<script lang="ts">
  import { isOnline, syncStatus, pendingOps } from '$lib/stores/offline';
</script>

{#if !$isOnline}
  <div
    class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
    role="status"
    title="You are offline. Changes will sync when reconnected."
  >
    <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
    Offline {#if $pendingOps.length > 0}· {$pendingOps.length} pending{/if}
  </div>
{:else if $syncStatus === 'syncing'}
  <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" role="status">
    <span class="inline-block w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
    Syncing…
  </div>
{:else if $syncStatus === 'error'}
  <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" role="status">
    ⚠ Sync failed
  </div>
{/if}
