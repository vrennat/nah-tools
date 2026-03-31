<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');
	let dragIndex = $state<number | null>(null);

	let canMerge = $derived(files.length >= 2 && !processing);

	function moveFile(from: number, to: number) {
		if (from === to) return;
		const updated = [...files];
		const [item] = updated.splice(from, 1);
		updated.splice(to, 0, item);
		files = updated;
	}

	async function merge() {
		if (!canMerge) return;
		processing = true;
		error = '';
		progress = { current: 0, total: files.length };

		try {
			const { mergePDFs } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
			const result = await mergePDFs(buffers, (current, total) => {
				progress = { current, total };
			});

			downloadPDF(result, makeFilename('merged', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to merge PDFs';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Merge PDFs Online Free — Combine PDF Files | nah</title>
	<meta
		name="description"
		content="Merge multiple PDF files into one. Free, no upload — files are combined in your browser. Drag to reorder before merging."
	/>
</svelte:head>

<PdfToolLayout
	title="Merge PDFs"
	description="Combine multiple PDF files into one document. Drag to reorder."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" multiple={true} bind:files label="Drop PDF files here or click to browse" />

			{#if files.length >= 2}
				<div class="mt-4 space-y-2">
					<p class="text-sm font-medium text-text">File order (drag to reorder)</p>
					<ul class="space-y-1">
						{#each files as file, i}
							<li
								class="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors {dragIndex === i
									? 'border-accent bg-accent/5'
									: 'border-border bg-surface'}"
								draggable="true"
								role="listitem"
								ondragstart={() => (dragIndex = i)}
								ondragover={(e) => {
									e.preventDefault();
									if (dragIndex !== null && dragIndex !== i) {
										moveFile(dragIndex, i);
										dragIndex = i;
									}
								}}
								ondragend={() => (dragIndex = null)}
							>
								<svg
									class="h-4 w-4 shrink-0 cursor-grab text-text-muted"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 8h16M4 16h16"
									/>
								</svg>
								<span class="min-w-0 flex-1 truncate text-text">{file.name}</span>
								<span class="shrink-0 text-xs text-text-muted">
									{(file.size / 1024).toFixed(0)} KB
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			{#if processing}
				<div class="mt-4">
					<ProgressBar current={progress.current} total={progress.total} />
				</div>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canMerge}
					onclick={merge}
				>
					{#if processing}
						Merging...
					{:else if files.length < 2}
						Add at least 2 PDFs to merge
					{:else}
						Merge {files.length} PDFs
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
