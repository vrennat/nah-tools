<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import NextSteps from '$components/pdf/NextSteps.svelte';
	import type { PageThumbnail } from '$pdf/types';

	let files = $state<File[]>([]);
	let thumbnails = $state<PageThumbnail[]>([]);
	let selectedPages = $state<Set<number>>(new Set());
	let loading = $state(false);
	let processing = $state(false);
	let error = $state('');
	let lastResult = $state<{ bytes: Uint8Array; name: string } | null>(null);

	let file = $derived(files[0]);

	$effect(() => {
		if (!file) {
			thumbnails = [];
			selectedPages = new Set();
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
			selectedPages = new Set();
		} catch (e) {
			if (file !== currentFile) return;
			error = e instanceof Error ? e.message : 'Failed to load PDF';
		} finally {
			if (file === currentFile) loading = false;
		}
	}

	function togglePage(pageIndex: number) {
		const updated = new Set(selectedPages);
		if (updated.has(pageIndex)) {
			updated.delete(pageIndex);
		} else {
			// Prevent removing all pages — at least one must remain
			if (updated.size < thumbnails.length - 1) {
				updated.add(pageIndex);
			}
		}
		selectedPages = updated;
	}

	let canRemove = $derived(!!file && selectedPages.size > 0 && !processing);

	async function apply() {
		if (!canRemove || !file) return;
		processing = true;
		error = '';
		lastResult = null;
		try {
			const { removePages } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');
			const buf = await file.arrayBuffer();
			const result = await removePages(buf, [...selectedPages]);
			const name = makeFilename('pages-removed', 'pdf');
			downloadPDF(result, name);
			lastResult = { bytes: result, name };
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove pages';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'Are my files uploaded to remove pages?',
			answer:
				'No. Page removal runs entirely in your browser. Your PDF is never sent to a server — pdf-lib processes it locally and the result is downloaded directly to your device.'
		},
		{
			question: 'How do I select pages to delete?',
			answer:
				'After uploading, thumbnail previews of all pages load automatically. Click any thumbnail to mark it for removal — it will be highlighted with a red X. Click again to deselect. Once you have selected all pages you want to delete, click the Remove button.'
		},
		{
			question: 'Can I remove all pages?',
			answer:
				'No. The tool requires at least one page to remain in the output. If you select all but one page, the last unselected page is always preserved.'
		},
		{
			question: 'Is there a limit on how many pages I can remove?',
			answer:
				'No hard limit. You can remove any number of pages as long as at least one remains in the output.'
		},
		{
			question: 'What is the difference between Remove Pages and Split PDF?',
			answer:
				'Remove Pages deletes the pages you select and gives you one PDF with those pages gone. Split PDF extracts specific page ranges into separate documents. Use Remove Pages when you want to clean up a document; use Split when you want to create multiple files from one source.'
		}
	];
</script>

<ToolShell
	path="/pdf/remove-pages"
	tagline="Click to select pages for deletion, then download the cleaned PDF."
	seoTitle="Remove PDF Pages Free — Delete Pages Instantly | nah.tools"
	description="Remove pages from a PDF. Click to select pages for deletion. Free, no upload — processed in your browser."
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

			{#if thumbnails.length > 0}
				<p class="mt-4 text-sm text-text-muted">
					Click pages to mark for removal. {selectedPages.size} of {thumbnails.length} selected.
				</p>

				<div class="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
					{#each thumbnails as thumb}
						{@const selected = selectedPages.has(thumb.pageIndex)}
						<button
							type="button"
							class="relative overflow-hidden rounded-lg border transition-all {selected
								? 'border-error ring-2 ring-error/30 opacity-50'
								: 'border-border hover:border-accent'}"
							onclick={() => togglePage(thumb.pageIndex)}
						>
							<img src={thumb.dataUrl} alt="Page {thumb.pageIndex + 1}" class="w-full" />
							<span
								class="absolute bottom-1 left-1 rounded bg-brand/70 px-1.5 py-0.5 text-xs font-medium text-white"
							>
								{thumb.pageIndex + 1}
							</span>
							{#if selected}
								<div class="absolute inset-0 flex items-center justify-center bg-error/20">
									<svg class="h-8 w-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</div>
							{/if}
						</button>
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
					disabled={!canRemove}
					onclick={apply}
				>
					{#if processing}
						Removing...
					{:else if !file}
						Upload a PDF
					{:else if selectedPages.size === 0}
						Select pages to remove
					{:else}
						Remove {selectedPages.size} page{selectedPages.size > 1 ? 's' : ''} & Download
					{/if}
				</button>
			</div>
		</div>

		{#if lastResult}
			<NextSteps path="/pdf/remove-pages" resultBytes={() => lastResult?.bytes ?? null} resultName={lastResult.name} />
		{/if}

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Remove specific pages without splitting</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Sometimes you need to delete one or two pages from a document — a cover page that was added
				by a printer driver, a blank page at the end of a scan, an internal notes page that should
				not be in the client copy — without splitting the entire document into pieces.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool renders thumbnails of every page so you can visually confirm which pages you are
				deleting before committing. Select any combination of pages by clicking the thumbnails, then
				download the result in one step.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				All processing happens locally. For related operations, consider
				<a href="/pdf/split" class="text-accent hover:underline">Split PDF</a> to extract ranges into
				separate files, or <a href="/pdf/reorder" class="text-accent hover:underline">Reorder Pages</a>
				to rearrange without deleting.
			</p>
		</div>
	</section>
</ToolShell>
