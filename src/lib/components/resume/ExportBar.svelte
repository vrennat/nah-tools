<script lang="ts">
	import type { ResumeData } from '$resume/types';
	import { generatePDF } from '$resume/pdf';
	import { exportDOCX } from '$resume/docx/export';

	let { resume }: { resume: ResumeData } = $props();

	let pdfLoading = $state(false);
	let docxLoading = $state(false);
	let jsonLoading = $state(false);
	let error: string | null = $state(null);

	function fileBaseName(): string {
		const name = resume.personal?.fullName?.trim() || resume.name || 'resume';
		return name.toLowerCase().replace(/\s+/g, '-') + '-resume';
	}

	function triggerDownload(blob: Blob, filename: string) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function downloadPDF() {
		pdfLoading = true;
		error = null;
		try {
			const plain = JSON.parse(JSON.stringify(resume));
			const blob = await generatePDF(plain, plain.template);
			triggerDownload(blob, `${fileBaseName()}.pdf`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to generate PDF.';
		} finally {
			pdfLoading = false;
		}
	}

	async function downloadDOCX() {
		docxLoading = true;
		error = null;
		try {
			const blob = await exportDOCX(JSON.parse(JSON.stringify(resume)));
			triggerDownload(blob, `${fileBaseName()}.docx`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to generate DOCX.';
		} finally {
			docxLoading = false;
		}
	}

	async function downloadJSON() {
		jsonLoading = true;
		error = null;
		try {
			const json = JSON.stringify(resume, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			triggerDownload(blob, `${fileBaseName()}.json`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to export JSON.';
		} finally {
			jsonLoading = false;
		}
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap gap-3">
		<button
			type="button"
			class="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
			disabled={pdfLoading}
			onclick={downloadPDF}
		>
			{#if pdfLoading}
				Generating...
			{:else}
				Download PDF
			{/if}
		</button>

		<button
			type="button"
			class="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt disabled:opacity-50"
			disabled={docxLoading}
			onclick={downloadDOCX}
		>
			{#if docxLoading}
				Generating...
			{:else}
				Download DOCX
			{/if}
		</button>

		<button
			type="button"
			class="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt disabled:opacity-50"
			disabled={jsonLoading}
			onclick={downloadJSON}
		>
			{#if jsonLoading}
				Exporting...
			{:else}
				Download JSON
			{/if}
		</button>
	</div>

	{#if error}
		<p class="text-sm text-error">{error}</p>
	{/if}
</div>
