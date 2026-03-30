import type { InvoiceData } from '../types';
import { calculateLineItem, calculateInvoiceSummary } from '../calculations';

export type CSVFormat = 'quickbooks' | 'xero' | 'wave';

function escapeCSV(value: string): string {
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

function formatDateUS(dateStr: string): string {
	if (!dateStr) return '';
	const [year, month, day] = dateStr.split('-');
	return `${month}/${day}/${year}`;
}

function toCSV(headers: string[], rows: string[][]): string {
	const lines = [headers.map(escapeCSV).join(',')];
	for (const row of rows) {
		lines.push(row.map(escapeCSV).join(','));
	}
	return lines.join('\n');
}

function exportQuickBooks(invoice: InvoiceData): string {
	const summary = calculateInvoiceSummary(invoice);
	const headers = [
		'*InvoiceNo', '*Customer', '*InvoiceDate', '*DueDate',
		'*Item(Product/Service)', '*ItemDescription', '*ItemQuantity', '*ItemRate', '*ItemAmount',
		'ItemTaxCode', 'ItemTaxAmount', 'Memo'
	];

	const rows: string[][] = [];
	const taxRate = invoice.taxConfig.mode !== 'none' && invoice.taxConfig.taxLines.length > 0
		? invoice.taxConfig.taxLines[0].rate
		: 0;

	for (const item of invoice.lineItems) {
		const result = calculateLineItem(item);
		const itemTax = item.taxRateOverride !== null
			? result.amount * (item.taxRateOverride / 100)
			: result.amount * (taxRate / 100);

		rows.push([
			invoice.documentNumber,
			invoice.client.name,
			formatDateUS(invoice.issueDate),
			formatDateUS(invoice.dueDate),
			item.description || 'Service',
			item.description,
			String(item.quantity),
			item.unitPrice.toFixed(2),
			result.amount.toFixed(2),
			invoice.taxConfig.mode !== 'none' ? 'TAX' : 'NON',
			invoice.taxConfig.mode !== 'none' ? itemTax.toFixed(2) : '0.00',
			invoice.notes
		]);
	}

	return toCSV(headers, rows);
}

function exportXero(invoice: InvoiceData): string {
	const headers = [
		'*ContactName', 'EmailAddress', '*InvoiceNumber', '*InvoiceDate', '*DueDate',
		'Description', 'Quantity', 'UnitAmount', 'AccountCode', '*TaxType', 'TaxAmount', 'Currency'
	];

	const taxRate = invoice.taxConfig.mode !== 'none' && invoice.taxConfig.taxLines.length > 0
		? invoice.taxConfig.taxLines[0].rate
		: 0;

	const rows: string[][] = [];
	for (const item of invoice.lineItems) {
		const result = calculateLineItem(item);
		const effectiveRate = item.taxRateOverride ?? taxRate;
		const itemTax = result.amount * (effectiveRate / 100);

		rows.push([
			invoice.client.name,
			invoice.client.email,
			invoice.documentNumber,
			invoice.issueDate,
			invoice.dueDate,
			item.description,
			String(item.quantity),
			item.unitPrice.toFixed(2),
			'200',
			invoice.taxConfig.mode !== 'none' ? 'OUTPUT2' : 'NONE',
			invoice.taxConfig.mode !== 'none' ? itemTax.toFixed(2) : '0.00',
			invoice.currency
		]);
	}

	return toCSV(headers, rows);
}

function exportWave(invoice: InvoiceData): string {
	const headers = [
		'Customer', 'Invoice Number', 'Invoice Date', 'Due Date',
		'Item Name', 'Item Description', 'Quantity', 'Price', 'Amount',
		'Tax Name', 'Tax Rate'
	];

	const taxName = invoice.taxConfig.taxLines.length > 0 ? invoice.taxConfig.taxLines[0].name : '';
	const taxRate = invoice.taxConfig.taxLines.length > 0 ? invoice.taxConfig.taxLines[0].rate : 0;

	const rows: string[][] = [];
	for (const item of invoice.lineItems) {
		const result = calculateLineItem(item);

		rows.push([
			invoice.client.name,
			invoice.documentNumber,
			invoice.issueDate,
			invoice.dueDate,
			item.description || 'Service',
			item.description,
			String(item.quantity),
			item.unitPrice.toFixed(2),
			result.amount.toFixed(2),
			invoice.taxConfig.mode !== 'none' ? taxName : '',
			invoice.taxConfig.mode !== 'none' ? String(item.taxRateOverride ?? taxRate) : ''
		]);
	}

	return toCSV(headers, rows);
}

export function exportCSV(invoice: InvoiceData, format: CSVFormat): string {
	switch (format) {
		case 'quickbooks':
			return exportQuickBooks(invoice);
		case 'xero':
			return exportXero(invoice);
		case 'wave':
			return exportWave(invoice);
	}
}
