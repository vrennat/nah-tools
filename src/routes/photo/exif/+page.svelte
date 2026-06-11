<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImageDropzone from '$components/photo/ImageDropzone.svelte';
	import ToolShell from '$components/ToolShell.svelte';
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

	const faqs = [
		{
			question: 'What EXIF data is read from my photos?',
			answer:
				'The tool reads camera make and model, date taken, GPS coordinates (latitude and longitude), orientation, focal length, aperture (F-number), ISO, exposure time, lens model, image dimensions, white balance, software used, artist, and copyright. These cover the most privacy-sensitive fields in the IFD0 and Exif IFD TIFF structures.'
		},
		{
			question: 'How is JPEG metadata stripped?',
			answer:
				'For JPEG files, the stripper removes metadata segments (APP1/APP2/etc.) directly from the raw byte stream without re-encoding. The image data is preserved byte-for-byte — pixel quality is not affected at all. ICC color profiles are also removed in this pass.'
		},
		{
			question: 'What happens with non-JPEG formats?',
			answer:
				'For PNG, WebP, HEIC, and other formats, the image is decoded via createImageBitmap and re-drawn to an HTML canvas, then exported as PNG. This drops all metadata but does involve a re-encode. The output is lossless PNG regardless of the input format.'
		},
		{
			question: 'Is my location data ever sent anywhere?',
			answer:
				'No. EXIF parsing and metadata stripping run entirely in your browser using JavaScript. No data leaves your device — not the image, not the GPS coordinates, not anything.'
		},
		{
			question: 'Why does my photo show a GPS warning?',
			answer:
				'The tool detects GPS IFD data in the EXIF structure and shows a warning when coordinates are present. GPS data in phone photos typically records the exact location where the photo was taken, which can expose your home, workplace, or travel patterns when shared publicly.'
		}
	];
</script>

<ToolShell
	path="/photo/exif"
	tagline="See the camera data, timestamps, and GPS coordinates your photos contain — then remove them before sharing."
	seoTitle="EXIF Viewer & Remover — Strip Photo Metadata Free | nah.tools"
	description="View and remove EXIF metadata from photos — camera model, GPS location, timestamps. Free, private, runs in your browser. Nothing uploaded."
	{faqs}
>
	<section class="mx-auto max-w-3xl space-y-6">
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

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">What your photos reveal — and how to stop it</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Every photo taken with a smartphone or digital camera embeds metadata in the file itself. This EXIF data typically includes the make and model of the device, the exact timestamp, and GPS coordinates accurate to within a few meters. Posting a photo without stripping this data can expose your home address, workplace, or daily routine to anyone who downloads the file.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool parses the TIFF-structured EXIF data directly in your browser — no upload required. For JPEG files, metadata segments are removed from the raw byte stream without re-encoding the image, so pixel quality is completely unaffected. The "clean" file is byte-for-byte identical to your original except that the APP1 metadata segment has been excised.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				For non-JPEG formats (PNG, WebP, and others), the tool decodes the image through the browser's canvas API and exports a clean PNG copy. This approach drops all embedded metadata at the cost of a lossless re-encode. Nothing is ever transmitted — the entire process runs as JavaScript in your browser tab.
			</p>
		</div>
	</section>
</ToolShell>
