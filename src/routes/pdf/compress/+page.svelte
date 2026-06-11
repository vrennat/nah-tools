<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import NextSteps from '$components/pdf/NextSteps.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let result = $state<{ originalSize: number; newSize: number } | null>(null);
	let lastResultBytes = $state<{ bytes: Uint8Array; name: string } | null>(null);

	let file = $derived(files[0]);
	let canCompress = $derived(!!file && !processing);

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	async function compress() {
		if (!canCompress || !file) return;
		processing = true;
		error = '';
		result = null;
		lastResultBytes = null;

		try {
			const { compressPDF } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const originalSize = buf.byteLength;
			const compressed = await compressPDF(buf);
			const newSize = compressed.byteLength;

			result = { originalSize, newSize };
			const name = makeFilename('compressed', 'pdf');
			downloadPDF(compressed, name);
			lastResultBytes = { bytes: compressed, name };
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to compress PDF';
		} finally {
			processing = false;
		}
	}

	$effect(() => {
		if (!file) lastResultBytes = null;
	});

	const faqs = [
		{
			question: 'Are my files uploaded to compress a PDF?',
			answer:
				'No. Compression runs entirely in your browser. Your file is never sent to a server — all processing happens locally with JavaScript.'
		},
		{
			question: 'How much will my PDF shrink?',
			answer:
				'This tool performs structural compression: it strips embedded metadata, removes unused objects, and optimizes the PDF structure. This typically achieves 10-30% reduction for text-heavy documents. PDFs dominated by high-resolution images may see little change because the image data itself is not recompressed.'
		},
		{
			question: 'Will compression affect image quality?',
			answer:
				'No. This tool does not recompress or downsample images. It operates on the PDF structure only, so images retain their original quality. For aggressive image recompression you would need a server-side tool.'
		},
		{
			question: 'What is stripped during compression?',
			answer:
				'The compressor removes embedded metadata (author, creation date, software tags), unused object references, and redundant structure. It does not remove content, annotations, or form fields.'
		},
		{
			question: 'Is there a file size limit?',
			answer:
				'No hard limit is enforced. Very large PDFs (multi-hundred MB) may be slow on low-memory devices since the entire file is held in memory during processing.'
		}
	];
</script>

<ToolShell
	path="/pdf/compress"
	tagline="Strip metadata and optimize PDF structure to reduce file size. No upload needed."
	seoTitle="Compress PDF Online Free — Reduce File Size | nah.tools"
	description="Reduce PDF file size by stripping metadata and optimizing structure. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" acceptPendingFile={true} bind:files label="Drop a PDF here or click to browse" />

			<div class="mt-4 rounded-lg border border-border bg-surface-alt px-4 py-3">
				<p class="text-sm text-text-muted">
					Client-side compression strips metadata and optimizes PDF structure. This typically
					achieves 10-30% reduction. For heavy compression of scanned documents (image
					recompression), a server-side tool like Stirling-PDF is needed.
				</p>
			</div>

			{#if result}
				<div class="mt-4 rounded-lg bg-success/10 px-4 py-3">
					<p class="text-sm font-medium text-success">
						{formatSize(result.originalSize)} → {formatSize(result.newSize)}
						({Math.round((1 - result.newSize / result.originalSize) * 100)}% reduction)
					</p>
				</div>
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canCompress}
					onclick={compress}
				>
					{#if processing}
						Compressing...
					{:else if !file}
						Upload a PDF to compress
					{:else}
						Compress PDF
					{/if}
				</button>
			</div>
		</div>

		{#if lastResultBytes}
			<NextSteps path="/pdf/compress" resultBytes={() => lastResultBytes?.bytes ?? null} resultName={lastResultBytes.name} />
		{/if}

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">What client-side PDF compression does</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				PDFs generated by office software often carry significant overhead: author metadata, revision
				history, embedded fonts that could be subsetted, and object cross-reference tables with gaps
				from prior edits. None of this is visible content, but it adds to file size.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool removes that overhead by parsing the PDF structure in your browser and writing a
				clean copy. You typically see 10-30% reduction on office-generated documents. Scanned PDFs
				where most of the size is JPEG or CCITT-compressed image data will see minimal gains because
				the image streams are not touched.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				If you need to compress a scan-heavy PDF substantially, the right tool is one that
				resamples embedded images — that requires heavier processing than a browser can efficiently
				do. For structural bloat, this tool is instant and requires no upload.
			</p>
		</div>
	</section>
</ToolShell>
