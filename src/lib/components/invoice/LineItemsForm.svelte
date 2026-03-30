<script lang="ts">
	import type { LineItem } from '$invoice/types';
	import { createEmptyLineItem } from '$invoice/types';
	import LineItemRow from './LineItemRow.svelte';

	let {
		items = $bindable<LineItem[]>(),
		currency
	}: {
		items: LineItem[];
		currency: string;
	} = $props();

	let dragIdx = $state<number | null>(null);

	function addItem() {
		const maxSort = items.length > 0 ? Math.max(...items.map((i) => i.sortOrder)) : -1;
		items = [...items, createEmptyLineItem(maxSort + 1)];
	}

	function removeItem(idx: number) {
		if (items.length <= 1) return;
		items = items.filter((_, i) => i !== idx);
	}

	function handleDragStart(idx: number, e: DragEvent) {
		dragIdx = idx;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(targetIdx: number, e: DragEvent) {
		e.preventDefault();
		if (dragIdx === null || dragIdx === targetIdx) return;

		const updated = [...items];
		const [moved] = updated.splice(dragIdx, 1);
		updated.splice(targetIdx, 0, moved);
		updated.forEach((item, i) => { item.sortOrder = i; });
		items = updated;
		dragIdx = null;
	}
</script>

<div class="space-y-2">
	<!-- Column labels (desktop) -->
	<div class="hidden items-center gap-2 px-3 text-xs font-medium text-text-muted sm:flex">
		<div class="w-4"></div>
		<div class="flex-1">Description</div>
		<div class="w-16 text-right">Qty</div>
		<div class="w-20 text-center">Unit</div>
		<div class="w-24 text-right">Price</div>
		<div class="w-24 text-right">Amount</div>
		<div class="w-14"></div>
	</div>

	<!-- Items -->
	{#each items as item, idx (item.id)}
		<LineItemRow
			bind:item={items[idx]}
			{currency}
			onremove={() => removeItem(idx)}
			ondragstart={(e) => handleDragStart(idx, e)}
			ondragover={handleDragOver}
			ondrop={(e) => handleDrop(idx, e)}
		/>
	{/each}

	<!-- Add item -->
	<button
		type="button"
		onclick={addItem}
		class="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
		</svg>
		Add Line Item
	</button>
</div>
