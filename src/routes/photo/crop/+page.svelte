<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import { CROP_PRESETS, cropToPreset, getCropPreset, type CropPreset } from '$photo/crop';
	import { canvasToBlob } from '$photo/canvas-utils';
	import { downloadBlob } from '$qr/exporter';

	type PageState = 'idle' | 'loaded';

	let pageState: PageState = $state('idle');
	let error = $state('');
	let file: File | null = $state(null);
	let img: HTMLImageElement | null = $state(null);
	let originalSrc = $state('');
	let presetId = $state(CROP_PRESETS[0].id);
	let focusX = $state(0.5);
	let focusY = $state(0.5);
	let previewSrc = $state('');
	let exporting = $state(false);

	const preset = $derived(getCropPreset(presetId) as CropPreset);

	// Group presets by platform for the picker.
	const grouped = CROP_PRESETS.reduce<Record<string, CropPreset[]>>((acc, p) => {
		(acc[p.platform] ??= []).push(p);
		return acc;
	}, {});

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
			renderPreview();
		} catch {
			error = 'Could not load this image.';
		}
	}

	function renderPreview() {
		if (!img) return;
		const canvas = cropToPreset(img, preset, focusX, focusY);
		canvas.toBlob((blob) => {
			if (!blob) return;
			if (previewSrc) URL.revokeObjectURL(previewSrc);
			previewSrc = URL.createObjectURL(blob);
		}, 'image/png');
	}

	// Re-render whenever the crop inputs change.
	$effect(() => {
		// Touch reactive deps so the effect re-runs.
		void presetId;
		void focusX;
		void focusY;
		if (pageState === 'loaded') renderPreview();
	});

	async function download() {
		if (!img) return;
		exporting = true;
		try {
			const canvas = cropToPreset(img, preset, focusX, focusY);
			const blob = await canvasToBlob(canvas, 'image/png');
			const base = file?.name.replace(/\.[^.]+$/, '') ?? 'cropped';
			downloadBlob(blob, `${base}_${preset.width}x${preset.height}.png`);
		} catch {
			error = 'Could not export the cropped image.';
		} finally {
			exporting = false;
		}
	}

	function reset() {
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		if (previewSrc) URL.revokeObjectURL(previewSrc);
		originalSrc = '';
		previewSrc = '';
		file = null;
		img = null;
		pageState = 'idle';
		error = '';
		focusX = 0.5;
		focusY = 0.5;
	}

	onDestroy(() => {
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		if (previewSrc) URL.revokeObjectURL(previewSrc);
	});

	const faqs = [
		{
			question: 'Which social media sizes are supported?',
			answer:
				'Presets cover the major platforms: Instagram (square 1080x1080, portrait 1080x1350, landscape 1080x566), Twitter/X (post 1600x900, profile 400x400), LinkedIn (post 1200x627, banner 1584x396), YouTube (thumbnail 1280x720), and Facebook (post 1200x630). Exact dimensions match each platform\'s recommended specs.'
		},
		{
			question: 'How does the focus point control work?',
			answer:
				'The horizontal and vertical sliders set the focal point within the source image. The crop is centered on that point. Moving the horizontal slider left or right shifts the visible area; the vertical slider does the same on the Y axis. This lets you control which part of a wide photo stays in frame when cropping to a taller aspect ratio, and vice versa.'
		},
		{
			question: 'Are my images uploaded?',
			answer:
				'No. Cropping runs entirely in your browser using the HTML Canvas API. Nothing leaves your device. The preview and download are both generated locally.'
		},
		{
			question: 'What format is the downloaded crop?',
			answer:
				'Downloads are PNG. PNG is lossless and is universally accepted by social media upload forms. If you need a smaller file for upload, compress the PNG to WebP or JPEG first using the image compression tool.'
		},
		{
			question: 'Can I crop to a custom size?',
			answer:
				'Currently the tool only supports the preset dimensions listed by platform. If you need a custom aspect ratio or pixel size, use the crop tool in your photo editor of choice and then compress the result here.'
		}
	];
</script>

<ToolShell
	path="/photo/crop"
	tagline="Pixel-perfect crops for Instagram, Twitter, LinkedIn, YouTube, and more — pick a preset and download."
	seoTitle="Social Media Image Crop Tool — Instagram, Twitter, LinkedIn | nah.tools"
	description="Crop images to exact social media dimensions: Instagram 1080x1080, Twitter 1600x900, LinkedIn 1200x627, YouTube 1280x720, and more. Free, no upload."
	{faqs}
>
	<section class="mx-auto max-w-3xl space-y-6">
		{#if error}
			<div class="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>
		{/if}

		{#if pageState === 'idle'}
			<ImageDropzone onimage={handleImage} />
		{/if}

		{#if pageState === 'loaded'}
			<div class="space-y-4">
				<div class="space-y-3 rounded-lg border border-border bg-surface-alt p-4">
					<span class="text-sm font-medium text-text">Preset</span>
					<div class="space-y-3">
						{#each Object.entries(grouped) as [platform, presets]}
							<div>
								<p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">{platform}</p>
								<div class="flex flex-wrap gap-2">
									{#each presets as p}
										<button
											type="button"
											onclick={() => (presetId = p.id)}
											class="rounded-lg border px-3 py-1.5 text-xs transition-colors {presetId === p.id ? 'border-accent bg-accent/5 text-accent' : 'border-border text-text-muted hover:border-accent/50'}"
										>
											{p.label}
											<span class="ml-1 font-mono opacity-70">{p.width}×{p.height}</span>
										</button>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="overflow-hidden rounded-lg border border-border bg-surface-alt">
					{#if previewSrc}
						<img src={previewSrc} alt="Crop preview" class="mx-auto max-h-96 object-contain" />
					{/if}
					<div class="border-t border-border px-4 py-2 text-center text-xs text-text-muted">
						Output: {preset.width} × {preset.height} px
					</div>
				</div>

				<div class="grid gap-4 rounded-lg border border-border bg-surface-alt p-4 sm:grid-cols-2">
					<label class="space-y-1.5">
						<span class="text-xs font-medium text-text">Horizontal position</span>
						<input type="range" min="0" max="1" step="0.01" bind:value={focusX} class="w-full accent-accent" />
					</label>
					<label class="space-y-1.5">
						<span class="text-xs font-medium text-text">Vertical position</span>
						<input type="range" min="0" max="1" step="0.01" bind:value={focusY} class="w-full accent-accent" />
					</label>
				</div>

				<div class="flex flex-col gap-2 sm:flex-row">
					<button
						type="button"
						onclick={download}
						disabled={exporting}
						class="flex-1 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
					>
						{exporting ? 'Exporting...' : `Download ${preset.width}×${preset.height} PNG`}
					</button>
					<button
						type="button"
						onclick={reset}
						class="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted transition-colors hover:bg-surface-alt"
					>
						Choose another image
					</button>
				</div>
			</div>
		{/if}

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Why exact dimensions matter for social media</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Every social platform displays images at specific aspect ratios and resamples anything that does not match. If you post a landscape photo to Instagram without cropping, the platform fills the missing area with white or crops from the center — you have no control over what gets cut. Providing the exact target dimensions prevents resampling artifacts and lets you choose the focal point.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool generates crops at the canonical recommended dimensions for each platform. The focus-point sliders let you choose what part of the image stays in frame when the source aspect ratio differs from the target. The preview updates in real time as you adjust. When you are satisfied, download exports a lossless PNG at the exact target resolution.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Everything runs in your browser using the HTML Canvas API. No images are uploaded, and there is no file size limit.
			</p>
		</div>
	</section>
</ToolShell>
