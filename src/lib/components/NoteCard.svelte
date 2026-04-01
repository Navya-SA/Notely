<script lang="ts">
  import type { Note } from '$lib/api/notes';

  export let note: Note;
  export let onEdit: (note: Note) => void;
  export let onDelete: (note: Note) => void;
  export let onTogglePin: (note: Note) => void;
</script>

<article
  class="group relative flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-200
    bg-white dark:bg-gray-900
    border-gray-200/80 dark:border-gray-700/60
    hover:border-gray-300 dark:hover:border-gray-600
    hover:shadow-xl hover:-translate-y-1.5
    hover:border-indigo-300 dark:hover:border-indigo-600
    {note.pinned ? 'ring-1 ring-amber-300/60 dark:ring-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20' : ''}
    animate-fade-in"
  aria-label="Note: {note.title}"
>
  <!-- Pinned badge -->
  {#if note.pinned}
    <span class="absolute top-3.5 right-3.5 flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 select-none">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 2l-1.5 1.5L16 5l-4 4H6l-2 2 5 5-4 4h2l4-4 5 5 2-2v-6l4-4 1.5 1.5L22 8l-6-6z"/></svg>
      Pinned
    </span>
  {/if}

  <div class="flex-1 min-w-0">
    <h2 class="font-semibold text-[15px] leading-snug text-gray-900 dark:text-gray-100 truncate {note.pinned ? 'pr-16' : 'pr-2'}">
      {note.title}
    </h2>
    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-3 whitespace-pre-wrap leading-relaxed">
      {note.content}
    </p>
  </div>

  <div class="flex items-center justify-between mt-auto pt-1 border-t border-gray-100 dark:border-gray-800">
    <time class="text-[11px] text-gray-400 dark:text-gray-600" datetime={note.createdAt}>
      {new Date(note.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}
    </time>

    <div class="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-150 translate-y-0.5 group-hover:translate-y-0">
      <!-- Pin -->
      <button
        class="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150
          text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
        title={note.pinned ? 'Unpin note' : 'Pin note'}
        on:click={() => onTogglePin(note)}
        aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          {#if note.pinned}
            <line x1="2" y1="2" x2="22" y2="22"/><path d="M16.5 16.5 8 8M10 14H6l-2 2 5 5 2-2v-4"/><path d="M16 2l-1.5 1.5L16 5l-4 4 1.5 1.5"/>
          {:else}
            <path d="M12 2l-1.5 1.5L12 5l-4 4H2l-1 1 5 5-4 4h2l4-4 5 5 1-1v-6l4-4 1.5 1.5L22 8Z"/>
          {/if}
        </svg>
      </button>

      <!-- Edit -->
      <button
        class="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150
          text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
        on:click={() => onEdit(note)}
        aria-label="Edit note"
        title="Edit note"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/>
        </svg>
      </button>

      <!-- Delete -->
      <button
        class="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150
          text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        on:click={() => onDelete(note)}
        aria-label="Delete note"
        title="Delete note"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  </div>
</article>
