<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';

	let files = $state<File[]>([]);
	let quality = $state(0.7);
	let processing = $state(false);
	let error = $state('');
	let result = $state<{ originalSize: number; newSize: number; imagesCompressed: number } | null>(null);

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

		try {
			const { compressPPTX } = await import('$pptx/processor');
			const { downloadPPTX, makeFilename } = await import('$pptx/exporter');

			const buf = await file.arrayBuffer();
			const compressed = await compressPPTX(buf, quality);

			result = {
				originalSize: compressed.originalSize,
				newSize: compressed.newSize,
				imagesCompressed: compressed.imagesCompressed
			};
			downloadPPTX(compressed.data, makeFilename('compressed', 'pptx'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to compress presentation';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'Are my files uploaded to compress the presentation?',
			answer:
				'No. Compression runs entirely in your browser. The PPTX is processed in memory and offered as a download — nothing leaves your device.'
		},
		{
			question: 'What does the compressor actually do to reduce file size?',
			answer:
				'Three things: it re-encodes JPEG images at your chosen quality level (defaulting to 70%), removes the embedded preview thumbnail stored at docProps/thumbnail.jpeg, and re-zips the archive at maximum DEFLATE compression. PNG images are skipped because canvas re-encoding ignores the quality parameter and typically produces larger files than the originals.'
		},
		{
			question: 'Why is my file barely smaller after compression?',
			answer:
				'If the presentation contains mostly text, shapes, or charts with no embedded images, there is little for the compressor to work with. The thumbnail removal and re-compression of the ZIP container may still produce a small reduction, but image-heavy decks see the most benefit.'
		},
		{
			question: 'Will compression affect how the presentation looks?',
			answer:
				'At 70% quality the difference is rarely visible on a projected slide. At lower quality settings, heavy photographic content may show JPEG artifacts when zoomed in closely. The presentation structure, text, fonts, and vector graphics are never altered.'
		},
		{
			question: 'What is the quality slider range?',
			answer:
				'The slider goes from 30% (smallest file, visible quality loss) to 95% (near lossless, minimal size reduction). The default of 70% is a reasonable balance for most presentation use cases.'
		}
	];
</script>

<ToolShell
	path="/pptx/compress"
	tagline="Shrink oversized presentations by recompressing images and stripping thumbnail data."
	seoTitle="Compress PowerPoint Free — Reduce PPTX Size | nah.tools"
	description="Reduce PowerPoint file size by compressing embedded images and stripping unnecessary data. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pptx" bind:files label="Drop a PPTX file here or click to browse" />

			{#if file}
				<div class="mt-4">
					<label for="quality" class="mb-1 block text-sm font-medium text-text">
						Image quality: {Math.round(quality * 100)}%
					</label>
					<input
						id="quality"
						type="range"
						min="0.3"
						max="0.95"
						step="0.05"
						bind:value={quality}
						class="w-full accent-accent"
					/>
					<div class="mt-1 flex justify-between text-xs text-text-muted">
						<span>Smaller file</span>
						<span>Better quality</span>
					</div>
				</div>
			{/if}

			{#if result}
				<div class="mt-4 rounded-lg bg-success/10 px-4 py-3">
					<p class="text-sm font-medium text-success">
						{formatSize(result.originalSize)} → {formatSize(result.newSize)}
						({Math.round((1 - result.newSize / result.originalSize) * 100)}% reduction)
					</p>
					{#if result.imagesCompressed > 0}
						<p class="mt-1 text-xs text-success/80">
							{result.imagesCompressed} image{result.imagesCompressed === 1 ? '' : 's'} compressed
						</p>
					{/if}
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
						Upload a PPTX to compress
					{:else}
						Compress & Download
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Why presentations get large — and how to shrink them</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				PowerPoint files accumulate size from three main sources: high-resolution photos pasted
				directly from a camera or stock library, a hidden preview thumbnail PowerPoint saves inside
				the file for Windows Explorer previews, and inefficient ZIP compression on the internal XML
				and asset files.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool addresses all three. JPEG images are re-encoded at your chosen quality level —
				at 70%, a 4 MB photo typically shrinks to under 500 KB with no perceptible difference on a
				projected slide. The thumbnail file is deleted. And the entire archive is repackaged at
				maximum DEFLATE compression. The resulting file opens normally in PowerPoint, Keynote,
				and Google Slides.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Because everything runs in your browser, your deck — including any confidential charts,
				customer logos, or unreleased product screenshots — never leaves your device during
				processing.
			</p>
		</div>
	</section>
</ToolShell>
