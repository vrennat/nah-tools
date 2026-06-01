<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import { generateFavicons, FAVICON_SIZES, type FaviconBundle } from '$photo/favicon';
	import { downloadBlob } from '$qr/exporter';

	type PageState = 'idle' | 'loaded' | 'generating' | 'result';

	let pageState: PageState = $state('idle');
	let error = $state('');
	let file: File | null = $state(null);
	let img: HTMLImageElement | null = $state(null);
	let originalSrc = $state('');
	let transparent = $state(true);
	let background = $state('#ffffff');
	let bundle: FaviconBundle | null = $state(null);

	async function handleImage(f: File) {
		error = '';
		file = f;
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		originalSrc = URL.createObjectURL(f);
		const image = new Image();
		image.src = originalSrc;
		try {
			await image.decode();
			img = image;
			pageState = 'loaded';
		} catch {
			error = 'Could not load this image.';
		}
	}

	async function generate() {
		if (!img) return;
		error = '';
		pageState = 'generating';
		try {
			revokePreviews();
			bundle = await generateFavicons(img, transparent ? null : background);
			pageState = 'result';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Generation failed.';
			pageState = 'loaded';
		}
	}

	function downloadZip() {
		if (!bundle) return;
		downloadBlob(bundle.zip, 'favicons.zip');
	}

	function revokePreviews() {
		bundle?.previews.forEach((p) => URL.revokeObjectURL(p.url));
	}

	function reset() {
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		revokePreviews();
		originalSrc = '';
		file = null;
		img = null;
		bundle = null;
		pageState = 'idle';
		error = '';
	}

	onDestroy(() => {
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		revokePreviews();
	});
</script>

<svelte:head>
	<title>Favicon Generator — Make a Favicon &amp; App Icons from an Image | nah</title>
	<meta
		name="description"
		content="Turn any image into a multi-size favicon.ico plus a full PNG icon set (16, 32, 48, 64, 128, 256) and Apple touch icon. Free, no upload — runs in your browser."
	/>
	<link rel="canonical" href="https://nah.tools/photo/favicon" />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<div class="text-center">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl md:text-5xl">
			Favicon <span class="text-accent">Generator</span>
		</h1>
		<p class="mt-2 text-text-muted">
			One image in, a complete favicon set out. Everything runs in your browser.
		</p>
	</div>

	{#if error}
		<div class="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>
	{/if}

	{#if pageState === 'idle'}
		<ImageDropzone onimage={handleImage} />
		<p class="text-center text-xs text-text-muted">Tip: a square image at least 256×256 px works best.</p>
	{/if}

	{#if pageState === 'loaded' || pageState === 'generating'}
		<div class="space-y-4">
			<div class="overflow-hidden rounded-lg border border-border bg-surface-alt">
				<img src={originalSrc} alt="Source" class="mx-auto max-h-64 object-contain" />
			</div>

			<div class="space-y-3 rounded-lg border border-border bg-surface-alt p-4">
				<label class="flex items-center gap-3 text-sm">
					<input type="checkbox" bind:checked={transparent} class="accent-accent" />
					<span class="text-text">Keep transparency</span>
				</label>
				{#if !transparent}
					<label class="flex items-center gap-3 text-sm">
						<span class="text-text-muted">Background color</span>
						<input type="color" bind:value={background} class="h-8 w-12 rounded border border-border" />
					</label>
				{/if}
				<p class="text-xs text-text-muted">
					Apple touch icons are always rendered on a solid background (Safari ignores transparency).
				</p>
			</div>

			<button
				type="button"
				onclick={generate}
				disabled={pageState === 'generating'}
				class="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
			>
				{#if pageState === 'generating'}
					<span class="inline-flex items-center gap-2">
						<span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
						Generating...
					</span>
				{:else}
					Generate favicons
				{/if}
			</button>

			{#if pageState !== 'generating'}
				<button
					type="button"
					onclick={reset}
					class="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-muted transition-colors hover:bg-surface-alt"
				>
					Choose another image
				</button>
			{/if}
		</div>
	{/if}

	{#if pageState === 'result' && bundle}
		<div class="space-y-4">
			<div class="flex flex-wrap items-end justify-center gap-4 rounded-lg border border-border bg-surface-alt p-6">
				{#each bundle.previews as preview}
					<div class="flex flex-col items-center gap-1.5">
						<img
							src={preview.url}
							alt="{preview.size}px icon"
							width={Math.min(preview.size, 96)}
							height={Math.min(preview.size, 96)}
							class="rounded border border-border"
							style="image-rendering: {preview.size <= 48 ? 'pixelated' : 'auto'};"
						/>
						<span class="font-mono text-xs text-text-muted">{preview.size}px</span>
					</div>
				{/each}
			</div>

			<div class="rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-text-muted">
				ZIP includes <span class="font-mono text-text">favicon.ico</span>, PNGs at {FAVICON_SIZES.join(', ')} + 192px, an Apple touch icon, <span class="font-mono text-text">site.webmanifest</span>, and an HTML snippet.
			</div>

			<div class="flex flex-col gap-2 sm:flex-row">
				<button
					type="button"
					onclick={downloadZip}
					class="flex-1 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
				>
					Download favicons.zip
				</button>
				<button
					type="button"
					onclick={reset}
					class="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted transition-colors hover:bg-surface-alt"
				>
					Start over
				</button>
			</div>
		</div>
	{/if}
</div>
