<script lang="ts">
  import Modal from './Modal.svelte';

  export let open = false;
  export let title = 'Are you sure?';
  export let message = 'This action cannot be undone.';
  export let confirmLabel = 'Delete';
  export let loading = false;
  export let onConfirm: () => void;
  export let onCancel: () => void;
</script>

<Modal {title} {open} on:close={onCancel}>
  <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{message}</p>
  <div class="flex gap-2 justify-end">
    <button class="btn-secondary" on:click={onCancel} disabled={loading} type="button">
      Cancel
    </button>
    <button class="btn-danger" on:click={onConfirm} disabled={loading} type="button">
      {#if loading}
        <span class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      {/if}
      {confirmLabel}
    </button>
  </div>
</Modal>
