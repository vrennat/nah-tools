<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import NextSteps from '$components/pdf/NextSteps.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');
	let dragIndex = $state<number | null>(null);
	let lastResult = $state<{ bytes: Uint8Array; name: string } | null>(null);

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
		lastResult = null;
		progress = { current: 0, total: files.length };

		try {
			const { mergePDFs } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
			const result = await mergePDFs(buffers, (current, total) => {
				progress = { current, total };
			});

			const name = makeFilename('merged', 'pdf');
			downloadPDF(result, name);
			lastResult = { bytes: result, name };
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to merge PDFs';
		} finally {
			processing = false;
		}
	}

	$effect(() => {
		if (files.length === 0) lastResult = null;
	});

	const faqs = [
		{
			question: 'Are my files uploaded to a server when I merge PDFs?',
			answer:
				'No. All merging happens directly in your browser using JavaScript. Your files never leave your device — no uploads, no server, no account required.'
		},
		{
			question: 'Is there a file size limit?',
			answer:
				'There is no enforced file size limit. Very large PDFs (hundreds of megabytes combined) may slow down or run out of browser memory depending on your device, but the tool imposes no hard cap.'
		},
		{
			question: 'How many PDFs can I merge at once?',
			answer:
				'You can add as many PDFs as your browser memory allows. The file list shows your current order; drag to reorder before merging.'
		},
		{
			question: 'Can I reorder the files before merging?',
			answer:
				'Yes. Once you add two or more files, a drag-and-drop list appears so you can set the exact order before clicking Merge.'
		},
		{
			question: 'Will the merged PDF preserve bookmarks, links, and form fields?',
			answer:
				'The merger uses pdf-lib, which preserves the page content and structure of each document. Complex interactive elements like form fields and JavaScript actions may not survive the merge depending on how they were authored.'
		}
	];
</script>

<ToolShell
	path="/pdf/merge"
	tagline="Combine multiple PDF files into one document. Drag to reorder, then download."
	seoTitle="Merge PDF Files Free — No Upload, No Signup | nah.tools"
	description="Merge multiple PDF files into one. Free, no upload — files are combined in your browser. Drag to reorder before merging."
	{faqs}
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
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
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

		{#if lastResult}
			<NextSteps path="/pdf/merge" resultBytes={() => lastResult?.bytes ?? null} resultName={lastResult.name} />
		{/if}

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Why merge PDFs in your browser?</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Most PDF merger tools work by uploading your files to a remote server, processing them there,
				and sending the result back. That means your documents — contracts, reports, tax forms — pass
				through a third-party system you have no visibility into.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool does the opposite. When you click Merge, your browser reads the files directly from
				disk, combines them using the <strong class="font-medium text-text">pdf-lib</strong> library running
				locally in JavaScript, and offers the result as a download. Nothing is transmitted. The merge
				completes in seconds on any modern device.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				You can merge invoices, scanned documents, presentations exported as PDF, or any combination.
				Add as many files as you need, drag them into the right order, and merge in one click.
			</p>
		</div>
	</section>
</ToolShell>
