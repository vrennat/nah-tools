<script lang="ts">
	import type { InvoiceData } from '$invoice/types';
	import { generateInvoicePDF } from '$invoice/pdf/index';

	let { invoice }: { invoice: InvoiceData } = $props();

	let pageImages: string[] = $state([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let previewTimeout: ReturnType<typeof setTimeout> | undefined;

	function cleanupImages() {
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
			const scale = 2;
			const viewport = page.getViewport({ scale });
			const canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			const ctx = canvas.getContext('2d')!;
			await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
			urls.push(canvas.toDataURL('image/png'));
		}

		return urls;
	}

	$effect(() => {
		const snapshot = JSON.stringify(invoice);
		void snapshot;

		loading = true;
		error = null;
		clearTimeout(previewTimeout);

		previewTimeout = setTimeout(async () => {
			try {
				const blob = await generateInvoicePDF(JSON.parse(snapshot) as InvoiceData);
				cleanupImages();
				pageImages = await renderPdfToImages(blob);
				loading = false;
			} catch (e) {
				error = e instanceof Error ? e.message : 'Failed to generate preview';
				loading = false;
			}
		}, 800);

		return () => {
			clearTimeout(previewTimeout);
		};
	});

	$effect(() => {
		return () => {
			cleanupImages();
		};
	});
</script>

<div class="relative overflow-hidden rounded-xl border border-border bg-surface-alt">
	{#if loading && pageImages.length === 0}
		<div class="flex h-[600px] items-center justify-center">
			<div class="text-center">
				<div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"></div>
				<p class="mt-3 text-sm text-text-muted">Generating preview...</p>
			</div>
		</div>
	{:else if error}
		<div class="flex h-[600px] items-center justify-center">
			<p class="text-sm text-error">{error}</p>
		</div>
	{:else if pageImages.length > 0}
		<div class="space-y-4 overflow-auto p-4" style="max-height: 800px;">
			{#each pageImages as src, i}
				<img
					{src}
					alt="Invoice page {i + 1}"
					class="w-full rounded border border-border shadow-sm"
				/>
			{/each}
		</div>
		{#if loading}
			<div class="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-border">
				<div class="h-full w-1/3 animate-pulse bg-accent"></div>
			</div>
		{/if}
	{/if}
</div>
