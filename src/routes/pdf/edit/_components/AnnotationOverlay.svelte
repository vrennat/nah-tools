<script lang="ts">
	import type { EditorState } from '$pdf/editor-state.svelte';
	import type { EditAnnotation, PageTransform } from '$pdf/types';
	import { pdfToScreen, buildTransform } from '$pdf/coordinates';
	import TextAnnotation from './TextAnnotation.svelte';
	import FreehandCanvas from './FreehandCanvas.svelte';
	import WatermarkPreview from './WatermarkPreview.svelte';
	import PageNumberPreview from './PageNumberPreview.svelte';

	interface Props {
		editor: EditorState;
		pageIndex: number;
		pdfWidth: number;
		pdfHeight: number;
		rotation: number;
	}

	let { editor, pageIndex, pdfWidth, pdfHeight, rotation }: Props = $props();

	let transform = $derived(buildTransform(pdfWidth, pdfHeight, rotation, editor.zoom));

	// Filter annotations for this page
	let pageAnnotations = $derived(
		editor.annotations.filter((a) => a.pageIndex === pageIndex)
	);
	let textAnnotations = $derived(
		pageAnnotations.filter((a): a is Extract<EditAnnotation, { type: 'text' }> => a.type === 'text')
	);
	let drawAnnotations = $derived(
		pageAnnotations.filter((a): a is Extract<EditAnnotation, { type: 'draw' }> => a.type === 'draw')
	);

	// Text placement state
	let placingText = $state(false);
	let textInput = $state('');
	let textPos = $state({ x: 0, y: 0 });
	let inputEl: HTMLTextAreaElement | undefined = $state();

	function handleClick(e: MouseEvent) {
		if (editor.activeTool === 'draw') return;
		if (editor.activeTool !== 'text') return;

		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;

		// Convert to PDF coordinates
		const pdfX = screenX / transform.scale;
		const pdfY = transform.pdfHeight - screenY / transform.scale;

		textPos = { x: screenX, y: screenY };
		placingText = true;
		textInput = '';

		// Focus the input after it renders
		requestAnimationFrame(() => inputEl?.focus());
	}

	function commitText() {
		if (!textInput.trim()) {
			placingText = false;
			return;
		}

		const pdfX = textPos.x / transform.scale;
		const pdfY = transform.pdfHeight - textPos.y / transform.scale;

		editor.addAnnotation({
			type: 'text',
			pageIndex,
			x: pdfX,
			y: pdfY,
			text: textInput.trim(),
			fontSize: 14,
			color: '#000000'
		});

		placingText = false;
		textInput = '';
	}

	function handleTextKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			commitText();
		}
		if (e.key === 'Escape') {
			placingText = false;
			textInput = '';
		}
	}

	function handleAddStroke(
		stroke: { x: number; y: number }[],
		color: string,
		width: number
	) {
		editor.addAnnotation({
			type: 'draw',
			pageIndex,
			paths: [stroke],
			strokeColor: color,
			strokeWidth: width
		});
	}

	function handleRemoveAnnotation(globalIndex: number) {
		editor.removeAnnotation(globalIndex);
	}

	// Map page-local annotation to global index
	function getGlobalIndex(annotation: EditAnnotation): number {
		return editor.annotations.indexOf(annotation);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="absolute inset-0"
	style="width: {transform.canvasWidth}px; height: {transform.canvasHeight}px; pointer-events: {editor.activeTool === 'select' ? 'none' : 'auto'};"
	onclick={handleClick}
>
	<!-- Freehand drawing layer -->
	<FreehandCanvas
		{drawAnnotations}
		{transform}
		activeTool={editor.activeTool}
		{pageIndex}
		onaddstroke={handleAddStroke}
	/>

	<!-- Text annotations -->
	{#each textAnnotations as ann}
		{@const screen = pdfToScreen(ann.x, ann.y, transform)}
		<TextAnnotation
			annotation={ann}
			screenX={screen.x}
			screenY={screen.y}
			scale={transform.scale}
			index={getGlobalIndex(ann)}
			onremove={handleRemoveAnnotation}
		/>
	{/each}

	<!-- Text input for placing new text -->
	{#if placingText}
		<div
			class="absolute"
			style="left: {textPos.x}px; top: {textPos.y}px;"
		>
			<textarea
				bind:this={inputEl}
				bind:value={textInput}
				onkeydown={handleTextKeydown}
				onblur={commitText}
				class="min-w-[120px] resize-none rounded border border-accent bg-white/90 px-1 py-0.5 text-sm shadow-lg outline-none dark:bg-brand/90 dark:text-white"
				rows="1"
				placeholder="Type text..."
				style="font-size: {14 * transform.scale}px;"
			></textarea>
		</div>
	{/if}

	<!-- Watermark preview -->
	{#if editor.watermark}
		<WatermarkPreview
			config={editor.watermark}
			width={transform.canvasWidth}
			height={transform.canvasHeight}
		/>
	{/if}

	<!-- Page number preview -->
	{#if editor.pageNumbers}
		<PageNumberPreview
			config={editor.pageNumbers}
			{pageIndex}
			totalPages={editor.pageCount}
			width={transform.canvasWidth}
			height={transform.canvasHeight}
			scale={transform.scale}
		/>
	{/if}
</div>
