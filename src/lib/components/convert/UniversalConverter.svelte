<script lang="ts">
	import { convertFile } from '$convert/client';
	import {
		allSourceExtensions,
		commonTargets,
		detectSourceFormat,
		resolvePair,
		resolveSourceMime
	} from '$convert/detect';
	import type { ConversionResult } from '$convert/types';
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ConversionResults from './ConversionResults.svelte';

	let files = $state<File[]>([]);
	let selectedTarget = $state<string | null>(null);
	let quality = $state(85);
	let processing = $state(false);
	let results = $state<ConversionResult[]>([]);
	let error = $state('');
	let progress = $state({ current: 0, total: 0 });

	const sourceFormats = $derived(
		[...new Set(files.map((f) => detectSourceFormat(f.name)))].filter(
			(f): f is string => f !== null
		)
	);
	const targets = $derived(commonTargets(sourceFormats));

	// Keep the target selection valid as files come and go; auto-select when
	// there is only one possible target (e.g. TIFF can only become JPG).
	$effect(() => {
		if (selectedTarget && !targets.includes(selectedTarget)) selectedTarget = null;
		if (!selectedTarget && targets.length === 1) selectedTarget = targets[0];
	});

	// Pair backing the current selection — supplies quality metadata and the
	// permalink to the dedicated SEO page. supportsQuality is a property of the
	// target codec, so any source's pair works for mixed-format batches.
	const activePair = $derived(
		selectedTarget && sourceFormats.length > 0
			? resolvePair(sourceFormats[0], selectedTarget)
			: undefined
	);

	$effect(() => {
		if (activePair) quality = activePair.defaultQuality;
	});

	const canConvert = $derived(files.length > 0 && selectedTarget !== null && !processing);

	async function convertAll() {
		if (!canConvert || !selectedTarget) return;
		processing = true;
		error = '';
		results = [];
		progress = { current: 0, total: files.length };

		try {
			for (const file of files) {
				const source = detectSourceFormat(file.name);
				const pair = source ? resolvePair(source, selectedTarget) : undefined;
				if (!pair) {
					throw new Error(`Cannot convert ${file.name} to ${selectedTarget}`);
				}
				const result = await convertFile(file, pair.targetCodec, quality, resolveSourceMime(file));
				results = [...results, result];
				progress = { ...progress, current: progress.current + 1 };
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
			accept={allSourceExtensions}
			multiple={true}
			bind:files
			label="Drop images here or click to browse"
		/>

		{#if files.length > 0}
			<div class="mt-6 space-y-4 border-t border-border pt-6">
				{#if targets.length === 0}
					<p class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
						These formats have no common target. Convert one format at a time.
					</p>
				{:else}
					<div class="space-y-2">
						<p class="text-sm font-medium text-text">
							Convert {sourceFormats.join(' + ')} to
						</p>
						<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Target format">
							{#each targets as target}
								<button
									type="button"
									role="radio"
									aria-checked={selectedTarget === target}
									disabled={processing}
									class="rounded-full border px-4 py-2 text-sm font-medium transition-colors {selectedTarget ===
									target
										? 'border-accent bg-accent text-white'
										: 'border-border text-text hover:border-accent/50'}"
									onclick={() => (selectedTarget = target)}
								>
									{target}
								</button>
							{/each}
						</div>
					</div>

					{#if activePair?.supportsQuality}
						<div class="space-y-3">
							<label for="hub-quality" class="block text-sm font-medium text-text">
								Quality: {quality}%
							</label>
							<input
								id="hub-quality"
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
				{/if}
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
				onclick={convertAll}
			>
				{#if processing}
					Converting...
				{:else if files.length === 0}
					Drop images to convert
				{:else if !selectedTarget}
					Pick a target format
				{:else}
					Convert {files.length}
					{files.length === 1 ? 'file' : 'files'} to {selectedTarget}
				{/if}
			</button>
		</div>
	</div>

	{#if activePair && sourceFormats.length === 1}
		<p class="text-center text-xs text-text-muted">
			Bookmarkable version:
			<a href="/convert/{activePair.slug}" class="underline hover:text-accent">
				{activePair.sourceFormat} to {activePair.targetFormat} converter
			</a>
		</p>
	{/if}

	<ConversionResults {results} />
</section>
