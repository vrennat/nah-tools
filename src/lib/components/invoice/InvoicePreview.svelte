<script lang="ts">
	import type { InvoiceData } from '$invoice/types';
	import { generateInvoicePDF } from '$invoice/pdf/index';

	let { invoice }: { invoice: InvoiceData } = $props();

	let blobUrl = $state<string | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let previewTimeout: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const snapshot = JSON.stringify(invoice);
		void snapshot;

		loading = true;
		error = null;
		clearTimeout(previewTimeout);

		previewTimeout = setTimeout(async () => {
			try {
				const blob = await generateInvoicePDF(JSON.parse(snapshot) as InvoiceData);
				if (blobUrl) URL.revokeObjectURL(blobUrl);
				blobUrl = URL.createObjectURL(blob);
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

	// Cleanup on destroy
	$effect(() => {
		return () => {
			if (blobUrl) URL.revokeObjectURL(blobUrl);
		};
	});
</script>

<div class="relative overflow-hidden rounded-xl border border-border bg-surface-alt">
	{#if loading && !blobUrl}
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
	{:else if blobUrl}
		<iframe
			src={blobUrl}
			title="Invoice preview"
			class="h-[600px] w-full border-0 sm:h-[700px] lg:h-[800px]"
		></iframe>
		{#if loading}
			<div class="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-border">
				<div class="h-full w-1/3 animate-pulse bg-accent"></div>
			</div>
		{/if}
	{/if}
</div>
