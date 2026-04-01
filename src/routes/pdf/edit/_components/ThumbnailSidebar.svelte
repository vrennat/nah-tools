<script lang="ts">
	import type { EditorState } from '$pdf/editor-state.svelte';
	import PageThumbnail from './PageThumbnail.svelte';

	interface Props {
		editor: EditorState;
		onscrolltopage: (index: number) => void;
	}

	let { editor, onscrolltopage }: Props = $props();

	// Merge drop state
	let mergeOver = $state(false);

	function handleMergeDrop(e: DragEvent) {
		e.preventDefault();
		mergeOver = false;
		const file = e.dataTransfer?.files[0];
		if (file?.type === 'application/pdf') {
			editor.mergeFile(file, editor.pageCount);
		}
	}

	function handleMergeDragOver(e: DragEvent) {
		e.preventDefault();
		mergeOver = true;
	}

	// Drag state
	let dragIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);
	let dragging = $state(false);
	let dragGhostY = $state(0);
	let container: HTMLDivElement | undefined = $state();

	function handleSelect(index: number, e: PointerEvent) {
		if (dragging) return;

		if (e.shiftKey) {
			editor.selectPage(index, 'range');
		} else if (e.metaKey || e.ctrlKey) {
			editor.selectPage(index, 'toggle');
		} else {
			editor.selectPage(index, 'single');
		}

		onscrolltopage(index);
	}

	function handlePointerDown(index: number, e: PointerEvent) {
		if (e.button !== 0) return;

		dragIndex = index;
		dragGhostY = e.clientY;

		const onMove = (me: PointerEvent) => {
			if (!dragging && Math.abs(me.clientY - dragGhostY) > 5) {
				dragging = true;
			}
			if (!dragging || !container) return;

			dragGhostY = me.clientY;

			// Calculate drop target index from pointer Y relative to container
			const rect = container.getBoundingClientRect();
			const relY = me.clientY - rect.top + container.scrollTop;
			const thumbHeight = 200; // approximate thumbnail + gap height
			const target = Math.round(relY / thumbHeight);
			dragOverIndex = Math.max(0, Math.min(editor.pageCount, target));
		};

		const onUp = () => {
			if (dragging && dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
				// Build new order
				const newOrder = Array.from({ length: editor.pageCount }, (_, i) => i);
				const [removed] = newOrder.splice(dragIndex, 1);
				const insertAt = dragOverIndex > dragIndex ? dragOverIndex - 1 : dragOverIndex;
				newOrder.splice(insertAt, 0, removed);
				editor.reorderPages(newOrder);
			}

			dragIndex = null;
			dragOverIndex = null;
			dragging = false;
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		};

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	}
</script>

<div
	bind:this={container}
	class="flex h-full flex-col gap-1 overflow-y-auto border-r border-border bg-surface p-2"
	style="width: 180px; min-width: 180px;"
>
	<div class="mb-1 flex items-center justify-between px-1">
		<span class="text-xs font-medium text-text-muted">Pages</span>
		{#if editor.hasSelection}
			<button
				type="button"
				class="text-xs text-accent hover:underline"
				onclick={() => editor.clearSelection()}
			>
				Clear
			</button>
		{/if}
	</div>

	{#each editor.pages as page, i (page.index)}
		<!-- Drop indicator line -->
		{#if dragging && dragOverIndex === i}
			<div class="mx-2 h-0.5 rounded-full bg-accent"></div>
		{/if}

		<div
			class:opacity-30={dragging && dragIndex === i}
			class="transition-opacity"
		>
			<PageThumbnail
				index={i}
				label={page.label}
				thumbnailUrl={editor.thumbnails.get(i)}
				selected={editor.selectedPages.has(i)}
				width={page.width}
				height={page.height}
				rotation={page.rotation}
				onselect={handleSelect}
				onpointerdown={handlePointerDown}
			/>
		</div>
	{/each}

	<!-- Drop indicator at end -->
	{#if dragging && dragOverIndex === editor.pageCount}
		<div class="mx-2 h-0.5 rounded-full bg-accent"></div>
	{/if}

	<!-- Merge drop zone -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="mx-2 mt-2 flex min-h-[60px] items-center justify-center rounded-lg border-2 border-dashed transition-colors
			{mergeOver ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted'}"
		ondragover={handleMergeDragOver}
		ondragleave={() => (mergeOver = false)}
		ondrop={handleMergeDrop}
	>
		<span class="px-2 text-center text-[10px]">
			{mergeOver ? 'Drop to merge' : 'Drop PDF to add pages'}
		</span>
	</div>
</div>
