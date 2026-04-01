<script lang="ts">
  import { onMount } from 'svelte';
  import { notesApi, type Note, type CreateNotePayload } from '$lib/api/notes';
  import { isOnline, queueOp } from '$lib/stores/offline';
  import { addToast } from '$lib/stores/toast';
  import { writeCachedNotes, readCachedNotes } from '$lib/stores/notesCache';
  import NoteCard from '$lib/components/NoteCard.svelte';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import SkeletonCard from '$lib/components/SkeletonCard.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  // ─── State ────────────────────────────────────────────────────────────────
  let notes: Note[] = [];
  let total = 0;
  let loading = true;
  let fromCache = false;
  let formLoading = false;
  let deleteLoading = false;

  let page = 1;
  const LIMIT = 20;

  let searchRaw = '';
  let search = '';
  let debounceTimer: ReturnType<typeof setTimeout>;

  let sortBy: 'id' | 'title' | 'createdAt' = 'id';
  let order: 'asc' | 'desc' = 'desc';

  let showCreateModal = false;
  let editingNote: Note | null = null;
  let deletingNote: Note | null = null;

  const softDeleted = new Map<number, ReturnType<typeof setTimeout>>();

  // ─── Fetch ────────────────────────────────────────────────────────────────
  async function fetchNotes() {
    loading = true;
    fromCache = false;

    if (!$isOnline) {
      const cached = readCachedNotes();
      if (cached) {
        notes = cached.notes;
        total = cached.meta.total;
        fromCache = true;
      } else {
        notes = [];
        total = 0;
      }
      loading = false;
      return;
    }

    try {
      const res = await notesApi.list({ page, limit: LIMIT, search, sortBy, order });
      notes = res.data;
      total = res.total;
      if (page === 1 && !search) {
        writeCachedNotes(res.data, res.total);
      }
    } catch (err) {
      const cached = readCachedNotes();
      if (cached) {
        notes = cached.notes;
        total = cached.meta.total;
        fromCache = true;
        addToast({ message: 'Showing cached notes – could not reach server', type: 'info', duration: 5000 });
      } else {
        addToast({ message: 'Failed to load notes', type: 'error', duration: 4000 });
      }
      console.error(err);
    } finally {
      loading = false;
    }
  }

  $: if ($isOnline) fetchNotes();

  $: {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      search = searchRaw;
      page = 1;
    }, 350);
  }

  $: search, sortBy, order, page, fetchNotes();

  // ─── Create ───────────────────────────────────────────────────────────────
  async function handleCreate(data: CreateNotePayload) {
    formLoading = true;
    const tempNote: Note = { id: -Date.now(), title: data.title, content: data.content, createdAt: new Date().toISOString() };
    notes = [tempNote, ...notes];
    showCreateModal = false;
    try {
      if ($isOnline) {
        const created = await notesApi.create(data);
        notes = notes.map((n) => (n.id === tempNote.id ? created : n));
        addToast({ message: 'Note created', type: 'success', duration: 3000 });
      } else {
        queueOp({ type: 'create', payload: data });
        addToast({ message: 'Saved offline – will sync when reconnected', type: 'info', duration: 4000 });
      }
    } catch {
      notes = notes.filter((n) => n.id !== tempNote.id);
      addToast({ message: 'Failed to create note', type: 'error', duration: 4000 });
    } finally {
      formLoading = false;
    }
  }

  // ─── Edit ─────────────────────────────────────────────────────────────────
  async function handleEdit(data: CreateNotePayload) {
    if (!editingNote) return;
    formLoading = true;
    const original = { ...editingNote };
    const updated: Note = { ...editingNote, ...data };
    notes = notes.map((n) => (n.id === updated.id ? updated : n));
    editingNote = null;
    try {
      if ($isOnline) {
        const saved = await notesApi.update(original.id, data);
        notes = notes.map((n) => (n.id === saved.id ? saved : n));
        addToast({ message: 'Note updated', type: 'success', duration: 3000 });
      } else {
        queueOp({ type: 'update', noteId: original.id, payload: data });
        addToast({ message: 'Saved offline – will sync when reconnected', type: 'info', duration: 4000 });
      }
    } catch {
      notes = notes.map((n) => (n.id === original.id ? original : n));
      addToast({ message: 'Failed to update note', type: 'error', duration: 4000 });
    } finally {
      formLoading = false;
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  function handleDeleteRequest(note: Note) { deletingNote = note; }

  async function confirmDelete() {
    if (!deletingNote) return;
    deleteLoading = true;
    const target = deletingNote;
    deletingNote = null;
    const snapshot = [...notes];
    notes = notes.filter((n) => n.id !== target.id);
    total -= 1;
    addToast({ message: `"${target.title}" deleted`, type: 'info', duration: 10000, undoFn: () => undoDelete(target, snapshot) });
    const timer = setTimeout(async () => {
      softDeleted.delete(target.id);
      try {
        if ($isOnline) { await notesApi.delete(target.id); }
        else { queueOp({ type: 'delete', noteId: target.id }); }
      } catch {
        addToast({ message: 'Failed to delete note', type: 'error', duration: 4000 });
        notes = snapshot;
        total += 1;
      }
    }, 10000);
    softDeleted.set(target.id, timer);
    deleteLoading = false;
  }

  function undoDelete(note: Note, snapshot: Note[]) {
    const timer = softDeleted.get(note.id);
    if (timer) clearTimeout(timer);
    softDeleted.delete(note.id);
    notes = snapshot;
    total += 1;
    addToast({ message: `"${note.title}" restored`, type: 'success', duration: 3000 });
  }

  // ─── Pin ──────────────────────────────────────────────────────────────────
  async function handleTogglePin(note: Note) {
    const updated: Note = { ...note, pinned: !note.pinned };
    notes = notes.map((n) => (n.id === note.id ? updated : n));
    try {
      if ($isOnline) { await notesApi.update(note.id, { pinned: updated.pinned }); }
      else { queueOp({ type: 'update', noteId: note.id, payload: { pinned: updated.pinned } }); }
      addToast({ message: updated.pinned ? 'Note pinned' : 'Note unpinned', type: 'success', duration: 2000 });
    } catch {
      notes = notes.map((n) => (n.id === note.id ? note : n));
      addToast({ message: 'Failed to update pin', type: 'error', duration: 3000 });
    }
  }

  // ─── Shortcut ─────────────────────────────────────────────────────────────
  onMount(() => {
    const handler = () => { showCreateModal = true; };
    window.addEventListener('shortcut:new-note', handler);
    return () => window.removeEventListener('shortcut:new-note', handler);
  });

  $: pinnedNotes = notes.filter((n) => n.pinned);
  $: unpinnedNotes = notes.filter((n) => !n.pinned);
  $: displayNotes = [...pinnedNotes, ...unpinnedNotes];
</script>

<svelte:head>
  <title>Notely – Your Notes</title>
</svelte:head>

<!-- ─── Header row ──────────────────────────────────────────────────────── -->
<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-8">
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
      My Notes
      {#if !loading && total > 0}
        <span class="ml-2 text-sm font-normal text-gray-400 dark:text-gray-600 tabular-nums">{total}</span>
      {/if}
    </h1>
    {#if fromCache}
      <p class="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
        Showing cached notes — you're offline
      </p>
    {/if}
  </div>

  <button
    class="btn-primary shrink-0 gap-1.5 shadow-sm shadow-indigo-200 dark:shadow-none"
    on:click={() => (showCreateModal = true)}
    title="New note (Ctrl+N)"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    New Note
  </button>
</div>

<!-- ─── Search + Sort bar ──────────────────────────────────────────────── -->
<div class="flex flex-col sm:flex-row gap-2.5 mb-7">
  <div class="relative flex-1">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    </span>
    <input
      class="input pl-9 text-sm"
      type="search"
      placeholder="Search notes…"
      bind:value={searchRaw}
      aria-label="Search notes"
    />
  </div>

  <div class="flex gap-2 shrink-0">
    <select
      class="input !w-auto text-sm cursor-pointer"
      bind:value={sortBy}
      aria-label="Sort by"
      on:change={() => (page = 1)}
    >
      <option value="id">Newest first</option>
      <option value="createdAt">By date</option>
      <option value="title">By title</option>
    </select>

    <button
      class="btn-secondary !px-3 !py-2 text-gray-500 dark:text-gray-400"
      title="Toggle sort direction"
      on:click={() => { order = order === 'desc' ? 'asc' : 'desc'; page = 1; }}
      aria-label="Toggle sort direction"
    >
      {#if order === 'desc'}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
        </svg>
      {:else}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
        </svg>
      {/if}
    </button>
  </div>
</div>

<!-- ─── Pinned section label ───────────────────────────────────────────── -->
{#if !loading && pinnedNotes.length > 0}
  <p class="text-[11px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-3 flex items-center gap-1.5">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 2l-1.5 1.5L16 5l-4 4H6l-2 2 5 5-4 4h2l4-4 5 5 2-2v-6l4-4 1.5 1.5L22 8l-6-6z"/></svg>
    Pinned
  </p>
{/if}

<!-- ─── Notes Grid ──────────────────────────────────────────────────────── -->
{#if loading}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each Array(6) as _}
      <SkeletonCard />
    {/each}
  </div>

{:else if displayNotes.length === 0}
  <div class="flex flex-col items-center justify-center py-28 gap-4 text-center">
    {#if search}
      <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <div>
        <p class="font-semibold text-gray-700 dark:text-gray-300">No results for "{search}"</p>
        <p class="text-sm text-gray-400 dark:text-gray-600 mt-1">Try a different term or clear the search.</p>
      </div>
      <button class="btn-secondary text-sm mt-1" on:click={() => { searchRaw = ''; search = ''; }}>Clear search</button>
    {:else}
      <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-400 mb-1">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="11" x2="12" y2="17"/>
          <line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
      </div>
      <div>
        <p class="font-semibold text-gray-700 dark:text-gray-300">No notes yet</p>
        <p class="text-sm text-gray-400 dark:text-gray-600 mt-1">Create your first note to get started.</p>
      </div>
      <button class="btn-primary text-sm mt-1" on:click={() => (showCreateModal = true)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create a note
      </button>
    {/if}
  </div>

{:else}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each displayNotes as note (note.id)}
      <NoteCard
        {note}
        onEdit={(n) => (editingNote = n)}
        onDelete={handleDeleteRequest}
        onTogglePin={handleTogglePin}
      />
    {/each}
  </div>
{/if}

<!-- ─── Pagination ─────────────────────────────────────────────────────── -->
<Pagination {page} {total} limit={LIMIT} onPage={(p) => (page = p)} />

<!-- ─── Create Modal ─────────────────────────────────────────────────── -->
<Modal title="New Note" open={showCreateModal} on:close={() => (showCreateModal = false)}>
  <NoteForm loading={formLoading} onSubmit={handleCreate} onCancel={() => (showCreateModal = false)} />
</Modal>

<!-- ─── Edit Modal ───────────────────────────────────────────────────── -->
<Modal title="Edit Note" open={editingNote !== null} on:close={() => (editingNote = null)}>
  {#if editingNote}
    <NoteForm initial={editingNote} loading={formLoading} onSubmit={handleEdit} onCancel={() => (editingNote = null)} />
  {/if}
</Modal>

<!-- ─── Delete Confirm ────────────────────────────────────────────────── -->
<ConfirmModal
  open={deletingNote !== null}
  title="Delete note"
  message={`Delete "${deletingNote?.title}"? You'll have 10 seconds to undo.`}
  loading={deleteLoading}
  onConfirm={confirmDelete}
  onCancel={() => (deletingNote = null)}
/>
