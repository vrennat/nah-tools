import { describe, it, expect } from 'vitest';
import { calculateTaxes, calculateInvoiceSummary } from './calculations';
import type { TaxConfig, TaxLine, InvoiceData } from './types';
import { createId, createEmptyInvoice, createEmptyLineItem } from './types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeConfig(overrides: Partial<TaxConfig> & { taxLines: TaxLine[] }): TaxConfig {
	return {
		mode: 'multi',
		pricesIncludeTax: false,
		reverseCharge: false,
		...overrides
	};
}

function makeLine(rate: number): TaxLine {
	return { id: createId(), name: `Tax ${rate}%`, rate, isCompound: false };
}

function makeCompoundLine(rate: number): TaxLine {
	return { id: createId(), name: `Tax ${rate}%`, rate, isCompound: true };
}

function makeInvoice(
	amount: number,
	taxConfig: TaxConfig,
	currency = 'USD'
): InvoiceData {
	const invoice = createEmptyInvoice();
	const item = createEmptyLineItem(0);
	item.quantity = 1;
	item.unitPrice = amount;
	invoice.lineItems = [item];
	invoice.taxConfig = taxConfig;
	invoice.currency = currency;
	return invoice;
}

// ── Exclusive multi-tax ───────────────────────────────────────────────────────

describe('exclusive multi-tax', () => {
	it('applies each rate independently to the base', () => {
		const config = makeConfig({
			mode: 'multi',
			taxLines: [makeLine(5), makeLine(10)]
		});
		const taxes = calculateTaxes(100, config, [], 2);
		expect(taxes[0].amount).toBe(5);
		expect(taxes[1].amount).toBe(10);
	});

	it('total sums correctly', () => {
		const config = makeConfig({ mode: 'multi', taxLines: [makeLine(7)] });
		const summary = calculateInvoiceSummary(makeInvoice(10, config));
		expect(summary.totalTax).toBe(0.70);
		expect(summary.total).toBe(10.70);
	});
});

// ── Inclusive multi-tax ───────────────────────────────────────────────────────

describe('inclusive multi-tax', () => {
	it('extracts combined tax and distributes proportionally', () => {
		// Price $110 includes 5% + 5% = 10% tax. Pre-tax base = 110 / 1.10 = 100.
		// Each tax line gets 50% of total tax = $5 each.
		const config = makeConfig({
			mode: 'multi',
			pricesIncludeTax: true,
			taxLines: [makeLine(5), makeLine(5)]
		});
		const taxes = calculateTaxes(110, config, [], 2);
		expect(taxes[0].amount).toBe(5);
		expect(taxes[1].amount).toBe(5);
	});

	it('does not overstate tax vs exclusive equivalent', () => {
		// With $100 inclusive of 10% + 5%: totalRate=15%, totalTax = 100 - 100/1.15 ≈ 13.04
		// Independent extraction would give: 100-100/1.10 + 100-100/1.05 ≈ 9.09+4.76=13.85 (wrong)
		const config = makeConfig({
			mode: 'multi',
			pricesIncludeTax: true,
			taxLines: [makeLine(10), makeLine(5)]
		});
		const taxes = calculateTaxes(100, config, [], 4);
		const total = taxes.reduce((s, t) => s + t.amount, 0);
		// Correct: 100 - 100/1.15 ≈ 13.0435
		expect(total).toBeCloseTo(100 - 100 / 1.15, 2);
	});

	it('total equals after-discount when prices include tax', () => {
		const config = makeConfig({
			mode: 'multi',
			pricesIncludeTax: true,
			taxLines: [makeLine(10), makeLine(5)]
		});
		const summary = calculateInvoiceSummary(makeInvoice(115, config));
		expect(summary.total).toBe(115);
	});
});

// ── Exclusive compound tax ────────────────────────────────────────────────────

describe('exclusive compound tax', () => {
	it('applies second tax on (base + first tax)', () => {
		// Base $100, tax1=10% → $10, tax2=5% compound → 5% of $110 = $5.50
		const config = makeConfig({
			mode: 'compound',
			taxLines: [makeCompoundLine(10), makeCompoundLine(5)]
		});
		const taxes = calculateTaxes(100, config, [], 2);
		expect(taxes[0].amount).toBe(10);
		expect(taxes[1].amount).toBe(5.50);
		expect(taxes[0].amount + taxes[1].amount).toBe(15.50);
	});

	it('total = base + compounded taxes', () => {
		const config = makeConfig({
			mode: 'compound',
			taxLines: [makeCompoundLine(10), makeCompoundLine(5)]
		});
		const summary = calculateInvoiceSummary(makeInvoice(100, config));
		expect(summary.total).toBe(115.50);
	});
});

// ── Inclusive compound tax ────────────────────────────────────────────────────

describe('inclusive compound tax', () => {
	it('extracts taxes so that exclusive re-application produces the original price', () => {
		// Price $115.50 inclusive of compound 10% then 5%.
		// exclusive_base = 115.50 / (1.10 * 1.05) = 115.50 / 1.155 = 100
		// tax1 = 100 * 10% = 10, tax2 = 110 * 5% = 5.50
		const config = makeConfig({
			mode: 'compound',
			pricesIncludeTax: true,
			taxLines: [makeCompoundLine(10), makeCompoundLine(5)]
		});
		const taxes = calculateTaxes(115.50, config, [], 2);
		expect(taxes[0].amount).toBeCloseTo(10, 1);
		expect(taxes[1].amount).toBeCloseTo(5.50, 1);
	});

	it('total equals after-discount when prices include tax', () => {
		const config = makeConfig({
			mode: 'compound',
			pricesIncludeTax: true,
			taxLines: [makeCompoundLine(10), makeCompoundLine(5)]
		});
		const summary = calculateInvoiceSummary(makeInvoice(115.50, config));
		expect(summary.total).toBe(115.50);
	});

	it('is consistent inverse of exclusive compound', () => {
		// If exclusive compound on $100 gives $115.50, then inclusive extraction
		// from $115.50 should recover tax1=$10 and tax2=$5.50.
		const exclusive = makeConfig({
			mode: 'compound',
			taxLines: [makeCompoundLine(10), makeCompoundLine(5)]
		});
		const exclusive_taxes = calculateTaxes(100, exclusive, [], 4);
		const total_with_tax = 100 + exclusive_taxes.reduce((s, t) => s + t.amount, 0);

		const inclusive = makeConfig({
			mode: 'compound',
			pricesIncludeTax: true,
			taxLines: [makeCompoundLine(10), makeCompoundLine(5)]
		});
		const inclusive_taxes = calculateTaxes(total_with_tax, inclusive, [], 4);

		expect(inclusive_taxes[0].amount).toBeCloseTo(exclusive_taxes[0].amount, 2);
		expect(inclusive_taxes[1].amount).toBeCloseTo(exclusive_taxes[1].amount, 2);
	});
});

// ── Rounding ──────────────────────────────────────────────────────────────────

describe('rounding', () => {
	it('rounds 7% tax on $10.00 to 2 decimal places', () => {
		// 7% of 10 = 0.70 — exact, but verifies basic rounding path
		const config = makeConfig({ mode: 'single', taxLines: [makeLine(7)] });
		const taxes = calculateTaxes(10.00, config, [], 2);
		expect(taxes[0].amount).toBe(0.70);
	});

	it('rounds fractional amounts to currency decimals (USD=2)', () => {
		// 7% of 9.99 = 0.6993 → rounds to 0.70
		const config = makeConfig({ mode: 'single', taxLines: [makeLine(7)] });
		const taxes = calculateTaxes(9.99, config, [], 2);
		expect(taxes[0].amount).toBe(0.70);
	});

	it('uses 0 decimal places for JPY', () => {
		// JPY has 0 decimals — taxes should be whole numbers.
		const config = makeConfig({ mode: 'single', taxLines: [makeLine(10)] });
		const summary = calculateInvoiceSummary(makeInvoice(1000, config, 'JPY'));
		expect(Number.isInteger(summary.totalTax)).toBe(true);
		expect(Number.isInteger(summary.total)).toBe(true);
	});
});

// ── Exclusive single (regression) ────────────────────────────────────────────

describe('exclusive single-tax (regression)', () => {
	it('unchanged: applies rate to base', () => {
		const config = makeConfig({ mode: 'single', taxLines: [makeLine(20)] });
		const taxes = calculateTaxes(200, config, [], 2);
		expect(taxes[0].amount).toBe(40);
	});
});
