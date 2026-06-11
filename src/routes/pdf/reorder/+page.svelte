<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import NextSteps from '$components/pdf/NextSteps.svelte';
	import type { PageThumbnail } from '$pdf/types';

	let files = $state<File[]>([]);
	let thumbnails = $state<PageThumbnail[]>([]);
	let order = $state<number[]>([]);
	let loading = $state(false);
	let processing = $state(false);
	let error = $state('');
	let dragIndex = $state<number | null>(null);
	let lastResult = $state<{ bytes: Uint8Array; name: string } | null>(null);

	let file = $derived(files[0]);

	$effect(() => {
		if (!file) {
			thumbnails = [];
			order = [];
			lastResult = null;
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
		lastResult = null;
		try {
			const { reorderPages } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');
			const buf = await file.arrayBuffer();
			const result = await reorderPages(buf, order);
			const name = makeFilename('reordered', 'pdf');
			downloadPDF(result, name);
			lastResult = { bytes: result, name };
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to reorder pages';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'Are my files uploaded to reorder pages?',
			answer:
				'No. Reordering happens entirely in your browser. Your PDF is never transmitted to a server — pdf-lib reads and rewrites the page order locally.'
		},
		{
			question: 'How do I reorder pages?',
			answer:
				'After uploading, thumbnails of all pages load automatically. Drag any thumbnail to a new position. The order displayed is the order in which pages will appear in the downloaded file.'
		},
		{
			question: 'Can I undo a drag before downloading?',
			answer:
				'Yes. Keep dragging pages until you have the order you want. Nothing is written until you click the download button. You can also re-upload the original file to start over.'
		},
		{
			question: 'Does reordering affect the PDF content?',
			answer:
				'No. The tool copies pages in the new order without re-encoding them. Text, images, and links are preserved exactly as in the source.'
		},
		{
			question: 'Is there a page count limit?',
			answer:
				'No enforced limit. The tool renders all pages as thumbnails, so very large documents (100+ pages) will take a moment to load, but no cap is imposed.'
		}
	];
</script>

<ToolShell
	path="/pdf/reorder"
	tagline="Drag and drop page thumbnails to rearrange your PDF. No upload needed."
	seoTitle="Reorder PDF Pages Free — Drag to Rearrange | nah.tools"
	description="Rearrange PDF pages by dragging and dropping. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-4xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" acceptPendingFile={true} bind:files label="Drop a PDF here or click to browse" />

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
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
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

		{#if lastResult}
			<NextSteps path="/pdf/reorder" resultBytes={() => lastResult?.bytes ?? null} resultName={lastResult.name} />
		{/if}

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Rearrange pages without re-creating the document</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				PDFs created by combining scans, exporting from multiple sources, or assembling from
				templates often end up with pages in the wrong sequence. Correcting the order used to mean
				re-creating the entire document from scratch.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool renders every page as a thumbnail so you can see exactly what you are moving.
				Drag pages into the correct order, verify the sequence visually, and download. The output is
				a fresh PDF with pages in the order you specified — content, fonts, and images are copied
				without re-encoding.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Common use cases: correcting a scan that captured pages out of order, resequencing a
				presentation that was assembled from multiple exports, or moving a cover page or appendix to
				the right position after merging.
			</p>
		</div>
	</section>
</ToolShell>
