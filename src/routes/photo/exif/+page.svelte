<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import { readExif, stripJpegMetadata, type ExifResult } from '$photo/exif';
	import { canvasToBlob } from '$photo/canvas-utils';
	import { downloadBlob } from '$qr/exporter';

	type PageState = 'idle' | 'loaded';

	let pageState: PageState = $state('idle');
	let error = $state('');
	let file: File | null = $state(null);
	let buffer: ArrayBuffer | null = $state(null);
	let previewSrc = $state('');
	let exif: ExifResult | null = $state(null);

	async function handleImage(f: File) {
		error = '';
		file = f;
		if (previewSrc) URL.revokeObjectURL(previewSrc);
		previewSrc = URL.createObjectURL(f);
		try {
			buffer = await f.arrayBuffer();
			exif = readExif(buffer);
			pageState = 'loaded';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Could not read this image.';
		}
	}

	async function downloadClean() {
		if (!file || !buffer) return;
		error = '';
		const base = file.name.replace(/\.[^.]+$/, '');

		// JPEG: strip metadata segments losslessly.
		const stripped = stripJpegMetadata(buffer);
		if (stripped) {
			downloadBlob(new Blob([stripped], { type: 'image/jpeg' }), `${base}_clean.jpg`);
			return;
		}

		// Other formats: re-encode through canvas, which drops all metadata.
		try {
			const bitmap = await createImageBitmap(file);
			const canvas = document.createElement('canvas');
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;
			canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
			const blob = await canvasToBlob(canvas, 'image/png');
			downloadBlob(blob, `${base}_clean.png`);
		} catch {
			error = 'Could not produce a cleaned copy of this image.';
		}
	}

	function reset() {
		if (previewSrc) URL.revokeObjectURL(previewSrc);
		previewSrc = '';
		file = null;
		buffer = null;
		exif = null;
		pageState = 'idle';
		error = '';
	}

	onDestroy(() => {
		if (previewSrc) URL.revokeObjectURL(previewSrc);
	});
</script>

<svelte:head>
	<title>EXIF Viewer &amp; Remover — Strip Photo Metadata | nah</title>
	<meta
		name="description"
		content="View and remove EXIF metadata from your photos — camera model, timestamps, and GPS location. Free, private, runs entirely in your browser. Nothing is uploaded."
	/>
	<link rel="canonical" href="https://nah.tools/photo/exif" />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<div class="text-center">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl md:text-5xl">
			EXIF Viewer &amp; <span class="text-accent">Remover</span>
		</h1>
		<p class="mt-2 text-text-muted">
			See what your photos reveal — then strip it out. Everything runs in your browser.
		</p>
	</div>

	{#if error}
		<div class="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>
	{/if}

	{#if pageState === 'idle'}
		<ImageDropzone onimage={handleImage} />
	{/if}

	{#if pageState === 'loaded' && exif}
		<div class="space-y-4">
			<div class="overflow-hidden rounded-lg border border-border bg-surface-alt">
				<img src={previewSrc} alt="Preview" class="mx-auto max-h-72 object-contain" />
			</div>

			{#if exif.hasGps}
				<div class="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
					<span class="font-medium">Location data found.</span> This photo contains GPS coordinates that reveal where it was taken. Download a cleaned copy before sharing.
				</div>
			{/if}

			{#if exif.fields.length > 0}
				<div class="overflow-hidden rounded-lg border border-border">
					<table class="w-full text-sm">
						<tbody>
							{#each exif.fields as field, i}
								<tr class={i % 2 === 0 ? 'bg-surface' : 'bg-surface-alt'}>
									<td class="w-1/3 px-4 py-2 font-medium text-text">{field.label}</td>
									<td class="px-4 py-2 font-mono text-text-muted break-all">{field.value}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm text-text-muted">
					No EXIF metadata found. This image is already clean, or its format does not store EXIF.
				</div>
			{/if}

			<div class="flex flex-col gap-2 sm:flex-row">
				<button
					type="button"
					onclick={downloadClean}
					class="flex-1 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
				>
					Download metadata-free copy
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

	<div class="rounded-lg border border-border bg-surface-alt p-6">
		<h2 class="text-sm font-semibold text-text">Why strip EXIF?</h2>
		<p class="mt-2 text-sm text-text-muted">
			Photos from phones and cameras often embed the exact GPS location, timestamp, and device model. Posting them as-is can leak your home address or daily routine. This tool reads that metadata so you can see it, then removes it — for JPEGs the image data is preserved byte-for-byte; only the metadata is dropped. Nothing is ever uploaded.
		</p>
	</div>
</div>
