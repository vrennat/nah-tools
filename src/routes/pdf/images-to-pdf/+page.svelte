<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import { isHeic, convertHeicToJpeg } from '$lib/heic';

	let files = $state<File[]>([]);
	let pageSize = $state<'fit' | 'a4' | 'letter'>('fit');
	let processing = $state(false);
	let convertingHeic = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');
	let dragIndex = $state<number | null>(null);

	let canConvert = $derived(files.length > 0 && !processing && !convertingHeic);

	function moveFile(from: number, to: number) {
		if (from === to) return;
		const updated = [...files];
		const [item] = updated.splice(from, 1);
		updated.splice(to, 0, item);
		files = updated;
	}

	// Convert any HEIC files to JPEG when files change
	$effect(() => {
		const heicFiles = files.filter(isHeic);
		if (heicFiles.length === 0) return;

		convertingHeic = true;
		Promise.all(
			files.map(async (f) => (isHeic(f) ? convertHeicToJpeg(f) : f))
		).then((converted) => {
			files = converted;
			convertingHeic = false;
		}).catch(() => {
			error = 'Failed to convert one or more HEIC files';
			convertingHeic = false;
		});
	});

	function getImageType(file: File): 'png' | 'jpg' {
		return file.type === 'image/png' ? 'png' : 'jpg';
	}

	async function convert() {
		if (!canConvert) return;
		processing = true;
		error = '';
		progress = { current: 0, total: files.length };

		try {
			const { imagesToPDF } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const images = await Promise.all(
				files.map(async (f) => ({
					data: await f.arrayBuffer(),
					type: getImageType(f)
				}))
			);

			const result = await imagesToPDF(images, pageSize, (current, total) => {
				progress = { current, total };
			});

			downloadPDF(result, makeFilename('images', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert images';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Convert Images to PDF Online Free | nah</title>
	<meta
		name="description"
		content="Convert JPG and PNG images to PDF. Drag to reorder, choose page size. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Images to PDF"
	description="Convert JPG, PNG, or HEIC images to a PDF document."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone
				accept=".jpg,.jpeg,.png,.heic,.heif"
				multiple={true}
				bind:files
				label="Drop images here or click to browse"
			/>

			{#if files.length > 1}
				<div class="mt-4 space-y-2">
					<p class="text-sm font-medium text-text">Image order (drag to reorder)</p>
					<ul class="space-y-1">
						{#each files as file, i}
							<li
								class="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors {dragIndex === i
									? 'border-accent bg-accent/5'
									: 'border-border bg-surface'}"
								draggable="true"
								role="listitem"
								ondragstart={() => (dragIndex = i)}
								ondragover={(e) => {
									e.preventDefault();
									if (dragIndex !== null && dragIndex !== i) {
										moveFile(dragIndex, i);
										dragIndex = i;
									}
								}}
								ondragend={() => (dragIndex = null)}
							>
								<svg
									class="h-4 w-4 shrink-0 cursor-grab text-text-muted"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 8h16M4 16h16"
									/>
								</svg>
								<span class="min-w-0 flex-1 truncate text-text">{file.name}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if files.length > 0}
				<div class="mt-4">
					<label for="pageSize" class="mb-1 block text-sm font-medium text-text">Page size</label>
					<select
						id="pageSize"
						bind:value={pageSize}
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					>
						<option value="fit">Fit to image</option>
						<option value="a4">A4</option>
						<option value="letter">Letter</option>
					</select>
				</div>
			{/if}

			{#if convertingHeic}
				<div class="mt-4 flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/20 px-3 py-2 text-sm text-text-muted">
					<div class="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
					Converting HEIC files...
				</div>
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			{#if processing}
				<div class="mt-4">
					<ProgressBar current={progress.current} total={progress.total} />
				</div>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canConvert}
					onclick={convert}
				>
					{#if processing}
						Converting...
					{:else if files.length === 0}
						Add images to convert
					{:else}
						Convert {files.length} image{files.length > 1 ? 's' : ''} to PDF
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
