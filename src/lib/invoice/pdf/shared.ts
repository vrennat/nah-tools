import type { Content, TableCell } from 'pdfmake/interfaces';
import type { InvoiceData, ContactInfo, LineItem } from '../types';
import type { InvoiceSummary, LineItemResult } from '../calculations';
import { DOCUMENT_LABELS, UNIT_LABELS } from '../types';
import { formatCurrency } from '../currency';

// ──── Date formatting ────

export function formatDate(dateStr: string): string {
	if (!dateStr) return '';
	const [year, month, day] = dateStr.split('-');
	if (!month || !day) return dateStr;
	return `${month}/${day}/${year}`;
}

// ──── Contact block ────

export function contactBlock(contact: ContactInfo, options?: { fontSize?: number; color?: string }): Content[] {
	const fontSize = options?.fontSize ?? 9;
	const color = options?.color ?? '#333333';
	const lines: string[] = [];

	if (contact.name) lines.push(contact.name);
	if (contact.address) lines.push(contact.address);
	const cityLine = [contact.city, contact.state, contact.postalCode].filter(Boolean).join(', ');
	if (cityLine) lines.push(cityLine);
	if (contact.country) lines.push(contact.country);
	if (contact.email) lines.push(contact.email);
	if (contact.phone) lines.push(contact.phone);
	if (contact.taxId) lines.push(`Tax ID: ${contact.taxId}`);
	if (contact.website) lines.push(contact.website);

	return lines.map((line) => ({ text: line, fontSize, color, lineHeight: 1.4 }));
}

// ──── Header (logo + sender + doc info) ────

export function buildHeader(
	invoice: InvoiceData,
	options?: { accentColor?: string; titleFontSize?: number }
): Content[] {
	const accentColor = options?.accentColor ?? '#000000';
	const titleFontSize = options?.titleFontSize ?? 20;
	const docLabel = DOCUMENT_LABELS[invoice.documentType];

	const leftColumn: Content[] = [];

	if (invoice.logoDataUrl) {
		leftColumn.push({
			image: invoice.logoDataUrl,
			width: 120,
			margin: [0, 0, 0, 8] as [number, number, number, number]
		});
	}

	leftColumn.push(...contactBlock(invoice.sender));

	const rightColumn: Content[] = [
		{
			text: docLabel.toUpperCase(),
			fontSize: titleFontSize,
			bold: true,
			alignment: 'right' as const,
			color: accentColor,
			margin: [0, 0, 0, 8] as [number, number, number, number]
		}
	];

	const infoRows: [string, string][] = [];
	if (invoice.documentNumber) infoRows.push([`${docLabel} #`, invoice.documentNumber]);
	if (invoice.issueDate) infoRows.push(['Date', formatDate(invoice.issueDate)]);
	if (invoice.dueDate) infoRows.push(['Due Date', formatDate(invoice.dueDate)]);
	if (invoice.referenceNumber) infoRows.push(['Reference', invoice.referenceNumber]);

	if (infoRows.length > 0) {
		rightColumn.push({
			table: {
				widths: ['auto', 'auto'],
				body: infoRows.map(([label, value]) => [
					{ text: label, fontSize: 9, color: '#666666', alignment: 'right' as const },
					{ text: value, fontSize: 9, bold: true, alignment: 'right' as const }
				])
			},
			layout: 'noBorders'
		});
	}

	return [
		{
			columns: [
				{ width: '*', stack: leftColumn },
				{ width: 'auto', stack: rightColumn }
			],
			margin: [0, 0, 0, 24] as [number, number, number, number]
		}
	];
}

// ──── Bill To block ────

export function buildBillTo(
	invoice: InvoiceData,
	options?: { labelColor?: string }
): Content[] {
	const labelColor = options?.labelColor ?? '#666666';
	return [
		{
			text: 'Bill To',
			fontSize: 9,
			color: labelColor,
			bold: true,
			margin: [0, 0, 0, 4] as [number, number, number, number]
		},
		...contactBlock(invoice.client, { fontSize: 10 }),
		{ text: '', margin: [0, 0, 0, 20] as [number, number, number, number] }
	];
}

// ──── Line item table ────

export function buildLineItemTable(
	invoice: InvoiceData,
	summary: InvoiceSummary,
	options?: {
		headerBg?: string;
		headerColor?: string;
		altRowBg?: string;
		borderColor?: string;
		showBorders?: boolean;
	}
): Content {
	const headerBg = options?.headerBg ?? '#f1f5f9';
	const headerColor = options?.headerColor ?? '#334155';
	const altRowBg = options?.altRowBg ?? '#f8fafc';
	const showBorders = options?.showBorders ?? false;

	const hasDiscounts = invoice.lineItems.some((item) => item.discountValue > 0);
	const hasCategories =
		new Set(invoice.lineItems.map((i) => i.category)).size > 1 &&
		invoice.lineItems.some((i) => i.category !== 'other');

	// Header row
	const headerRow: TableCell[] = [
		{ text: 'Description', bold: true, fontSize: 8, color: headerColor, fillColor: headerBg },
		{ text: 'Qty', bold: true, fontSize: 8, color: headerColor, alignment: 'right' as const, fillColor: headerBg },
		{ text: 'Unit', bold: true, fontSize: 8, color: headerColor, alignment: 'center' as const, fillColor: headerBg },
		{ text: 'Price', bold: true, fontSize: 8, color: headerColor, alignment: 'right' as const, fillColor: headerBg }
	];
	if (hasDiscounts) {
		headerRow.push({ text: 'Discount', bold: true, fontSize: 8, color: headerColor, alignment: 'right' as const, fillColor: headerBg });
	}
	headerRow.push({ text: 'Amount', bold: true, fontSize: 8, color: headerColor, alignment: 'right' as const, fillColor: headerBg });

	const body: TableCell[][] = [headerRow];

	// Sort items
	const sorted = [...invoice.lineItems].sort((a, b) => a.sortOrder - b.sortOrder);

	sorted.forEach((item, idx) => {
		const result = summary.lineResults.get(item.id)!;
		const bg = idx % 2 === 1 ? altRowBg : undefined;
		const unitLabel = item.unitType === 'custom' ? item.customUnit : UNIT_LABELS[item.unitType];

		const row: TableCell[] = [
			{ text: item.description || '—', fontSize: 9, fillColor: bg },
			{ text: String(item.quantity), fontSize: 9, alignment: 'right' as const, fillColor: bg },
			{ text: unitLabel, fontSize: 9, alignment: 'center' as const, color: '#666666', fillColor: bg },
			{ text: formatCurrency(item.unitPrice, invoice.currency), fontSize: 9, alignment: 'right' as const, fillColor: bg }
		];
		if (hasDiscounts) {
			const discountText = item.discountValue > 0
				? item.discountType === 'percentage'
					? `${item.discountValue}%`
					: formatCurrency(item.discountValue, invoice.currency)
				: '';
			row.push({ text: discountText, fontSize: 9, alignment: 'right' as const, color: '#666666', fillColor: bg });
		}
		row.push({
			text: formatCurrency(result.amount, invoice.currency),
			fontSize: 9,
			bold: true,
			alignment: 'right' as const,
			fillColor: bg
		});

		body.push(row);
	});

	const colWidths: (string | number)[] = ['*', 40, 40, 70];
	if (hasDiscounts) colWidths.push(60);
	colWidths.push(80);

	const tableContent: Content = {
		table: {
			headerRows: 1,
			widths: colWidths,
			body
		},
		layout: showBorders
			? {
					hLineWidth: () => 0.5,
					vLineWidth: () => 0.5,
					hLineColor: () => options?.borderColor ?? '#e2e8f0',
					vLineColor: () => options?.borderColor ?? '#e2e8f0',
					paddingLeft: () => 6,
					paddingRight: () => 6,
					paddingTop: () => 5,
					paddingBottom: () => 5
				}
			: {
					hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length ? 0.5 : 0),
					vLineWidth: () => 0,
					hLineColor: () => '#e2e8f0',
					paddingLeft: () => 6,
					paddingRight: () => 6,
					paddingTop: () => 5,
					paddingBottom: () => 5
				},
		margin: [0, 0, 0, 4] as [number, number, number, number]
	};

	const result: Content[] = [tableContent];

	// Category subtotals
	if (hasCategories) {
		const cats = [
			{ key: 'labor' as const, label: 'Labor' },
			{ key: 'materials' as const, label: 'Materials' }
		];
		const catLines: Content[] = [];
		for (const cat of cats) {
			if (summary.subtotals[cat.key] > 0) {
				catLines.push({
					columns: [
						{ text: `${cat.label} Subtotal`, fontSize: 8, color: '#666666', width: '*' },
						{
							text: formatCurrency(summary.subtotals[cat.key], invoice.currency),
							fontSize: 8,
							color: '#666666',
							alignment: 'right' as const,
							width: 80
						}
					],
					margin: [0, 2, 0, 0] as [number, number, number, number]
				});
			}
		}
		if (catLines.length > 0) {
			result.push({ stack: catLines, margin: [0, 0, 0, 8] as [number, number, number, number] });
		}
	}

	return { stack: result };
}

// ──── Totals block ────

export function buildTotalsBlock(
	invoice: InvoiceData,
	summary: InvoiceSummary,
	options?: { accentColor?: string }
): Content {
	const accentColor = options?.accentColor ?? '#000000';
	const rows: [string, string, boolean][] = [];

	rows.push(['Subtotal', formatCurrency(summary.subtotals.total, invoice.currency), false]);

	if (summary.documentDiscount > 0) {
		const label =
			invoice.discountType === 'percentage'
				? `Discount (${invoice.discountValue}%)`
				: 'Discount';
		rows.push([label, `−${formatCurrency(summary.documentDiscount, invoice.currency)}`, false]);
	}

	for (const tax of summary.taxLines) {
		const label = tax.rate > 0 ? `${tax.name} (${tax.rate}%)` : tax.name;
		rows.push([label, formatCurrency(tax.amount, invoice.currency), false]);
	}

	if (invoice.taxConfig.reverseCharge) {
		rows.push(['VAT Reverse Charge', 'Applicable', false]);
	}

	const docLabel = DOCUMENT_LABELS[invoice.documentType];
	rows.push([`Total (${invoice.currency})`, formatCurrency(summary.total, invoice.currency), true]);

	const tableBody = rows.map(([label, value, isBold]) => [
		{
			text: label,
			fontSize: isBold ? 11 : 9,
			bold: isBold,
			color: isBold ? accentColor : '#333333',
			alignment: 'right' as const
		},
		{
			text: value,
			fontSize: isBold ? 11 : 9,
			bold: isBold,
			color: isBold ? accentColor : '#333333',
			alignment: 'right' as const
		}
	]);

	return {
		columns: [
			{ width: '*', text: '' },
			{
				width: 'auto',
				table: {
					widths: ['auto', 'auto'],
					body: tableBody
				},
				layout: {
					hLineWidth: (i: number) => (i === tableBody.length - 1 ? 1 : 0),
					vLineWidth: () => 0,
					hLineColor: () => accentColor,
					paddingLeft: () => 8,
					paddingRight: () => 0,
					paddingTop: () => 3,
					paddingBottom: () => 3
				}
			}
		],
		margin: [0, 12, 0, 24] as [number, number, number, number]
	};
}

// ──── Footer (notes, terms, payment) ────

export function buildFooter(invoice: InvoiceData): Content[] {
	const sections: Content[] = [];

	if (invoice.notes) {
		sections.push({
			text: 'Notes',
			fontSize: 9,
			bold: true,
			color: '#666666',
			margin: [0, 0, 0, 3] as [number, number, number, number]
		});
		sections.push({
			text: invoice.notes,
			fontSize: 9,
			color: '#333333',
			margin: [0, 0, 0, 12] as [number, number, number, number]
		});
	}

	if (invoice.terms) {
		sections.push({
			text: 'Terms & Conditions',
			fontSize: 9,
			bold: true,
			color: '#666666',
			margin: [0, 0, 0, 3] as [number, number, number, number]
		});
		sections.push({
			text: invoice.terms,
			fontSize: 9,
			color: '#333333',
			margin: [0, 0, 0, 12] as [number, number, number, number]
		});
	}

	const pi = invoice.paymentInfo;
	const paymentLines: string[] = [];
	if (pi.bankName) paymentLines.push(`Bank: ${pi.bankName}`);
	if (pi.accountName) paymentLines.push(`Account Name: ${pi.accountName}`);
	if (pi.accountNumber) paymentLines.push(`Account #: ${pi.accountNumber}`);
	if (pi.routingNumber) paymentLines.push(`Routing #: ${pi.routingNumber}`);
	if (pi.iban) paymentLines.push(`IBAN: ${pi.iban}`);
	if (pi.swift) paymentLines.push(`SWIFT/BIC: ${pi.swift}`);
	if (pi.paypalEmail) paymentLines.push(`PayPal: ${pi.paypalEmail}`);
	if (pi.customInstructions) paymentLines.push(pi.customInstructions);

	if (paymentLines.length > 0) {
		sections.push({
			text: 'Payment Information',
			fontSize: 9,
			bold: true,
			color: '#666666',
			margin: [0, 0, 0, 3] as [number, number, number, number]
		});
		for (const line of paymentLines) {
			sections.push({ text: line, fontSize: 9, color: '#333333', lineHeight: 1.4 });
		}
	}

	return sections;
}
