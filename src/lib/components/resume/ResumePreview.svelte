<script lang="ts">
	import type { ResumeData, TemplateId } from '$resume/types';
	import { generatePDF } from '$resume/pdf';
	import { extractTextFromPDF } from '$resume/ats/xray';

	let { resume, template = 'professional' }: { resume: ResumeData; template?: TemplateId } =
		$props();

	let activeTab: 'preview' | 'xray' = $state('preview');
	let blobUrl: string | null = $state(null);
	let xrayText: string = $state('');
	let loading = $state(false);
	let xrayLoading = $state(false);
	let error: string | null = $state(null);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let currentBlob: Blob | null = null;

	function cleanupUrl() {
		if (blobUrl) {
			URL.revokeObjectURL(blobUrl);
			blobUrl = null;
		}
	}

	async function regeneratePDF() {
		loading = true;
		error = null;
		try {
			// JSON round-trip strips Svelte 5 reactive proxies before passing to pdfmake
			const plainResume = JSON.parse(JSON.stringify(resume));
			const blob = await generatePDF(plainResume, template);
			cleanupUrl();
			currentBlob = blob;
			blobUrl = URL.createObjectURL(blob);
			// If xray tab is active, also regenerate xray text
			if (activeTab === 'xray') {
				await loadXray();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to generate PDF preview.';
		} finally {
			loading = false;
		}
	}

	async function loadXray() {
		if (!currentBlob) return;
		xrayLoading = true;
		try {
			xrayText = await extractTextFromPDF(currentBlob);
		} catch (err) {
			xrayText = 'Failed to extract text from PDF.';
		} finally {
			xrayLoading = false;
		}
	}

	$effect(() => {
		// Track resume content and template changes
		const _key = JSON.stringify(resume) + template;
		void _key;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			regeneratePDF();
		}, 800);

		return () => {
			clearTimeout(debounceTimer);
		};
	});

	// Cleanup blob URL on destroy
	$effect(() => {
		return () => {
			cleanupUrl();
		};
	});

	async function handleTabSwitch(tab: 'preview' | 'xray') {
		activeTab = tab;
		if (tab === 'xray' && currentBlob && !xrayText) {
			await loadXray();
		}
	}
</script>

<div class="flex h-full flex-col">
	<div class="flex gap-1 border-b border-border pb-0">
		<button
			type="button"
			class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'preview'
				? 'border-b-2 border-accent text-accent'
				: 'text-text-muted hover:text-text'}"
			onclick={() => handleTabSwitch('preview')}
		>
			Preview
		</button>
		<button
			type="button"
			class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'xray'
				? 'border-b-2 border-accent text-accent'
				: 'text-text-muted hover:text-text'}"
			onclick={() => handleTabSwitch('xray')}
		>
			ATS X-ray
		</button>
	</div>

	<div class="relative min-h-0 flex-1">
		{#if loading}
			<div class="flex h-full items-center justify-center">
				<div class="space-y-3 text-center">
					<div
						class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
					></div>
					<p class="text-sm text-text-muted">Generating preview...</p>
				</div>
			</div>
		{:else if error}
			<div class="flex h-full items-center justify-center p-6">
				<p class="text-sm text-error">{error}</p>
			</div>
		{:else if activeTab === 'preview'}
			{#if blobUrl}
				<iframe
					src={blobUrl}
					title="Resume preview"
					class="h-full w-full border-0 bg-white"
					style="min-height: 600px;"
				></iframe>
			{:else}
				<div class="flex h-full items-center justify-center p-6">
					<p class="text-sm text-text-muted">Fill in your resume details to see a preview.</p>
				</div>
			{/if}
		{:else if activeTab === 'xray'}
			{#if xrayLoading}
				<div class="flex h-full items-center justify-center">
					<div class="space-y-3 text-center">
						<div
							class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
						></div>
						<p class="text-sm text-text-muted">Extracting text...</p>
					</div>
				</div>
			{:else if xrayText}
				<div class="h-full overflow-auto p-4">
					<p class="mb-3 text-xs text-text-muted">
						This is what an ATS (Applicant Tracking System) sees when it parses your resume PDF.
					</p>
					<pre
						class="whitespace-pre-wrap rounded-lg border border-border bg-surface-alt p-4 font-mono text-sm text-text">{xrayText}</pre>
				</div>
			{:else}
				<div class="flex h-full items-center justify-center p-6">
					<p class="text-sm text-text-muted">Generate a preview first to see the ATS X-ray view.</p>
				</div>
			{/if}
		{/if}
	</div>
</div>
