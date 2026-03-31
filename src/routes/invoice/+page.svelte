<script lang="ts">
	import type { InvoiceData, DocumentType } from '$invoice/types';
	import { createEmptyInvoice, DOCUMENT_PREFIXES } from '$invoice/types';
	import { listInvoices, getInvoice, saveInvoice, nextDocumentNumber } from '$invoice/storage';
	import DocumentTypeSelector from '$components/invoice/DocumentTypeSelector.svelte';
	import CurrencyPicker from '$components/invoice/CurrencyPicker.svelte';
	import InvoiceManager from '$components/invoice/InvoiceManager.svelte';
	import InvoiceEditor from '$components/invoice/InvoiceEditor.svelte';
	import InvoicePreview from '$components/invoice/InvoicePreview.svelte';
	import TemplatePicker from '$components/invoice/TemplatePicker.svelte';
	import ExportBar from '$components/invoice/ExportBar.svelte';
	import ImportDialog from '$components/invoice/ImportDialog.svelte';

	let invoice = $state<InvoiceData>(createEmptyInvoice());
	let activeTab = $state<'editor' | 'preview'>('editor');
	let saveTimeout: ReturnType<typeof setTimeout> | undefined;
	let loaded = $state(false);

	// Load most recent invoice on mount
	$effect(() => {
		if (loaded) return;
		loadInitial();
	});

	async function loadInitial() {
		const all = await listInvoices();
		if (all.length > 0) {
			const sorted = [...all].sort(
				(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			);
			const data = await getInvoice(sorted[0].id);
			if (data) {
				invoice = data;
			}
		} else {
			// First use: assign a document number
			invoice.documentNumber = await nextDocumentNumber('invoice');
		}
		loaded = true;
	}

	// Auto-save with debounce
	$effect(() => {
		if (!loaded) return;
		const snapshot = JSON.stringify(invoice);
		void snapshot;

		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			const data = JSON.parse(snapshot) as InvoiceData;
			data.updatedAt = new Date().toISOString();
			saveInvoice(data);
		}, 1000);

		return () => clearTimeout(saveTimeout);
	});

	function handleSelect(selected: InvoiceData) {
		invoice = selected;
	}

	function handleImport(data: InvoiceData) {
		invoice = data;
	}

	async function handleDocTypeChange(newType: DocumentType) {
		if (newType !== invoice.documentType) {
			const oldPrefix = DOCUMENT_PREFIXES[invoice.documentType];
			invoice.documentType = newType;
			// Generate new number for the new doc type if it's a new draft
			if (!invoice.documentNumber || invoice.documentNumber.startsWith(oldPrefix)) {
				invoice.documentNumber = await nextDocumentNumber(newType);
			}
		}
	}
</script>

<svelte:head>
	<title>Free Invoice Generator — nah</title>
	<meta
		name="description"
		content="Create professional invoices, estimates, and receipts for free. No signup, no watermarks, no tracking. PDF export, accounting CSV, e-invoice support. Everything stays in your browser."
	/>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'nah Invoice Generator',
		url: 'https://nah.tools/invoice',
		description:
			'Free, privacy-first invoice generator. Create invoices, credit notes, estimates, receipts, and proforma invoices. Export to PDF, CSV, and JSON. No signup required.',
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		featureList: [
			'PDF export with 3 templates',
			'CSV export for QuickBooks, Xero, Wave',
			'Multi-currency support',
			'Tax configuration',
			'Client directory',
			'Offline capable',
			'No account required'
		]
	})}</script>`}
</svelte:head>

<div class="mx-auto max-w-7xl space-y-6">
	<!-- Header -->
	<section class="text-center">
		<h1 class="text-3xl font-700 tracking-tight sm:text-4xl">
			Invoices. <span class="text-accent">No signup.</span>
		</h1>
		<p class="mx-auto mt-2 max-w-2xl text-text-muted">
			Create professional invoices, estimates, and receipts — everything stays in your browser.
		</p>
	</section>

	<!-- Controls bar -->
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="flex flex-wrap items-center gap-3">
			<InvoiceManager bind:currentInvoice={invoice} onselect={handleSelect} />
			<ImportDialog onimport={handleImport} />
		</div>
		<CurrencyPicker bind:value={invoice.currency} />
	</div>

	<!-- Document type -->
	<DocumentTypeSelector bind:value={invoice.documentType} />

	<!-- Mobile tab toggle -->
	<div class="flex gap-1 rounded-lg bg-surface-alt p-1 sm:hidden">
		<button
			onclick={() => { activeTab = 'editor'; }}
			class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors {activeTab === 'editor' ? 'bg-surface text-text shadow-sm' : 'text-text-muted'}"
		>
			Editor
		</button>
		<button
			onclick={() => { activeTab = 'preview'; }}
			class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors {activeTab === 'preview' ? 'bg-surface text-text shadow-sm' : 'text-text-muted'}"
		>
			Preview
		</button>
	</div>

	<!-- Split panel -->
	<div class="grid gap-6 sm:grid-cols-[45fr_55fr]">
		<div
			class:hidden={activeTab !== 'editor'}
			class:sm:block={activeTab !== 'editor'}
		>
			<InvoiceEditor bind:invoice />
		</div>

		<div
			class:hidden={activeTab !== 'preview'}
			class:sm:block={activeTab !== 'preview'}
		>
			<div class="sticky top-4 space-y-4">
				<TemplatePicker bind:value={invoice.template} />
				<InvoicePreview {invoice} />
				<ExportBar {invoice} />
			</div>
		</div>
	</div>
</div>
