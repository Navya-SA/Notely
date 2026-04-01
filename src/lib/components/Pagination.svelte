<script lang="ts">
  export let page: number;
  export let total: number;
  export let limit: number;
  export let onPage: (p: number) => void;

  $: totalPages = Math.max(1, Math.ceil(total / limit));

  function pages(): number[] {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  }
</script>

{#if totalPages > 1}
  <nav class="flex items-center justify-center gap-1 pt-8 pb-2" aria-label="Pagination">
    <button
      class="btn-secondary !px-3 !py-1.5 text-xs gap-1 disabled:opacity-40"
      disabled={page <= 1}
      on:click={() => onPage(page - 1)}
      aria-label="Previous page"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      Prev
    </button>

    {#if pages()[0] > 1}
      <button class="btn-secondary !px-3 !py-1.5 text-xs min-w-[32px]" on:click={() => onPage(1)}>1</button>
      {#if pages()[0] > 2}
        <span class="px-1 text-xs text-gray-400 dark:text-gray-600 select-none">…</span>
      {/if}
    {/if}

    {#each pages() as p (p)}
      <button
        class="!px-3 !py-1.5 text-xs min-w-[32px] rounded-lg transition-all duration-150
          {p === page
            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none font-semibold'
            : 'btn-secondary'}"
        on:click={() => onPage(p)}
        aria-current={p === page ? 'page' : undefined}
      >
        {p}
      </button>
    {/each}

    {#if pages()[pages().length - 1] < totalPages}
      {#if pages()[pages().length - 1] < totalPages - 1}
        <span class="px-1 text-xs text-gray-400 dark:text-gray-600 select-none">…</span>
      {/if}
      <button class="btn-secondary !px-3 !py-1.5 text-xs min-w-[32px]" on:click={() => onPage(totalPages)}>
        {totalPages}
      </button>
    {/if}

    <button
      class="btn-secondary !px-3 !py-1.5 text-xs gap-1 disabled:opacity-40"
      disabled={page >= totalPages}
      on:click={() => onPage(page + 1)}
      aria-label="Next page"
    >
      Next
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </nav>
{/if}
