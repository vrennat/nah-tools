<script lang="ts">
	import type { EditorState } from '$pdf/editor-state.svelte';
	import PageView from './PageView.svelte';

	interface Props {
		editor: EditorState;
	}

	let { editor }: Props = $props();

	let scrollContainer: HTMLDivElement | undefined = $state();
	let viewportHeight = $state(0);
	let scrollTop = $state(0);

	let visibleRange = $derived(editor.getVisibleRange(scrollTop, viewportHeight));

	function handleScroll() {
		if (scrollContainer) {
			scrollTop = scrollContainer.scrollTop;
		}
	}

	export function scrollToPage(index: number) {
		if (!scrollContainer) return;
		const offset = editor.pageOffsets[index];
		if (offset !== undefined) {
			scrollContainer.scrollTo({ top: offset, behavior: 'smooth' });
		}
	}

	export function getContainerWidth(): number {
		return scrollContainer?.clientWidth ?? 0;
	}

	// Observe container height
	$effect(() => {
		if (!scrollContainer) return;
		const observer = new ResizeObserver((entries) => {
			viewportHeight = entries[0].contentRect.height;
		});
		observer.observe(scrollContainer);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={scrollContainer}
	class="flex-1 overflow-auto bg-surface-alt"
	onscroll={handleScroll}
>
	<!-- Spacer for total document height -->
	<div
		class="relative mx-auto"
		style="height: {editor.totalHeight}px; padding: 16px 0;"
	>
		{#each editor.pages as page, i (i)}
			{#if i >= visibleRange[0] && i <= visibleRange[1] && editor.pdfJsDoc}
				<div
					class="absolute left-0 right-0 flex justify-center"
					style="top: {editor.pageOffsets[i]}px;"
				>
					<PageView
						pageIndex={i}
						pdfJsDoc={editor.pdfJsDoc}
						zoom={editor.zoom}
						pdfWidth={page.width}
						pdfHeight={page.height}
						rotation={page.rotation}
						{editor}
					/>
				</div>
			{:else}
				<!-- Placeholder for non-visible pages -->
				<div
					class="absolute left-0 right-0 flex justify-center"
					style="top: {editor.pageOffsets[i]}px;"
				>
					<div
						class="rounded bg-surface-alt"
						style="width: {(page.rotation === 90 || page.rotation === 270 ? page.height : page.width) * editor.zoom}px;
							   height: {(page.rotation === 90 || page.rotation === 270 ? page.width : page.height) * editor.zoom}px;"
					></div>
				</div>
			{/if}
		{/each}
	</div>
</div>
