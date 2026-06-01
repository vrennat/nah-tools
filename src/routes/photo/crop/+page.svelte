<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
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
</script>

<svelte:head>
	<title>Crop Images for Social Media — Instagram, Twitter, LinkedIn, YouTube | nah</title>
	<meta
		name="description"
		content="Crop any image to exact social media dimensions: Instagram 1080x1080, Twitter 1600x900, LinkedIn 1200x627, YouTube 1280x720, and more. Free, no upload."
	/>
	<link rel="canonical" href="https://nah.tools/photo/crop" />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<div class="text-center">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl md:text-5xl">
			Crop for <span class="text-accent">Social Media</span>
		</h1>
		<p class="mt-2 text-text-muted">
			Pick a platform preset and get a pixel-perfect crop. Everything runs in your browser.
		</p>
	</div>

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
</div>
