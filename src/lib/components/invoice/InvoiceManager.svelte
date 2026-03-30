<script lang="ts">
	import type { InvoiceData, InvoiceMetadata, DocumentType } from '$invoice/types';
	import { createEmptyInvoice, DOCUMENT_LABELS } from '$invoice/types';
	import { listInvoices, getInvoice, saveInvoice, deleteInvoice, nextDocumentNumber } from '$invoice/storage';
	import { formatCurrency } from '$invoice/currency';

	let {
		currentInvoice = $bindable<InvoiceData>(),
		onselect
	}: {
		currentInvoice: InvoiceData;
		onselect: (data: InvoiceData) => void;
	} = $props();

	let invoices = $state<InvoiceMetadata[]>([]);
	let showList = $state(false);

	$effect(() => {
		loadInvoices();
	});

	async function loadInvoices() {
		invoices = await listInvoices();
		invoices.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
	}

	async function handleNew(docType: DocumentType = 'invoice') {
		const inv = createEmptyInvoice(docType);
		inv.documentNumber = await nextDocumentNumber(docType);
		// Carry over sender info from current invoice
		if (currentInvoice.sender.name) {
			inv.sender = { ...currentInvoice.sender };
			inv.logoDataUrl = currentInvoice.logoDataUrl;
			inv.paymentInfo = { ...currentInvoice.paymentInfo };
			inv.currency = currentInvoice.currency;
			inv.taxConfig = { ...currentInvoice.taxConfig, taxLines: currentInvoice.taxConfig.taxLines.map(t => ({ ...t })) };
		}
		await saveInvoice(inv);
		onselect(inv);
		showList = false;
		await loadInvoices();
	}

	async function handleSelect(id: string) {
		const data = await getInvoice(id);
		if (data) {
			onselect(data);
		}
		showList = false;
	}

	async function handleDuplicate() {
		const inv = createEmptyInvoice(currentInvoice.documentType);
		inv.documentNumber = await nextDocumentNumber(currentInvoice.documentType);
		inv.sender = { ...currentInvoice.sender };
		inv.client = { ...currentInvoice.client };
		inv.logoDataUrl = currentInvoice.logoDataUrl;
		inv.paymentInfo = { ...currentInvoice.paymentInfo };
		inv.currency = currentInvoice.currency;
		inv.taxConfig = { ...currentInvoice.taxConfig, taxLines: currentInvoice.taxConfig.taxLines.map(t => ({ ...t })) };
		inv.lineItems = currentInvoice.lineItems.map((item) => ({ ...item, id: crypto.randomUUID() }));
		inv.notes = currentInvoice.notes;
		inv.terms = currentInvoice.terms;
		inv.template = currentInvoice.template;
		await saveInvoice(inv);
		onselect(inv);
		showList = false;
		await loadInvoices();
	}

	async function handleDelete(id: string) {
		await deleteInvoice(id);
		await loadInvoices();
		if (currentInvoice.id === id) {
			if (invoices.length > 0) {
				const data = await getInvoice(invoices[0].id);
				if (data) onselect(data);
			} else {
				await handleNew();
			}
		}
	}

	function formatDateShort(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	<div class="relative">
		<button
			type="button"
			onclick={() => { showList = !showList; }}
			class="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors hover:border-accent/50"
		>
			<span class="font-medium">{currentInvoice.documentNumber || 'New Draft'}</span>
			{#if currentInvoice.client.name}
				<span class="text-text-muted">— {currentInvoice.client.name}</span>
			{/if}
			<svg class="h-3.5 w-3.5 text-text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if showList}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="fixed inset-0 z-40" onclick={() => { showList = false; }}></div>
			<div class="absolute left-0 z-50 mt-1 w-80 rounded-lg border border-border bg-surface shadow-lg">
				<div class="max-h-64 overflow-y-auto">
					{#each invoices as inv}
						<div class="flex items-center justify-between px-3 py-2 hover:bg-surface-alt">
							<button
								type="button"
								class="flex-1 text-left"
								onclick={() => handleSelect(inv.id)}
							>
								<span class="text-sm font-medium {inv.id === currentInvoice.id ? 'text-accent' : 'text-text'}">
									{inv.documentNumber || 'Draft'}
								</span>
								<span class="ml-2 text-xs text-text-muted">
									{inv.clientName || 'No client'} &middot; {formatCurrency(inv.total, inv.currency)} &middot; {formatDateShort(inv.updatedAt)}
								</span>
							</button>
							<button
								type="button"
								class="ml-2 rounded p-1 text-text-muted hover:text-error"
								onclick={(e) => { e.stopPropagation(); handleDelete(inv.id); }}
							>
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					{/each}
					{#if invoices.length === 0}
						<p class="px-3 py-4 text-center text-sm text-text-muted">No saved invoices</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<button
		type="button"
		onclick={() => handleNew(currentInvoice.documentType)}
		class="rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
	>
		+ New
	</button>

	<button
		type="button"
		onclick={handleDuplicate}
		class="rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
	>
		Duplicate
	</button>
</div>
