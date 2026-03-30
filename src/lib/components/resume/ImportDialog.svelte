<script lang="ts">
	import type { ResumeData } from '$resume/types';
	import { importDOCX } from '$resume/docx/import';

	let { onimport }: { onimport: (data: Partial<ResumeData>) => void } = $props();

	let loading = $state(false);
	let error: string | null = $state(null);
	let successMessage: string | null = $state(null);
	let fileInput: HTMLInputElement;

	function summarizeImport(data: Partial<ResumeData>): string {
		const parts: string[] = [];
		if (data.personal?.fullName) parts.push('name');
		if (data.personal?.email) parts.push('email');
		if (data.personal?.phone) parts.push('phone');
		if (data.summary) parts.push('summary');
		if (data.experience?.length) parts.push(`${data.experience.length} experience entries`);
		if (data.education?.length) parts.push(`${data.education.length} education entries`);
		if (data.skills?.length) parts.push(`${data.skills.length} skill categories`);
		if (data.projects?.length) parts.push(`${data.projects.length} projects`);
		if (data.certifications?.length) parts.push(`${data.certifications.length} certifications`);
		return parts.length > 0 ? `Imported: ${parts.join(', ')}` : 'File imported (no fields detected).';
	}

	async function handleFile(file: File) {
		loading = true;
		error = null;
		successMessage = null;

		try {
			const ext = file.name.split('.').pop()?.toLowerCase();

			if (ext === 'json') {
				const text = await file.text();
				let parsed: unknown;
				try {
					parsed = JSON.parse(text);
				} catch {
					throw new Error('Invalid JSON file.');
				}
				if (typeof parsed !== 'object' || parsed === null) {
					throw new Error('JSON file does not contain valid resume data.');
				}
				const data = parsed as Partial<ResumeData>;
				// Basic validation: check for at least some resume-like fields
				const hasResumeFields =
					data.personal || data.summary || data.experience || data.education || data.skills;
				if (!hasResumeFields) {
					throw new Error(
						'JSON file does not appear to contain resume data. Expected fields like personal, experience, or skills.'
					);
				}
				successMessage = summarizeImport(data);
				onimport(data);
			} else if (ext === 'docx') {
				const blob = new Blob([await file.arrayBuffer()], {
					type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
				});
				const data = await importDOCX(blob);
				successMessage = summarizeImport(data);
				onimport(data);
			} else {
				throw new Error(`Unsupported file type: .${ext}. Please use .docx or .json files.`);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to import file.';
		} finally {
			loading = false;
		}
	}

	function handleInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			handleFile(file);
		}
		target.value = '';
	}
</script>

<div class="space-y-3">
	<button
		type="button"
		class="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt disabled:opacity-50"
		disabled={loading}
		onclick={() => fileInput.click()}
	>
		{#if loading}
			Importing...
		{:else}
			Import from File
		{/if}
	</button>

	<input
		bind:this={fileInput}
		type="file"
		accept=".docx,.json"
		class="hidden"
		aria-label="Upload resume file"
		onchange={handleInputChange}
	/>

	{#if error}
		<p class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
	{/if}

	{#if successMessage}
		<p class="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{successMessage}</p>
	{/if}
</div>
