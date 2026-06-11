<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import ToolShell from '$components/ToolShell.svelte';
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

	const faqs = [
		{
			question: 'What files are included in the downloaded ZIP?',
			answer:
				'The ZIP contains: favicon.ico (multi-size ICO with 16, 32, 48, 64, 128, 256 px layers), individual PNG files at each of those sizes plus 192 px, an Apple touch icon (180 px, solid background), a site.webmanifest file, and an HTML snippet showing the link tags to add to your page.'
		},
		{
			question: 'What image should I start with?',
			answer:
				'A square image at least 256x256 pixels works best. SVG sources are ideal because they scale without loss. For raster sources, use the highest-resolution version you have — the tool will downsample cleanly. Avoid rectangular images; the generator crops to a square centered on the image.'
		},
		{
			question: 'Why does the Apple touch icon always have a solid background?',
			answer:
				'Safari ignores transparency in touch icons and fills transparent areas with black. The generator renders Apple touch icons on a solid background (white by default, or your chosen color) to prevent this from looking broken on iOS home screens.'
		},
		{
			question: 'Does this support transparent favicons?',
			answer:
				'Yes. When "Keep transparency" is checked, PNG files and the ICO layers preserve alpha transparency. Browsers that support transparent favicons (Chrome, Firefox, Edge) will display them correctly. Only the Apple touch icon is forced opaque, as noted above.'
		},
		{
			question: 'Are my images uploaded?',
			answer:
				'No. The entire generation pipeline — canvas resizing, ICO encoding, PNG generation, ZIP packaging — runs in your browser. Nothing is uploaded to any server.'
		}
	];
</script>

<ToolShell
	path="/photo/favicon"
	tagline="Turn any image into a complete favicon set: multi-size .ico, PNG icons, Apple touch icon, and a site.webmanifest."
	seoTitle="Favicon Generator — Free Multi-Size favicon.ico & Icon Set | nah.tools"
	description="Generate a complete favicon set from any image: multi-size favicon.ico (16–256 px), PNG icons, Apple touch icon, and site.webmanifest. Free, no upload."
	{faqs}
>
	<section class="mx-auto max-w-3xl space-y-6">
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

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">A complete favicon set from one image</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Modern browsers and devices request favicons at many different sizes. Desktop browsers display a 16 or 32 px icon in the tab bar. Progressive web apps need 192 px and 512 px PNGs declared in the web manifest. iOS home screens request the Apple touch icon at 180 px. Windows tiles use their own sizes. Providing only a single 32 px ICO misses most of these use cases.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool generates the full set from a single source image. The ICO file bundles six sizes into one file (16, 32, 48, 64, 128, 256 px) — browsers pick the best size automatically. Individual PNG files cover 192 px for web app manifests. The Apple touch icon is rendered on a solid background to avoid the black-fill bug in Safari. A ready-to-paste HTML snippet and a site.webmanifest are included so you can drop everything in place without further editing.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				All generation runs in your browser using the Canvas API and a JavaScript ICO encoder. Nothing is uploaded.
			</p>
		</div>
	</section>
</ToolShell>
