import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { InvoiceData } from '../types';
import type { InvoiceSummary } from '../calculations';
import { buildHeader, buildBillTo, buildLineItemTable, buildTotalsBlock, buildFooter } from './shared';

export function buildClassic(data: InvoiceData, summary: InvoiceSummary): TDocumentDefinitions {
	return {
		pageSize: 'A4',
		pageMargins: [40, 40, 40, 40],
		defaultStyle: {
			font: 'Roboto'
		},
		content: [
			// Top border line
			{
				canvas: [
					{
						type: 'line' as const,
						x1: 0,
						y1: 0,
						x2: 515,
						y2: 0,
						lineWidth: 2,
						lineColor: '#1e293b'
					}
				],
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},
			...buildHeader(data, { accentColor: '#1e293b', titleFontSize: 18 }),
			// Separator
			{
				canvas: [
					{
						type: 'line' as const,
						x1: 0,
						y1: 0,
						x2: 515,
						y2: 0,
						lineWidth: 0.5,
						lineColor: '#cbd5e1'
					}
				],
				margin: [0, 0, 0, 16] as [number, number, number, number]
			},
			...buildBillTo(data, { labelColor: '#475569' }),
			buildLineItemTable(data, summary, {
				headerBg: '#f1f5f9',
				headerColor: '#1e293b',
				altRowBg: '#ffffff',
				borderColor: '#cbd5e1',
				showBorders: true
			}),
			buildTotalsBlock(data, summary, { accentColor: '#1e293b' }),
			// Bottom separator
			{
				canvas: [
					{
						type: 'line' as const,
						x1: 0,
						y1: 0,
						x2: 515,
						y2: 0,
						lineWidth: 0.5,
						lineColor: '#cbd5e1'
					}
				],
				margin: [0, 0, 0, 12] as [number, number, number, number]
			},
			...buildFooter(data)
		]
	};
}
