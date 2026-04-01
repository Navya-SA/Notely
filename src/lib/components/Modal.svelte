<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let title: string;
  export let open = false;

  const dispatch = createEventDispatcher<{ close: void }>();

  let dialogEl: HTMLDivElement;

  $: if (open && dialogEl) {
    dialogEl.focus();
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') dispatch('close');
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    bind:this={dialogEl}
    class="fixed inset-0 z-50 flex items-center justify-center p-4
      bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in"
    on:click={handleBackdrop}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
  >
    <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/20
      border border-gray-200/80 dark:border-gray-700/60 animate-slide-up overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400
            hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
            transition-all duration-150"
          on:click={() => dispatch('close')}
          aria-label="Close modal"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="px-5 py-5">
        <slot />
      </div>
    </div>
  </div>
{/if}
