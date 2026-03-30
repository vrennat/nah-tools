<script lang="ts">
	import type { Snippet } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic list component; Svelte 5 lacks generic component support
	let {
		items = $bindable<any[]>([]),
		renderItem,
		onAdd,
		label,
		addLabel
	}: {
		items: any[];
		renderItem: Snippet<[any, number]>;
		onAdd: () => any;
		label: string;
		addLabel: string;
	} = $props();

	function addItem() {
		items = [...items, onAdd()];
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	function moveUp(index: number) {
		if (index <= 0) return;
		const next = [...items];
		[next[index - 1], next[index]] = [next[index], next[index - 1]];
		items = next;
	}

	function moveDown(index: number) {
		if (index >= items.length - 1) return;
		const next = [...items];
		[next[index], next[index + 1]] = [next[index + 1], next[index]];
		items = next;
	}
</script>

<div class="space-y-4">
	{#if items.length === 0}
		<p class="py-6 text-center text-sm text-text-muted">
			No {label.toLowerCase()} added yet. Click below to add one.
		</p>
	{/if}

	{#each items as item, index (item.id)}
		<div class="relative rounded-xl border border-border bg-surface p-5 shadow-sm">
			<div class="mb-3 flex items-center justify-end gap-1">
				<button
					type="button"
					onclick={() => moveUp(index)}
					disabled={index === 0}
					class="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-muted transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
					aria-label="Move {label} up"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
					</svg>
				</button>
				<button
					type="button"
					onclick={() => moveDown(index)}
					disabled={index === items.length - 1}
					class="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-muted transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
					aria-label="Move {label} down"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
				<button
					type="button"
					onclick={() => removeItem(index)}
					class="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-error transition-colors hover:bg-error/10"
					aria-label="Remove {label}"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				</button>
			</div>
			{@render renderItem(item, index)}
		</div>
	{/each}

	<button
		type="button"
		onclick={addItem}
		class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
		{addLabel}
	</button>
</div>
