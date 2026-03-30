import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import type { InvoiceData } from '../types';
import type { InvoiceSummary } from '../calculations';
import { DOCUMENT_LABELS } from '../types';
import { buildHeader, buildBillTo, buildLineItemTable, buildTotalsBlock, buildFooter } from './shared';

const ACCENT = '#3b82f6';

export function buildBold(data: InvoiceData, summary: InvoiceSummary): TDocumentDefinitions {
	const docLabel = DOCUMENT_LABELS[data.documentType];

	return {
		pageSize: 'A4',
		pageMargins: [40, 40, 40, 40],
		defaultStyle: {
			font: 'Roboto'
		},
		content: [
			// Accent bar
			{
				canvas: [
					{
						type: 'rect' as const,
						x: 0,
						y: 0,
						w: 515,
						h: 6,
						color: ACCENT
					}
				],
				margin: [0, 0, 0, 20] as [number, number, number, number]
			},
			...buildHeader(data, { accentColor: ACCENT, titleFontSize: 26 }),
			...buildBillTo(data, { labelColor: ACCENT }),
			buildLineItemTable(data, summary, {
				headerBg: ACCENT,
				headerColor: '#ffffff',
				altRowBg: '#eff6ff',
				showBorders: false
			}),
			buildTotalsBlock(data, summary, { accentColor: ACCENT }),
			// Accent footer bar
			{
				canvas: [
					{
						type: 'rect' as const,
						x: 0,
						y: 0,
						w: 515,
						h: 3,
						color: ACCENT
					}
				],
				margin: [0, 0, 0, 12] as [number, number, number, number]
			},
			...buildFooter(data)
		]
	};
}
