<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PptxToolLayout from '$components/pptx/PptxToolLayout.svelte';

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
</script>

<svelte:head>
	<title>Compress PowerPoint Online Free — Reduce PPTX Size | nah</title>
	<meta
		name="description"
		content="Reduce PowerPoint file size by compressing embedded images and stripping unnecessary data. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PptxToolLayout
	title="Compress PPTX"
	description="Reduce file size by compressing images and removing unnecessary data."
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
				<div role="alert" class="mt-4 rounded-lg bg-success/10 px-3 py-2">
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
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
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

		<p class="text-center text-xs text-text-muted">
			<a href="/pptx" class="underline hover:text-accent">Back to all PowerPoint tools</a>
		</p>
	</section>
</PptxToolLayout>
