<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import type { PageNumberPosition } from '$pdf/types';

	let files = $state<File[]>([]);
	let position = $state<PageNumberPosition>('bottom-center');
	let format = $state('{n}');
	let fontSize = $state(12);
	let margin = $state(36);
	let startNumber = $state(1);
	let processing = $state(false);
	let error = $state('');

	let file = $derived(files[0]);
	let canApply = $derived(!!file && !processing);

	async function apply() {
		if (!canApply || !file) return;
		processing = true;
		error = '';

		try {
			const { addPageNumbers } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const result = await addPageNumbers(buf, {
				position,
				format,
				fontSize,
				margin,
				startNumber
			});

			downloadPDF(result, makeFilename('numbered', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add page numbers';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Add Page Numbers to PDF Online Free | nah</title>
	<meta
		name="description"
		content="Add page numbers to your PDF. Choose position, format, and starting number. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Add Page Numbers"
	description="Add customizable page numbers to your PDF."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			{#if file}
				<div class="mt-4 space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="position" class="mb-1 block text-sm font-medium text-text"
								>Position</label
							>
							<select
								id="position"
								bind:value={position}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							>
								<option value="bottom-center">Bottom center</option>
								<option value="bottom-left">Bottom left</option>
								<option value="bottom-right">Bottom right</option>
								<option value="top-center">Top center</option>
								<option value="top-left">Top left</option>
								<option value="top-right">Top right</option>
							</select>
						</div>
						<div>
							<label for="format" class="mb-1 block text-sm font-medium text-text">Format</label>
							<select
								id="format"
								bind:value={format}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							>
								<option value={'{n}'}>{startNumber}</option>
								<option value={'Page {n}'}>Page {startNumber}</option>
								<option value={'Page {n} of {total}'}>Page {startNumber} of N</option>
								<option value={'{n} / {total}'}>{startNumber} / N</option>
							</select>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="fontSize" class="mb-1 block text-sm font-medium text-text"
								>Font size: {fontSize}pt</label
							>
							<input
								id="fontSize"
								type="range"
								min="8"
								max="24"
								bind:value={fontSize}
								class="w-full accent-accent"
							/>
						</div>
						<div>
							<label for="startNumber" class="mb-1 block text-sm font-medium text-text"
								>Start at</label
							>
							<input
								id="startNumber"
								type="number"
								min="1"
								bind:value={startNumber}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
						</div>
					</div>
				</div>
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canApply}
					onclick={apply}
				>
					{#if processing}
						Adding numbers...
					{:else if !file}
						Upload a PDF
					{:else}
						Add Page Numbers & Download
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
