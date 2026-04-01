<script lang="ts">
	import { convertFile } from '$convert/client';
	import type { ConversionPair, ConversionResult } from '$convert/types';
	import FileDropZone from '$components/pdf/FileDropZone.svelte';

	let { pair } = $props<{ pair: ConversionPair }>();

	let files = $state<File[]>([]);
	let processing = $state(false);
	let quality = $state(85);

	$effect(() => {
		quality = pair.defaultQuality;
	});
	let results = $state<ConversionResult[]>([]);
	let error = $state('');
	let progress = $state({ current: 0, total: 0 });

	let canConvert = $derived(files.length > 0 && !processing);

	async function convertFiles() {
		if (!canConvert) return;
		processing = true;
		error = '';
		results = [];
		progress = { current: 0, total: files.length };

		try {
			for (const file of files) {
				const result = await convertFile(file, pair.targetCodec, quality);
				results = [...results, result];
				progress = { current: progress.current + 1, total: progress.total };
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Conversion failed';
		} finally {
			processing = false;
		}
	}

	function downloadFile(result: ConversionResult) {
		const url = URL.createObjectURL(result.blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = result.filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function downloadAll() {
		if (results.length === 0) return;

		const JSZip = await import('jszip');
		const zip = new JSZip.default();

		for (const result of results) {
			zip.file(result.filename, result.blob);
		}

		const blob = await zip.generateAsync({ type: 'blob' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `converted-images.zip`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function formatPercent(reduction: number): string {
		return `${reduction > 0 ? '-' : '+'}${Math.abs(reduction).toFixed(0)}%`;
	}
</script>

<div class="space-y-8">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			{pair.title}
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">{pair.description}</p>
		<p class="mt-4 text-sm text-text-muted">
			<svg
				class="mr-1 inline-block h-3.5 w-3.5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
			Files never leave your device — 100% client-side
		</p>
	</section>

	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone
				accept={pair.sourceExtensions}
				multiple={true}
				bind:files
				label="Drop {pair.sourceFormat} files here or click to browse"
			/>

			{#if pair.supportsQuality}
				<div class="mt-6 space-y-3 border-t border-border pt-6">
					<label for="quality" class="block text-sm font-medium text-text">
						Quality: {quality}%
					</label>
					<input
						id="quality"
						type="range"
						min="1"
						max="100"
						bind:value={quality}
						disabled={processing}
						class="w-full cursor-pointer accent-accent"
					/>
					<p class="text-xs text-text-muted">
						Higher quality = larger file size. Recommended: 75-85
					</p>
				</div>
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			{#if processing}
				<div class="mt-4 space-y-2">
					<div class="flex items-center justify-between">
						<p class="text-sm font-medium text-text">Converting...</p>
						<p class="text-xs text-text-muted">
							{progress.current} of {progress.total}
						</p>
					</div>
					<div class="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
						<div
							class="h-full bg-accent transition-all"
							style="width: {(progress.current / progress.total) * 100}%"
						></div>
					</div>
				</div>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canConvert}
					onclick={convertFiles}
				>
					{#if processing}
						Converting...
					{:else if files.length === 0}
						Select files to convert
					{:else}
						Convert {files.length} {files.length === 1 ? 'File' : 'Files'}
					{/if}
				</button>
			</div>
		</div>

		{#if results.length > 0}
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold text-text">Conversion Results</h2>
					{#if results.length > 1}
						<button
							type="button"
							onclick={downloadAll}
							class="rounded-full bg-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
						>
							Download All as ZIP
						</button>
					{/if}
				</div>

				<ul class="space-y-3">
					{#each results as result}
						<li
							class="flex items-center justify-between rounded-lg border border-border bg-surface-alt p-4"
						>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium text-text">{result.filename}</p>
								<div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
									<span>{formatSize(result.originalSize)}</span>
									<span>→</span>
									<span>{formatSize(result.convertedSize)}</span>
									<span
										class={formatPercent(
											((result.originalSize - result.convertedSize) / result.originalSize) * 100
										).startsWith('-')
											? 'text-error'
											: 'text-success'}
									>
										{formatPercent(
											((result.originalSize - result.convertedSize) / result.originalSize) * 100
										)}
									</span>
								</div>
							</div>
							<button
								type="button"
								onclick={() => downloadFile(result)}
								class="ml-4 flex-shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
							>
								Download
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<p class="text-center text-xs text-text-muted">
			<a href="/convert" class="underline hover:text-accent">Back to all converters</a>
		</p>
	</section>
</div>
