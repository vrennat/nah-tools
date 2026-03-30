<script lang="ts">
	import type { InvoiceData } from '$invoice/types';
	import { DOCUMENT_LABELS, DOCUMENT_PREFIXES } from '$invoice/types';
	import { generateInvoicePDF } from '$invoice/pdf/index';
	import { exportCSV, type CSVFormat } from '$invoice/export/csv';
	import { generateZUGFeRD, generateUBL } from '$invoice/export/einvoice';

	let { invoice }: { invoice: InvoiceData } = $props();

	let exporting = $state<string | null>(null);
	let error = $state<string | null>(null);
	let showCSVMenu = $state(false);
	let showEInvoiceMenu = $state(false);

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

	function baseFilename(): string {
		const prefix = DOCUMENT_PREFIXES[invoice.documentType];
		const num = invoice.documentNumber || 'draft';
		return `${prefix}-${num}`.replace(/[^a-zA-Z0-9\-_]/g, '_');
	}

	async function downloadPDF() {
		exporting = 'pdf';
		error = null;
		try {
			const blob = await generateInvoicePDF(invoice);
			triggerDownload(blob, `${baseFilename()}.pdf`);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Export failed';
		} finally {
			exporting = null;
		}
	}

	function downloadCSV(format: CSVFormat) {
		exporting = 'csv';
		error = null;
		showCSVMenu = false;
		try {
			const csv = exportCSV(invoice, format);
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
			triggerDownload(blob, `${baseFilename()}-${format}.csv`);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Export failed';
		} finally {
			exporting = null;
		}
	}

	function downloadEInvoice(format: 'zugferd' | 'ubl') {
		exporting = 'einvoice';
		error = null;
		showEInvoiceMenu = false;
		try {
			const xml = format === 'zugferd' ? generateZUGFeRD(invoice) : generateUBL(invoice);
			const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
			const suffix = format === 'zugferd' ? 'factur-x' : 'ubl';
			triggerDownload(blob, `${baseFilename()}-${suffix}.xml`);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Export failed';
		} finally {
			exporting = null;
		}
	}

	function downloadJSON() {
		exporting = 'json';
		error = null;
		try {
			const json = JSON.stringify(invoice, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			triggerDownload(blob, `${baseFilename()}.json`);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Export failed';
		} finally {
			exporting = null;
		}
	}
</script>

<div class="space-y-2">
	<div class="flex flex-wrap gap-2">
		<!-- PDF -->
		<button
			type="button"
			onclick={downloadPDF}
			disabled={exporting !== null}
			class="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
		>
			{#if exporting === 'pdf'}
				<div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
			{:else}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			{/if}
			Download PDF
		</button>

		<!-- CSV -->
		<div class="relative">
			<button
				type="button"
				onclick={() => { showCSVMenu = !showCSVMenu; }}
				disabled={exporting !== null}
				class="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent/50 disabled:opacity-40"
			>
				CSV
				<svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{#if showCSVMenu}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="fixed inset-0 z-40" onclick={() => { showCSVMenu = false; }}></div>
				<div class="absolute left-0 z-50 mt-1 w-44 rounded-lg border border-border bg-surface shadow-lg">
					<button type="button" onclick={() => downloadCSV('quickbooks')}
						class="block w-full px-3 py-2 text-left text-sm hover:bg-surface-alt">QuickBooks</button>
					<button type="button" onclick={() => downloadCSV('xero')}
						class="block w-full px-3 py-2 text-left text-sm hover:bg-surface-alt">Xero</button>
					<button type="button" onclick={() => downloadCSV('wave')}
						class="block w-full px-3 py-2 text-left text-sm hover:bg-surface-alt">Wave</button>
				</div>
			{/if}
		</div>

		<!-- E-Invoice -->
		<div class="relative">
			<button
				type="button"
				onclick={() => { showEInvoiceMenu = !showEInvoiceMenu; }}
				disabled={exporting !== null}
				class="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent/50 disabled:opacity-40"
			>
				E-Invoice
				<span class="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">Beta</span>
				<svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{#if showEInvoiceMenu}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="fixed inset-0 z-40" onclick={() => { showEInvoiceMenu = false; }}></div>
				<div class="absolute left-0 z-50 mt-1 w-52 rounded-lg border border-border bg-surface shadow-lg">
					<button type="button" onclick={() => downloadEInvoice('zugferd')}
						class="block w-full px-3 py-2 text-left text-sm hover:bg-surface-alt">
						<span class="font-medium">ZUGFeRD / Factur-X</span>
						<span class="block text-xs text-text-muted">CII XML (DE/FR)</span>
					</button>
					<button type="button" onclick={() => downloadEInvoice('ubl')}
						class="block w-full px-3 py-2 text-left text-sm hover:bg-surface-alt">
						<span class="font-medium">UBL 2.1</span>
						<span class="block text-xs text-text-muted">Peppol / EN16931</span>
					</button>
				</div>
			{/if}
		</div>

		<!-- JSON -->
		<button
			type="button"
			onclick={downloadJSON}
			disabled={exporting !== null}
			class="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent/50 disabled:opacity-40"
		>
			JSON
		</button>
	</div>

	{#if error}
		<p class="text-xs text-error">{error}</p>
	{/if}
</div>
