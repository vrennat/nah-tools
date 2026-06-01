<script lang="ts">
	import { optimizeSvg, DEFAULT_OPTIONS, type SvgOptimizeResult, type SvgOptimizeOptions } from '$photo/svg-optimize';
	import { downloadBlob } from '$qr/exporter';
	import CopyButton from '$components/dev/CopyButton.svelte';

	let input = $state('');
	let filename = $state('optimized.svg');
	let error = $state('');
	let options = $state<SvgOptimizeOptions>({ ...DEFAULT_OPTIONS });
	let roundEnabled = $state(true);
	let fileInput: HTMLInputElement | null = $state(null);
	let isDragging = $state(false);

	const result = $derived.by<SvgOptimizeResult | null>(() => {
		if (!input.trim()) return null;
		try {
			const opts = { ...options, roundPrecision: roundEnabled ? options.roundPrecision : null };
			return optimizeSvg(input, opts);
		} catch {
			return null;
		}
	});

	const parseError = $derived(input.trim() !== '' && result === null);
	const savings = $derived(
		result && result.originalSize > 0
			? Math.round((1 - result.resultSize / result.originalSize) * 100)
			: 0
	);

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		return `${(bytes / 1024).toFixed(1)} KB`;
	}

	async function loadFile(file: File) {
		error = '';
		if (!/\.svg$/i.test(file.name) && file.type !== 'image/svg+xml') {
			error = 'Please choose an SVG file.';
			return;
		}
		filename = file.name.replace(/\.svg$/i, '') + '.min.svg';
		input = await file.text();
	}

	function handleInputChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) loadFile(file);
		(e.target as HTMLInputElement).value = '';
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) loadFile(file);
	}

	function download() {
		if (!result) return;
		downloadBlob(new Blob([result.output], { type: 'image/svg+xml' }), filename);
	}
</script>

<svelte:head>
	<title>SVG Optimizer &amp; Minifier — Shrink SVG Files Free | nah</title>
	<meta
		name="description"
		content="Optimize and minify SVG files: remove editor metadata, comments, and whitespace, and round coordinates. Free, no upload — runs entirely in your browser."
	/>
	<link rel="canonical" href="https://nah.tools/photo/svg-optimize" />
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<div class="text-center">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl md:text-5xl">
			SVG <span class="text-accent">Optimizer</span>
		</h1>
		<p class="mt-2 text-text-muted">
			Strip metadata and minify SVG markup. Everything runs in your browser.
		</p>
	</div>

	{#if error}
		<div class="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>
	{/if}

	<!-- Drop / file picker -->
	<div
		class="rounded-xl border-2 border-dashed p-6 text-center transition-colors {isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}"
		ondrop={handleDrop}
		ondragover={(e) => { e.preventDefault(); isDragging = true; }}
		ondragleave={() => (isDragging = false)}
		role="button"
		tabindex="0"
	>
		<input bind:this={fileInput} type="file" accept=".svg,image/svg+xml" class="hidden" onchange={handleInputChange} />
		<button type="button" onclick={() => fileInput?.click()} class="text-sm font-medium text-text">
			Drop an SVG file here or click to browse
		</button>
		<p class="mt-1 text-xs text-text-muted">…or paste markup below.</p>
	</div>

	<!-- Options -->
	<div class="grid gap-2 rounded-lg border border-border bg-surface-alt p-4 sm:grid-cols-2">
		<label class="flex items-center gap-2.5 text-sm">
			<input type="checkbox" bind:checked={options.removeEditorData} class="accent-accent" />
			<span class="text-text">Remove editor data (Inkscape, etc.)</span>
		</label>
		<label class="flex items-center gap-2.5 text-sm">
			<input type="checkbox" bind:checked={options.removeMetadata} class="accent-accent" />
			<span class="text-text">Remove metadata &amp; descriptions</span>
		</label>
		<label class="flex items-center gap-2.5 text-sm">
			<input type="checkbox" bind:checked={options.removeComments} class="accent-accent" />
			<span class="text-text">Remove comments</span>
		</label>
		<label class="flex items-center gap-2.5 text-sm">
			<input type="checkbox" bind:checked={options.collapseWhitespace} class="accent-accent" />
			<span class="text-text">Collapse whitespace</span>
		</label>
		<label class="flex items-center gap-2.5 text-sm">
			<input type="checkbox" bind:checked={options.removeTitle} class="accent-accent" />
			<span class="text-text">Remove &lt;title&gt; (hurts a11y)</span>
		</label>
		<label class="flex items-center gap-2.5 text-sm">
			<input type="checkbox" bind:checked={roundEnabled} class="accent-accent" />
			<span class="text-text">Round numbers to {options.roundPrecision} decimals</span>
		</label>
	</div>

	<!-- Input / output -->
	<div class="grid gap-4 lg:grid-cols-2">
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-text">Input SVG</span>
				{#if input}
					<button type="button" onclick={() => (input = '')} class="text-xs font-medium text-text-muted hover:text-accent">Clear</button>
				{/if}
			</div>
			<textarea
				bind:value={input}
				spellcheck="false"
				placeholder="<svg ...>...</svg>"
				class="h-72 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				class:border-error={parseError}
			></textarea>
		</div>

		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-text">Optimized</span>
				{#if result}
					<CopyButton text={() => result.output} small />
				{/if}
			</div>
			<textarea
				readonly
				value={result?.output ?? ''}
				placeholder="Optimized output appears here"
				class="h-72 w-full resize-y rounded-lg border border-border bg-surface-alt px-3 py-2 font-mono text-xs text-text-muted focus:outline-none"
			></textarea>
		</div>
	</div>

	{#if parseError}
		<div class="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
			Could not parse this as valid SVG. Check the markup.
		</div>
	{/if}

	{#if result}
		<div class="flex flex-col items-center justify-between gap-4 rounded-lg border border-border bg-surface-alt p-4 sm:flex-row">
			<div class="flex items-center gap-4 text-sm">
				<span class="text-text-muted">{formatSize(result.originalSize)}</span>
				<svg class="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
				<span class="font-medium text-text">{formatSize(result.resultSize)}</span>
				{#if savings > 0}
					<span class="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">−{savings}%</span>
				{/if}
			</div>
			<button
				type="button"
				onclick={download}
				class="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:w-auto"
			>
				Download SVG
			</button>
		</div>
	{/if}
</div>
