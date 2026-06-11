<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import type { PageThumbnail } from '$pdf/types';

	let files = $state<File[]>([]);
	let thumbnails = $state<PageThumbnail[]>([]);
	let rotations = $state<Map<number, number>>(new Map());
	let loading = $state(false);
	let processing = $state(false);
	let error = $state('');

	let file = $derived(files[0]);

	$effect(() => {
		if (!file) {
			thumbnails = [];
			rotations = new Map();
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
			rotations = new Map();
		} catch (e) {
			if (file !== currentFile) return;
			error = e instanceof Error ? e.message : 'Failed to load PDF';
		} finally {
			if (file === currentFile) loading = false;
		}
	}

	function rotatePage(pageIndex: number, degrees: number) {
		const current = rotations.get(pageIndex) ?? 0;
		const newRotation = (current + degrees + 360) % 360;
		const updated = new Map(rotations);
		if (newRotation === 0) {
			updated.delete(pageIndex);
		} else {
			updated.set(pageIndex, newRotation);
		}
		rotations = updated;
	}

	function rotateAll(degrees: number) {
		const updated = new Map<number, number>();
		for (let i = 0; i < thumbnails.length; i++) {
			const current = rotations.get(i) ?? 0;
			const newRotation = (current + degrees + 360) % 360;
			if (newRotation !== 0) {
				updated.set(i, newRotation);
			}
		}
		rotations = updated;
	}

	let hasRotations = $derived(rotations.size > 0);

	async function apply() {
		if (!file || !hasRotations) return;
		processing = true;
		error = '';
		try {
			const { rotatePages } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');
			const buf = await file.arrayBuffer();
			const result = await rotatePages(buf, rotations);
			downloadPDF(result, makeFilename('rotated', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to rotate pages';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'Are my files uploaded to rotate a PDF?',
			answer:
				'No. Rotation is performed entirely in your browser. Your PDF is never sent to a server — pdf-lib runs locally and rewrites the page orientation in memory.'
		},
		{
			question: 'Can I rotate only specific pages instead of the whole document?',
			answer:
				'Yes. After uploading, thumbnails of each page appear. Click the rotate buttons beneath individual pages to set per-page rotations. Use "Rotate all CW/CCW" to apply the same rotation to every page at once.'
		},
		{
			question: 'What rotation increments are supported?',
			answer:
				'Pages can be rotated in 90-degree increments: 90, 180, and 270 degrees. The current rotation is shown on each thumbnail so you can see the pending changes before applying.'
		},
		{
			question: 'Will rotation affect the PDF quality or content?',
			answer:
				'No. Rotation is a metadata change — it updates the page orientation flag without re-rendering or re-encoding the content. Text, images, and vector graphics remain unchanged.'
		},
		{
			question: 'Can I undo a rotation before downloading?',
			answer:
				'Yes. Click the opposite rotate button to return a page to its original orientation. Pages with no rotation applied are not modified when you download.'
		}
	];
</script>

<ToolShell
	path="/pdf/rotate"
	tagline="Rotate all pages or pick individual pages to correct orientation. No upload needed."
	seoTitle="Rotate PDF Pages Free — Fix Orientation Instantly | nah.tools"
	description="Rotate PDF pages. Rotate all or individual pages 90, 180, or 270 degrees. Free, no upload — processed in your browser."
	{faqs}
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
				<div class="mt-4 flex gap-2">
					<button
						type="button"
						class="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt"
						onclick={() => rotateAll(90)}
					>
						Rotate all CW
					</button>
					<button
						type="button"
						class="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt"
						onclick={() => rotateAll(-90)}
					>
						Rotate all CCW
					</button>
				</div>

				<div class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
					{#each thumbnails as thumb}
						{@const rotation = rotations.get(thumb.pageIndex) ?? 0}
						<div class="space-y-1.5">
							<div
								class="relative overflow-hidden rounded-lg border bg-surface-alt {rotation > 0
									? 'border-accent'
									: 'border-border'}"
							>
								<img
									src={thumb.dataUrl}
									alt="Page {thumb.pageIndex + 1}"
									class="w-full transition-transform duration-200"
									style="transform: rotate({rotation}deg)"
								/>
								<span
									class="absolute bottom-1 left-1 rounded bg-brand/70 px-1.5 py-0.5 text-xs font-medium text-white"
								>
									{thumb.pageIndex + 1}
								</span>
								{#if rotation > 0}
									<span
										class="absolute top-1 right-1 rounded bg-accent px-1.5 py-0.5 text-xs font-medium text-white"
									>
										{rotation}°
									</span>
								{/if}
							</div>
							<div class="flex justify-center gap-1">
								<button
									type="button"
									class="rounded border border-border p-1 text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
									aria-label="Rotate page {thumb.pageIndex + 1} counterclockwise"
									onclick={() => rotatePage(thumb.pageIndex, -90)}
								>
									<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
										/>
									</svg>
								</button>
								<button
									type="button"
									class="rounded border border-border p-1 text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
									aria-label="Rotate page {thumb.pageIndex + 1} clockwise"
									onclick={() => rotatePage(thumb.pageIndex, 90)}
								>
									<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
										/>
									</svg>
								</button>
							</div>
						</div>
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
					disabled={!hasRotations || processing}
					onclick={apply}
				>
					{#if processing}
						Applying...
					{:else if !file}
						Upload a PDF
					{:else if !hasRotations}
						Select pages to rotate
					{:else}
						Apply Rotations & Download
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Fixing PDF orientation without re-scanning</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Scanned documents frequently come out sideways or upside down. Presentations exported to PDF
				occasionally end up in the wrong orientation. Mobile phone scans default to portrait even
				when the original was landscape.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool lets you correct those issues without re-scanning or re-exporting. Upload the PDF,
				select the pages that need correction, and choose 90, 180, or 270 degrees. You can rotate
				every page in one click or set different rotations per page for mixed-orientation documents.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Because rotation is a metadata operation rather than a re-render, the output is identical in
				quality to the input. The fix takes seconds regardless of document size.
			</p>
		</div>
	</section>
</ToolShell>
