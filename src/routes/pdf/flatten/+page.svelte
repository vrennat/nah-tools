<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let result = $state<{ originalSize: number; newSize: number } | null>(null);

	let file = $derived(files[0]);
	let canFlatten = $derived(!!file && !processing);

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	async function flatten() {
		if (!canFlatten || !file) return;
		processing = true;
		error = '';
		result = null;

		try {
			const { flattenPDF } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const originalSize = buf.byteLength;
			const flattened = await flattenPDF(buf);
			const newSize = flattened.byteLength;

			result = { originalSize, newSize };
			downloadPDF(flattened, makeFilename('flattened', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to flatten PDF';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'What does flattening a PDF actually do?',
			answer:
				'Flattening converts interactive elements — form fields, checkboxes, dropdowns, text inputs — into static page content. After flattening, the values entered in the form become permanent visual elements and the fields themselves no longer exist as interactive objects.'
		},
		{
			question: 'Why would I want to flatten a PDF?',
			answer:
				'Flattened PDFs are more portable: some PDF viewers render form fields inconsistently, and some recipients may be able to edit or clear fields in a non-flattened form. Flattening turns supported form-field appearances into page content. Review the downloaded PDF in your intended viewer; it can still be modified with a PDF editor.'
		},
		{
			question: 'Does flattening remove annotations?',
			answer:
				'This tool flattens supported interactive form fields and their widgets. It does not flatten or remove arbitrary annotations such as comments, highlights, or drawn shapes. These may remain interactive in the output.'
		},
		{
			question: 'What happens if the PDF has no form fields?',
			answer:
				'The PDF is re-saved. There are no form fields to flatten, and file-size reduction is not guaranteed. This is not the same operation as the compress tool.'
		},
		{
			question: 'Are my files uploaded?',
			answer:
				'No. Flattening runs entirely in your browser using pdf-lib. Your file never leaves your device.'
		}
	];
</script>

<ToolShell
	path="/pdf/flatten"
	tagline="Convert supported interactive form fields into static page content."
	seoTitle="Flatten PDF Free — Remove Form Fields | nah.tools"
	description="Flatten supported PDF form fields into static page content. Comments and other annotations are not flattened. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" acceptPendingFile={true} bind:files label="Drop a PDF here or click to browse" />

			<div class="mt-4 rounded-lg border border-border bg-surface-alt px-4 py-3">
				<p class="text-sm text-text-muted">
					Flattens interactive form fields (text inputs, checkboxes, dropdowns) into static
					content. Comments, highlights, and other annotations are not flattened. Keep the editable original.
				</p>
			</div>

			{#if result}
				<div class="mt-4 rounded-lg bg-success/10 px-4 py-3">
					<p class="text-sm font-medium text-success">
						{formatSize(result.originalSize)} → {formatSize(result.newSize)}
						({Math.round((1 - result.newSize / result.originalSize) * 100)}% reduction)
					</p>
				</div>
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canFlatten}
					onclick={flatten}
				>
					{#if processing}
						Flattening...
					{:else if !file}
						Upload a PDF to flatten
					{:else}
						Flatten PDF
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Why flatten a PDF before sharing?</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Flattening converts supported form-field appearances into ordinary page content, so
				recipients no longer fill or clear those values through form controls. This can help
				when sharing a completed form, but does not make its contents impossible to edit.
				Keep the editable original and review every field in the downloaded PDF.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool uses <strong class="font-medium text-text">pdf-lib</strong> to read the
				PDF's supported form fields and merge their appearances into the page content stream. The process
				runs in your browser — no upload required. After flattening, the resulting PDF
				has static form values. Comments, highlights, links, and other interactive content
				may remain; this is not a general annotation-flattening or sanitization tool.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The Protect PDF tool can add password protection and viewer-dependent permissions.
				Neither flattening nor those permissions guarantees that a recipient cannot modify the file.
			</p>
		</div>
	</section>
</ToolShell>
