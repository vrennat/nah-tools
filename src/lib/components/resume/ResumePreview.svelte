<script lang="ts">
	import type { ResumeData, TemplateId } from '$resume/types';
	import { generatePDF } from '$resume/pdf';
	import { extractTextFromPDF } from '$resume/ats/xray';

	let { resume, template = 'professional' }: { resume: ResumeData; template?: TemplateId } =
		$props();

	let isResumeEmpty = $derived(
		!resume.personal.fullName.trim() &&
			!resume.summary.trim() &&
			resume.experience.length === 0 &&
			resume.education.length === 0 &&
			resume.skills.length === 0
	);

	let activeTab: 'preview' | 'xray' = $state('preview');
	let pageImages: string[] = $state([]);
	let xrayText: string = $state('');
	let loading = $state(false);
	let xrayLoading = $state(false);
	let error: string | null = $state(null);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let currentBlob: Blob | null = null;

	function cleanupImages() {
		for (const url of pageImages) {
			URL.revokeObjectURL(url);
		}
		pageImages = [];
	}

	async function renderPdfToImages(blob: Blob): Promise<string[]> {
		const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
		pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/legacy/build/pdf.worker.mjs',
			import.meta.url
		).href;

		const arrayBuffer = await blob.arrayBuffer();
		const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
		const urls: string[] = [];

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const scale = 2; // 2x for crisp rendering
			const viewport = page.getViewport({ scale });
			const canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			const ctx = canvas.getContext('2d')!;
			await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
			const dataUrl = canvas.toDataURL('image/png');
			urls.push(dataUrl);
		}

		return urls;
	}

	async function regeneratePDF() {
		loading = true;
		error = null;
		try {
			const plainResume = JSON.parse(JSON.stringify(resume));
			const blob = await generatePDF(plainResume, template);
			cleanupImages();
			currentBlob = blob;
			pageImages = await renderPdfToImages(blob);
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

	$effect(() => {
		return () => {
			cleanupImages();
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
			{#if isResumeEmpty}
				<div class="overflow-auto p-4" style="max-height: 70vh;">
					<div
						class="mx-auto aspect-[8.5/11] w-full rounded border border-border bg-white p-8 shadow-sm dark:bg-slate-100"
					>
						<!-- Name skeleton -->
						<div class="mx-auto mb-1 h-6 w-48 rounded bg-slate-200"></div>
						<!-- Contact info skeleton -->
						<div class="mx-auto mb-6 h-3 w-72 rounded bg-slate-100"></div>

						<!-- Summary section -->
						<div class="mb-1 h-3.5 w-20 rounded bg-slate-200"></div>
						<div class="mb-1 border-b border-slate-200"></div>
						<div class="mb-1 h-2.5 w-full rounded bg-slate-100"></div>
						<div class="mb-5 h-2.5 w-4/5 rounded bg-slate-100"></div>

						<!-- Experience section -->
						<div class="mb-1 h-3.5 w-24 rounded bg-slate-200"></div>
						<div class="mb-2 border-b border-slate-200"></div>
						<div class="mb-1 h-3 w-40 rounded bg-slate-100"></div>
						<div class="mb-2 h-2.5 w-32 rounded bg-slate-50"></div>
						<div class="mb-1 ml-4 h-2 w-5/6 rounded bg-slate-100"></div>
						<div class="mb-1 ml-4 h-2 w-4/6 rounded bg-slate-100"></div>
						<div class="mb-5 ml-4 h-2 w-3/4 rounded bg-slate-100"></div>

						<!-- Education section -->
						<div class="mb-1 h-3.5 w-22 rounded bg-slate-200"></div>
						<div class="mb-2 border-b border-slate-200"></div>
						<div class="mb-1 h-3 w-48 rounded bg-slate-100"></div>
						<div class="mb-5 h-2.5 w-36 rounded bg-slate-50"></div>

						<!-- Skills section -->
						<div class="mb-1 h-3.5 w-14 rounded bg-slate-200"></div>
						<div class="mb-2 border-b border-slate-200"></div>
						<div class="mb-1 h-2.5 w-64 rounded bg-slate-100"></div>
						<div class="h-2.5 w-56 rounded bg-slate-100"></div>

						<p class="mt-8 text-center text-xs text-slate-300">
							Fill in your details to see a live preview
						</p>
					</div>
				</div>
			{:else if pageImages.length > 0}
				<div class="space-y-4 overflow-auto p-4" style="max-height: 70vh;">
					{#each pageImages as src, i}
						<img
							{src}
							alt="Resume page {i + 1}"
							class="w-full rounded border border-border shadow-sm"
						/>
					{/each}
				</div>
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
