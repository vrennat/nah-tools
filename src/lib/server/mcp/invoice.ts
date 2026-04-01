/**
 * MCP Tools — Invoice Calculations
 *
 * Pure math operations for invoice/billing calculations.
 * No DOM or file I/O required.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
	calculateLineItem,
	calculateSubtotals,
	calculateDocumentDiscount,
	calculateTaxes
} from '$invoice/calculations';
import type { LineItem, TaxConfig, TaxLine } from '$invoice/types';

function error(message: string) {
	return { content: [{ type: 'text' as const, text: message }], isError: true };
}

const lineItemSchema = z.object({
	id: z.string().optional().describe('Line item ID (auto-generated if omitted)'),
	description: z.string().describe('Description of the line item'),
	quantity: z.number().positive().describe('Quantity'),
	unit_price: z.number().min(0).describe('Unit price'),
	unit_type: z.string().optional().describe('Unit type (hours, days, pieces, items, etc.)'),
	discount_type: z.enum(['percentage', 'fixed']).optional().describe('Discount type (default: percentage)'),
	discount_value: z.number().min(0).optional().describe('Discount value (default: 0)'),
	tax_rate_override: z.number().nullable().optional().describe('Per-item tax rate override (null = use document tax)'),
	category: z.enum(['labor', 'materials', 'other']).optional().describe('Item category (default: other)')
});

const taxLineSchema = z.object({
	name: z.string().describe('Tax name (e.g. "VAT", "Sales Tax")'),
	rate: z.number().min(0).describe('Tax rate as percentage (e.g. 20 for 20%)'),
	is_compound: z.boolean().optional().describe('Whether this tax compounds on previous taxes (default: false)')
});

export function registerInvoiceTools(server: McpServer) {
	server.registerTool('invoice_calculate', {
		title: 'Calculate Invoice',
		description:
			'Calculate invoice totals from line items with support for per-item discounts, multi-tax configurations (single, multi, compound), document-level discounts, and tax-inclusive pricing. Returns detailed breakdown of subtotals, discounts, taxes, and grand total.',
		inputSchema: {
			line_items: z.array(lineItemSchema).min(1).describe('Line items on the invoice'),
			tax_mode: z
				.enum(['none', 'single', 'multi', 'compound'])
				.optional()
				.describe('Tax mode: none, single (one tax rate), multi (parallel rates), compound (stacked rates). Default: none'),
			tax_lines: z.array(taxLineSchema).optional().describe('Tax lines (required if tax_mode is not "none")'),
			prices_include_tax: z.boolean().optional().describe('Whether line item prices already include tax (default: false)'),
			reverse_charge: z.boolean().optional().describe('Whether reverse charge applies — shows tax at 0% (default: false)'),
			document_discount_type: z.enum(['percentage', 'fixed']).optional().describe('Document-level discount type'),
			document_discount_value: z.number().min(0).optional().describe('Document-level discount value'),
			currency: z.string().optional().describe('Currency code for display (e.g. "USD", "EUR"). Does not affect calculation.')
		},
		annotations: { readOnlyHint: true }
	}, async ({
		line_items, tax_mode, tax_lines, prices_include_tax,
		reverse_charge, document_discount_type, document_discount_value, currency
	}) => {
		try {
			// Convert to internal types
			const items: LineItem[] = line_items.map((item, i) => ({
				id: item.id ?? `item-${i + 1}`,
				description: item.description,
				quantity: item.quantity,
				unitType: (item.unit_type as LineItem['unitType']) ?? 'items',
				customUnit: '',
				unitPrice: item.unit_price,
				discountType: item.discount_type ?? 'percentage',
				discountValue: item.discount_value ?? 0,
				taxRateOverride: item.tax_rate_override ?? null,
				category: item.category ?? 'other',
				sortOrder: i
			}));

			const taxConfig: TaxConfig = {
				mode: tax_mode ?? 'none',
				taxLines: (tax_lines ?? []).map((t, i) => ({
					id: `tax-${i + 1}`,
					name: t.name,
					rate: t.rate,
					isCompound: t.is_compound ?? false
				})),
				pricesIncludeTax: prices_include_tax ?? false,
				reverseCharge: reverse_charge ?? false
			};

			// Calculate everything
			const lineResults = items.map((item) => {
				const result = calculateLineItem(item);
				return {
					id: item.id,
					description: item.description,
					quantity: item.quantity,
					unit_price: item.unitPrice,
					subtotal: round(result.subtotal),
					discount: round(result.discount),
					amount: round(result.amount)
				};
			});

			const subtotals = calculateSubtotals(items);
			const docDiscount = calculateDocumentDiscount(
				subtotals.total,
				document_discount_type ?? 'percentage',
				document_discount_value ?? 0
			);
			const afterDiscount = subtotals.total - docDiscount;
			const taxResults = calculateTaxes(afterDiscount, taxConfig, items);
			const totalTax = taxResults.reduce((sum, t) => sum + t.amount, 0);
			const total = prices_include_tax ? afterDiscount : afterDiscount + totalTax;

			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						currency: currency ?? 'USD',
						line_items: lineResults,
						subtotals: {
							labor: round(subtotals.labor),
							materials: round(subtotals.materials),
							other: round(subtotals.other),
							total: round(subtotals.total)
						},
						document_discount: round(docDiscount),
						after_discount: round(afterDiscount),
						taxes: taxResults.map((t) => ({
							name: t.name,
							rate: t.rate,
							amount: round(t.amount)
						})),
						total_tax: round(totalTax),
						total: round(total),
						prices_include_tax: prices_include_tax ?? false
					}, null, 2)
				}]
			};
		} catch (e) {
			return error(`Calculation failed: ${e instanceof Error ? e.message : e}`);
		}
	});
}

function round(n: number): number {
	return Math.round(n * 100) / 100;
}
