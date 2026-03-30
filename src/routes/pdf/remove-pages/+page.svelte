<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import type { PageThumbnail } from '$pdf/types';

	let files = $state<File[]>([]);
	let thumbnails = $state<PageThumbnail[]>([]);
	let selectedPages = $state<Set<number>>(new Set());
	let loading = $state(false);
	let processing = $state(false);
	let error = $state('');

	let file = $derived(files[0]);

	$effect(() => {
		if (!file) {
			thumbnails = [];
			selectedPages = new Set();
			return;
		}
		loadThumbnails();
	});

	async function loadThumbnails() {
		loading = true;
		error = '';
		try {
			const buf = await file!.arrayBuffer();
			const { renderThumbnails } = await import('$pdf/renderer');
			thumbnails = await renderThumbnails(buf);
			selectedPages = new Set();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load PDF';
		} finally {
			loading = false;
		}
	}

	function togglePage(pageIndex: number) {
		const updated = new Set(selectedPages);
		if (updated.has(pageIndex)) {
			updated.delete(pageIndex);
		} else {
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
		try {
			const { removePages } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');
			const buf = await file.arrayBuffer();
			const result = await removePages(buf, [...selectedPages]);
			downloadPDF(result, makeFilename('pages-removed', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove pages';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Remove PDF Pages Online Free | Nah Tools</title>
	<meta
		name="description"
		content="Remove pages from a PDF. Click to select pages for deletion. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Remove Pages"
	description="Click pages to select them for removal."
>
	<section class="mx-auto max-w-4xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

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

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
