import type { InvoiceData, LineItem, TaxConfig, TaxLine, LineItemCategory } from './types';

export interface LineItemResult {
	subtotal: number;
	discount: number;
	amount: number;
}

export interface CategorySubtotals {
	labor: number;
	materials: number;
	other: number;
	total: number;
}

export interface TaxLineResult {
	name: string;
	rate: number;
	amount: number;
}

export interface InvoiceSummary {
	lineResults: Map<string, LineItemResult>;
	subtotals: CategorySubtotals;
	documentDiscount: number;
	afterDiscount: number;
	taxLines: TaxLineResult[];
	totalTax: number;
	total: number;
}

export function calculateLineItem(item: LineItem): LineItemResult {
	const subtotal = item.quantity * item.unitPrice;
	let discount = 0;
	if (item.discountValue > 0) {
		discount =
			item.discountType === 'percentage' ? subtotal * (item.discountValue / 100) : item.discountValue;
	}
	return {
		subtotal,
		discount: Math.min(discount, subtotal),
		amount: Math.max(0, subtotal - discount)
	};
}

export function calculateSubtotals(items: LineItem[]): CategorySubtotals {
	const result: CategorySubtotals = { labor: 0, materials: 0, other: 0, total: 0 };
	for (const item of items) {
		const { amount } = calculateLineItem(item);
		result[item.category] += amount;
		result.total += amount;
	}
	return result;
}

export function calculateDocumentDiscount(
	subtotal: number,
	discountType: 'percentage' | 'fixed',
	discountValue: number
): number {
	if (discountValue <= 0) return 0;
	const discount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
	return Math.min(discount, subtotal);
}

export function calculateTaxes(
	afterDiscount: number,
	taxConfig: TaxConfig,
	items: LineItem[]
): TaxLineResult[] {
	if (taxConfig.mode === 'none' || taxConfig.reverseCharge) return [];

	const results: TaxLineResult[] = [];

	if (taxConfig.mode === 'single' && taxConfig.taxLines.length > 0) {
		const taxLine = taxConfig.taxLines[0];

		// Check for per-line tax overrides
		let taxableAmount = 0;
		let overrideAmount = 0;
		let hasOverrides = false;

		for (const item of items) {
			const { amount } = calculateLineItem(item);
			if (item.taxRateOverride !== null) {
				hasOverrides = true;
				overrideAmount += amount * (item.taxRateOverride / 100);
			} else {
				taxableAmount += amount;
			}
		}

		if (hasOverrides) {
			// Apply document discount proportionally
			const totalBeforeDiscount = taxableAmount + items
				.filter((i) => i.taxRateOverride !== null)
				.reduce((sum, i) => sum + calculateLineItem(i).amount, 0);
			const discountRatio = totalBeforeDiscount > 0 ? afterDiscount / totalBeforeDiscount : 1;

			const mainTax = taxableAmount * discountRatio * (taxLine.rate / 100);
			if (mainTax > 0) {
				results.push({ name: taxLine.name, rate: taxLine.rate, amount: mainTax });
			}
			if (overrideAmount > 0) {
				results.push({ name: 'Line item taxes', rate: 0, amount: overrideAmount * discountRatio });
			}
		} else {
			if (taxConfig.pricesIncludeTax) {
				const taxAmount = afterDiscount - afterDiscount / (1 + taxLine.rate / 100);
				results.push({ name: taxLine.name, rate: taxLine.rate, amount: taxAmount });
			} else {
				results.push({
					name: taxLine.name,
					rate: taxLine.rate,
					amount: afterDiscount * (taxLine.rate / 100)
				});
			}
		}
	} else if (taxConfig.mode === 'multi' || taxConfig.mode === 'compound') {
		let runningBase = afterDiscount;

		for (const taxLine of taxConfig.taxLines) {
			const base = taxLine.isCompound ? runningBase : afterDiscount;
			let taxAmount: number;

			if (taxConfig.pricesIncludeTax) {
				taxAmount = base - base / (1 + taxLine.rate / 100);
			} else {
				taxAmount = base * (taxLine.rate / 100);
			}

			results.push({ name: taxLine.name, rate: taxLine.rate, amount: taxAmount });

			if (taxConfig.mode === 'compound') {
				runningBase += taxAmount;
			}
		}
	}

	return results;
}

export function calculateInvoiceSummary(invoice: InvoiceData): InvoiceSummary {
	const lineResults = new Map<string, LineItemResult>();
	for (const item of invoice.lineItems) {
		lineResults.set(item.id, calculateLineItem(item));
	}

	const subtotals = calculateSubtotals(invoice.lineItems);
	const documentDiscount = calculateDocumentDiscount(
		subtotals.total,
		invoice.discountType,
		invoice.discountValue
	);
	const afterDiscount = subtotals.total - documentDiscount;
	const taxLines = calculateTaxes(afterDiscount, invoice.taxConfig, invoice.lineItems);
	const totalTax = taxLines.reduce((sum, t) => sum + t.amount, 0);

	let total: number;
	if (invoice.taxConfig.pricesIncludeTax) {
		total = afterDiscount;
	} else {
		total = afterDiscount + totalTax;
	}

	return {
		lineResults,
		subtotals,
		documentDiscount,
		afterDiscount,
		taxLines,
		totalTax,
		total
	};
}
