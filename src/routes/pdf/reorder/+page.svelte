<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import type { PageThumbnail } from '$pdf/types';

	let files = $state<File[]>([]);
	let thumbnails = $state<PageThumbnail[]>([]);
	let order = $state<number[]>([]);
	let loading = $state(false);
	let processing = $state(false);
	let error = $state('');
	let dragIndex = $state<number | null>(null);

	let file = $derived(files[0]);

	$effect(() => {
		if (!file) {
			thumbnails = [];
			order = [];
			return;
		}
		loadThumbnails();
	});

	async function loadThumbnails() {
		const currentFile = file!;
		loading = true;
		error = '';
		try {
			const buf = await currentFile.arrayBuffer();
			if (file !== currentFile) return;
			const { renderThumbnails } = await import('$pdf/renderer');
			const result = await renderThumbnails(buf);
			if (file !== currentFile) return;
			thumbnails = result;
			order = result.map((t) => t.pageIndex);
		} catch (e) {
			if (file !== currentFile) return;
			error = e instanceof Error ? e.message : 'Failed to load PDF';
		} finally {
			if (file === currentFile) loading = false;
		}
	}

	let isReordered = $derived(order.some((v, i) => v !== i));

	function moveItem(from: number, to: number) {
		if (from === to) return;
		const updated = [...order];
		const [item] = updated.splice(from, 1);
		updated.splice(to, 0, item);
		order = updated;
	}

	async function apply() {
		if (!file || !isReordered) return;
		processing = true;
		error = '';
		try {
			const { reorderPages } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');
			const buf = await file.arrayBuffer();
			const result = await reorderPages(buf, order);
			downloadPDF(result, makeFilename('reordered', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to reorder pages';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Reorder PDF Pages Online Free | nah</title>
	<meta
		name="description"
		content="Rearrange PDF pages by dragging and dropping. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Reorder Pages"
	description="Drag and drop to rearrange pages in your PDF."
>
	<section class="mx-auto max-w-4xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			{#if loading}
				<div class="mt-4">
					<ProgressBar current={0} total={0} label="Loading pages..." />
				</div>
			{/if}

			{#if order.length > 0}
				<p class="mt-4 text-sm text-text-muted">Drag pages to reorder them.</p>

				<div class="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
					{#each order as pageIndex, i}
						{@const thumb = thumbnails.find((t) => t.pageIndex === pageIndex)}
						{#if thumb}
							<div
								class="relative cursor-grab overflow-hidden rounded-lg border transition-all {dragIndex === i
									? 'border-accent ring-2 ring-accent/30'
									: 'border-border'}"
								draggable="true"
								role="listitem"
								ondragstart={() => (dragIndex = i)}
								ondragover={(e) => {
									e.preventDefault();
									if (dragIndex !== null && dragIndex !== i) {
										moveItem(dragIndex, i);
										dragIndex = i;
									}
								}}
								ondragend={() => (dragIndex = null)}
							>
								<img src={thumb.dataUrl} alt="Page {pageIndex + 1}" class="w-full" />
								<span
									class="absolute bottom-1 left-1 rounded bg-brand/70 px-1.5 py-0.5 text-xs font-medium text-white"
								>
									{pageIndex + 1}
								</span>
							</div>
						{/if}
					{/each}
				</div>
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!isReordered || processing}
					onclick={apply}
				>
					{#if processing}
						Reordering...
					{:else if !file}
						Upload a PDF
					{:else if !isReordered}
						Drag pages to reorder
					{:else}
						Apply New Order & Download
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
