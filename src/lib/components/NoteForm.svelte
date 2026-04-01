<script lang="ts">
  import type { Note, CreateNotePayload } from '$lib/api/notes';

  export let initial: Partial<Note> = {};
  export let loading = false;
  export let onSubmit: (data: CreateNotePayload) => Promise<void>;
  export let onCancel: () => void;

  let title = initial.title ?? '';
  let content = initial.content ?? '';
  let errors: { title?: string; content?: string } = {};

  const MAX_TITLE = 100;
  const MAX_CONTENT = 2000;

  function validate(): boolean {
    errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    else if (title.length > MAX_TITLE) errors.title = `Max ${MAX_TITLE} characters`;
    if (!content.trim()) errors.content = 'Content is required';
    else if (content.length > MAX_CONTENT) errors.content = `Max ${MAX_CONTENT} characters`;
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await onSubmit({ title: title.trim(), content: content.trim() });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="flex flex-col gap-4">
  <!-- Title -->
  <div>
    <label for="note-title" class="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-gray-500 dark:text-gray-500">
      Title
    </label>
    <input
      id="note-title"
      class="input text-sm {errors.title ? 'border-red-400 focus:ring-red-400 dark:border-red-600' : ''}"
      type="text"
      placeholder="Give your note a title…"
      bind:value={title}
      maxlength={MAX_TITLE}
      disabled={loading}
      autocomplete="off"
    />
    <div class="flex justify-between mt-1.5">
      {#if errors.title}
        <span class="text-xs text-red-500">{errors.title}</span>
      {:else}
        <span></span>
      {/if}
      <span class="text-[11px] text-gray-400 tabular-nums">{title.length}/{MAX_TITLE}</span>
    </div>
  </div>

  <!-- Content -->
  <div>
    <label for="note-content" class="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-gray-500 dark:text-gray-500">
      Content
    </label>
    <textarea
      id="note-content"
      class="input resize-none text-sm leading-relaxed {errors.content ? 'border-red-400 focus:ring-red-400 dark:border-red-600' : ''}"
      rows={6}
      placeholder="What's on your mind?"
      bind:value={content}
      maxlength={MAX_CONTENT}
      disabled={loading}
    ></textarea>
    <div class="flex justify-between mt-1.5">
      {#if errors.content}
        <span class="text-xs text-red-500">{errors.content}</span>
      {:else}
        <span></span>
      {/if}
      <span class="text-[11px] text-gray-400 tabular-nums">{content.length}/{MAX_CONTENT}</span>
    </div>
  </div>

  <!-- Actions -->
  <div class="flex gap-2 justify-end pt-1">
    <button class="btn-secondary text-sm" on:click={onCancel} disabled={loading} type="button">
      Cancel
    </button>
    <button class="btn-primary text-sm" on:click={handleSubmit} disabled={loading} type="button">
      {#if loading}
        <span class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        Saving…
      {:else}
        {initial.id ? 'Update Note' : 'Create Note'}
      {/if}
    </button>
  </div>
</div>
