<script lang="ts">
	import { convertFile } from '$convert/client';
	import { resolveSourceMime } from '$convert/detect';
	import type { ConversionPair, ConversionResult } from '$convert/types';
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ConversionResults from './ConversionResults.svelte';

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
				const result = await convertFile(file, pair.targetCodec, quality, resolveSourceMime(file));
				results = [...results, result];
				progress = { current: progress.current + 1, total: progress.total };
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Conversion failed';
		} finally {
			processing = false;
		}
	}
</script>

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

	<ConversionResults {results} />
</section>
