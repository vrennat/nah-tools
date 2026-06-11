<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';

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
			const { mergePPTX } = await import('$pptx/processor');
			const { downloadPPTX, makeFilename } = await import('$pptx/exporter');

			const buffers = await Promise.all(files.map((f) => f.arrayBuffer()));
			const result = await mergePPTX(buffers, (current, total) => {
				progress = { current, total };
			});

			downloadPPTX(result, makeFilename('merged', 'pptx'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to merge presentations';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'Are my files uploaded to a server when I merge presentations?',
			answer:
				'No. All merging happens directly in your browser using JavaScript. Your files never leave your device — no uploads, no server, no account required.'
		},
		{
			question: 'Why might fonts or colours look different in the merged deck?',
			answer:
				'This is a known limitation. The merge copies slide XML from each source file but does not copy slide layouts, masters, or themes from non-base decks. All imported slides are remapped to the first file\'s default layout. Fonts, colours, and complex placeholder arrangements from other files may shift or be replaced. For best results, ensure all files share the same theme before merging.'
		},
		{
			question: 'Can I reorder files before merging?',
			answer:
				'Yes. Once you add two or more files, a drag-and-drop list appears so you can set the exact output order before clicking Merge.'
		},
		{
			question: 'How many presentations can I merge at once?',
			answer:
				'There is no hard limit. You can add as many PPTX files as your browser memory allows. Very large decks combined may slow down or exhaust memory on low-RAM devices, but the tool imposes no cap.'
		},
		{
			question: 'Will speaker notes from all files be included?',
			answer:
				'Speaker notes attached to slides in the base (first) file are preserved. Notes from slides in subsequent files are removed during the merge because their notesSlide relationships are stripped when the slides are imported. If preserving notes is important, merge files first and then add notes manually.'
		}
	];
</script>

<ToolShell
	path="/pptx/merge"
	tagline="Combine multiple PowerPoint files into one deck. Drag to reorder, then download."
	seoTitle="Merge PowerPoint Files Free — No Upload | nah.tools"
	description="Merge multiple PowerPoint presentations into one PPTX. Free, no upload — files are combined in your browser. Drag to reorder before merging."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pptx" multiple={true} bind:files label="Drop PPTX files here or click to browse" />

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
						Add at least 2 PPTX files to merge
					{:else}
						Merge {files.length} Presentations
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Why merge presentations in your browser?</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Assembling a presentation from multiple decks is a common task before board meetings, client
				pitches, or training sessions. Most online tools solve this by uploading your files to a
				server — which means your slides, speaker notes, and embedded data pass through infrastructure
				you have no visibility into.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool merges PPTX files entirely in your browser. When you click Merge, JavaScript reads
				each file directly from disk, stitches the slide XML together using JSZip, and offers the
				result as a download. Nothing is transmitted. The output is a valid PPTX that opens in
				PowerPoint, Keynote, Google Slides, and LibreOffice.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				One caveat worth knowing: the merger copies slide content but remaps all slides to the first
				file's slide master. If your decks use different themes or font sets, the merged output will
				adopt the base deck's styling. For best results, use files that already share the same theme,
				or accept that a formatting pass may be needed after merging.
			</p>
		</div>
	</section>
</ToolShell>
