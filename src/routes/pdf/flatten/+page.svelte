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
				'Flattened PDFs are more portable: some PDF viewers render form fields inconsistently, and some recipients may be able to edit or clear fields in a non-flattened form. Flattening locks in the current values and ensures the document looks the same everywhere.'
		},
		{
			question: 'Does flattening remove annotations?',
			answer:
				'The tool uses pdf-lib, which flattens interactive form fields. Standard visual annotations (like comments or highlights) may or may not be affected depending on how the PDF was authored. The intent is to make the document non-interactive, not to remove visible content.'
		},
		{
			question: 'What happens if the PDF has no form fields?',
			answer:
				'The PDF will be re-saved with an optimized structure. No visible content changes — it is effectively equivalent to running the compress tool.'
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
	tagline="Lock form fields and annotations into static content so the PDF looks the same everywhere."
	seoTitle="Flatten PDF Free — Remove Form Fields | nah.tools"
	description="Remove interactive form fields and annotations from PDFs, baking them into static content. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" acceptPendingFile={true} bind:files label="Drop a PDF here or click to browse" />

			<div class="mt-4 rounded-lg border border-border bg-surface-alt px-4 py-3">
				<p class="text-sm text-text-muted">
					Flattens interactive form fields (text inputs, checkboxes, dropdowns) into static
					content. If your PDF has no form fields, it will be re-saved with optimized structure.
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
				Interactive PDF forms are convenient for filling out, but they carry risk once
				distributed. Recipients can clear or change field values, different PDF viewers
				render form fields inconsistently, and some email gateways strip interactive
				elements entirely. Flattening resolves all of this by converting every field
				into ordinary static content — the values you entered become part of the page
				itself, as permanent as typed text.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool uses <strong class="font-medium text-text">pdf-lib</strong> to read the
				PDF's interactive layer and merge it into the page content stream. The process
				runs in your browser — no upload required. After flattening, the resulting PDF
				is a clean, static document that renders identically in every viewer and is
				safe to share as a final record.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				If you want to go further and prevent any modification, combine flattening with
				the Protect PDF tool to add password protection.
			</p>
		</div>
	</section>
</ToolShell>
