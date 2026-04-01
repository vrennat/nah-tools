<script lang="ts">
	import type { PDFDocumentProxy } from 'pdfjs-dist';
	import type { EditorState } from '$pdf/editor-state.svelte';
	import AnnotationOverlay from './AnnotationOverlay.svelte';

	interface Props {
		pageIndex: number;
		pdfJsDoc: PDFDocumentProxy;
		zoom: number;
		pdfWidth: number;
		pdfHeight: number;
		rotation: number;
		editor: EditorState;
	}

	let { pageIndex, pdfJsDoc, zoom, pdfWidth, pdfHeight, rotation, editor }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let rendered = $state(false);

	let isRotated = $derived(rotation === 90 || rotation === 270);
	let displayWidth = $derived((isRotated ? pdfHeight : pdfWidth) * zoom);
	let displayHeight = $derived((isRotated ? pdfWidth : pdfHeight) * zoom);

	// Track a render version to cancel stale renders
	let renderVersion = 0;

	$effect(() => {
		// Capture reactive dependencies
		const doc = pdfJsDoc;
		const idx = pageIndex;
		const z = zoom;
		const el = canvas;
		if (!doc || !el) return;

		const version = ++renderVersion;
		rendered = false;

		doc.getPage(idx + 1).then((page) => {
			if (version !== renderVersion) return;
			const viewport = page.getViewport({ scale: z });
			el.width = viewport.width;
			el.height = viewport.height;
			el.style.width = `${viewport.width}px`;
			el.style.height = `${viewport.height}px`;

			const ctx = el.getContext('2d');
			if (!ctx) return;
			const task = page.render({ canvasContext: ctx, viewport } as any);
			return task.promise.then(() => {
				if (version === renderVersion) rendered = true;
			});
		}).catch(() => {
			// Page may have been removed or doc changed during render
		});
	});
</script>

<div
	class="relative mx-auto"
	style="width: {displayWidth}px; height: {displayHeight}px;"
>
	{#if !rendered}
		<div
			class="absolute inset-0 animate-pulse rounded bg-surface-alt"
			style="width: {displayWidth}px; height: {displayHeight}px;"
		></div>
	{/if}
	<canvas
		bind:this={canvas}
		class="rounded shadow-sm"
		class:opacity-0={!rendered}
		class:opacity-100={rendered}
		style="transition: opacity 150ms;"
	></canvas>

	<!-- Annotation + watermark + page number overlay -->
	{#if rendered}
		<AnnotationOverlay
			{editor}
			{pageIndex}
			{pdfWidth}
			{pdfHeight}
			{rotation}
		/>
	{/if}

	<div class="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-brand/60 px-2 py-0.5 text-xs text-white backdrop-blur">
		Page {pageIndex + 1}
	</div>
</div>
