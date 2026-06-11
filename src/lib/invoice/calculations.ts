import type { InvoiceData, LineItem, TaxConfig, TaxLine, LineItemCategory } from './types';
import { getCurrency } from './currency';

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

function round(value: number, decimals: number): number {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
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
	items: LineItem[],
	decimals: number = 2
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
				results.push({ name: taxLine.name, rate: taxLine.rate, amount: round(mainTax, decimals) });
			}
			if (overrideAmount > 0) {
				results.push({ name: 'Line item taxes', rate: 0, amount: round(overrideAmount * discountRatio, decimals) });
			}
		} else {
			if (taxConfig.pricesIncludeTax) {
				const taxAmount = afterDiscount - afterDiscount / (1 + taxLine.rate / 100);
				results.push({ name: taxLine.name, rate: taxLine.rate, amount: round(taxAmount, decimals) });
			} else {
				results.push({
					name: taxLine.name,
					rate: taxLine.rate,
					amount: round(afterDiscount * (taxLine.rate / 100), decimals)
				});
			}
		}
	} else if (taxConfig.mode === 'multi') {
		if (taxConfig.pricesIncludeTax) {
			// Correct inclusive multi-tax extraction: all taxes share the same pre-tax base.
			// Extract the combined tax first, then distribute proportionally by rate.
			// Using independent extraction per line overstates tax when rates overlap.
			const totalRate = taxConfig.taxLines.reduce((sum, t) => sum + t.rate, 0);
			const totalTax = afterDiscount - afterDiscount / (1 + totalRate / 100);
			const totalRateNonZero = totalRate > 0 ? totalRate : 1;

			for (const taxLine of taxConfig.taxLines) {
				const taxAmount = round(totalTax * (taxLine.rate / totalRateNonZero), decimals);
				results.push({ name: taxLine.name, rate: taxLine.rate, amount: taxAmount });
			}
		} else {
			for (const taxLine of taxConfig.taxLines) {
				results.push({
					name: taxLine.name,
					rate: taxLine.rate,
					amount: round(afterDiscount * (taxLine.rate / 100), decimals)
				});
			}
		}
	} else if (taxConfig.mode === 'compound') {
		if (taxConfig.pricesIncludeTax) {
			// Correct inclusive compound extraction.
			// Exclusive compound applies: tax2 is levied on (base + tax1), i.e.
			// final = base * product((1 + r_i/100)) for compound taxes applied in order.
			// To invert: compute the exclusive base, then re-apply each tax in order.
			let compoundFactor = 1;
			for (const taxLine of taxConfig.taxLines) {
				if (taxLine.isCompound) {
					compoundFactor *= (1 + taxLine.rate / 100);
				}
			}
			// For non-compound lines in compound mode, treat as additive on the original base.
			// In practice compound mode usually means all lines are compound — handle uniformly.
			const exclusiveBase = afterDiscount / compoundFactor;
			let runningExclusive = exclusiveBase;

			for (const taxLine of taxConfig.taxLines) {
				const taxAmount = round(runningExclusive * (taxLine.rate / 100), decimals);
				results.push({ name: taxLine.name, rate: taxLine.rate, amount: taxAmount });
				if (taxLine.isCompound) {
					runningExclusive += taxAmount;
				}
			}
		} else {
			// Exclusive compound: each isCompound tax builds on the running total.
			let runningBase = afterDiscount;
			for (const taxLine of taxConfig.taxLines) {
				const base = taxLine.isCompound ? runningBase : afterDiscount;
				const taxAmount = round(base * (taxLine.rate / 100), decimals);
				results.push({ name: taxLine.name, rate: taxLine.rate, amount: taxAmount });
				if (taxLine.isCompound) {
					runningBase += taxAmount;
				}
			}
		}
	}

	return results;
}

export function calculateInvoiceSummary(invoice: InvoiceData): InvoiceSummary {
	const currency = getCurrency(invoice.currency);
	const decimals = currency.decimals;

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
	const taxLines = calculateTaxes(afterDiscount, invoice.taxConfig, invoice.lineItems, decimals);
	const totalTax = round(taxLines.reduce((sum, t) => sum + t.amount, 0), decimals);

	let total: number;
	if (invoice.taxConfig.pricesIncludeTax) {
		total = round(afterDiscount, decimals);
	} else {
		total = round(afterDiscount + totalTax, decimals);
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
