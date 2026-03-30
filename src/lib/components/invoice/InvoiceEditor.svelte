<script lang="ts">
	import type { InvoiceData } from '$invoice/types';
	import { DOCUMENT_LABELS } from '$invoice/types';
	import { calculateInvoiceSummary } from '$invoice/calculations';
	import { formatCurrency } from '$invoice/currency';
	import SenderForm from './SenderForm.svelte';
	import ClientForm from './ClientForm.svelte';
	import LineItemsForm from './LineItemsForm.svelte';
	import DatesNumbersForm from './DatesNumbersForm.svelte';
	import TaxConfigForm from './TaxConfigForm.svelte';
	import NotesTermsForm from './NotesTermsForm.svelte';

	let { invoice = $bindable<InvoiceData>() } = $props();

	let expanded: Record<string, boolean> = $state({
		sender: true,
		client: true,
		dates: true,
		items: true,
		tax: false,
		notes: false
	});

	const summary = $derived(calculateInvoiceSummary(invoice));

	function toggle(key: string) {
		expanded[key] = !expanded[key];
	}

	const sections: { key: string; label: string }[] = [
		{ key: 'sender', label: 'From' },
		{ key: 'client', label: 'Bill To' },
		{ key: 'dates', label: 'Details' },
		{ key: 'items', label: 'Line Items' },
		{ key: 'tax', label: 'Tax' },
		{ key: 'notes', label: 'Notes & Payment' }
	];
</script>

<div class="space-y-3">
	{#each sections as section (section.key)}
		<div class="rounded-xl border border-border bg-surface">
			<button
				type="button"
				onclick={() => toggle(section.key)}
				class="flex w-full items-center justify-between px-4 py-3 text-left"
			>
				<span class="text-sm font-semibold text-text">{section.label}</span>
				<svg
					class="h-4 w-4 text-text-muted transition-transform {expanded[section.key] ? 'rotate-180' : ''}"
					fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{#if expanded[section.key]}
				<div class="border-t border-border px-4 py-4">
					{#if section.key === 'sender'}
						<SenderForm
							bind:sender={invoice.sender}
							bind:logoDataUrl={invoice.logoDataUrl}
							bind:paymentInfo={invoice.paymentInfo}
						/>
					{:else if section.key === 'client'}
						<ClientForm bind:client={invoice.client} />
					{:else if section.key === 'dates'}
						<DatesNumbersForm
							bind:documentNumber={invoice.documentNumber}
							bind:referenceNumber={invoice.referenceNumber}
							bind:issueDate={invoice.issueDate}
							bind:dueDate={invoice.dueDate}
						/>
					{:else if section.key === 'items'}
						<LineItemsForm
							bind:items={invoice.lineItems}
							currency={invoice.currency}
						/>
					{:else if section.key === 'tax'}
						<TaxConfigForm bind:config={invoice.taxConfig} />
					{:else if section.key === 'notes'}
						<NotesTermsForm
							bind:notes={invoice.notes}
							bind:terms={invoice.terms}
							bind:paymentInfo={invoice.paymentInfo}
							bind:discountType={invoice.discountType}
							bind:discountValue={invoice.discountValue}
							currency={invoice.currency}
						/>
					{/if}
				</div>
			{/if}
		</div>
	{/each}

	<!-- Running total -->
	<div class="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium text-text-muted">{DOCUMENT_LABELS[invoice.documentType as keyof typeof DOCUMENT_LABELS]} Total</span>
			<span class="text-lg font-bold text-accent">{formatCurrency(summary.total, invoice.currency)}</span>
		</div>
	</div>
</div>
