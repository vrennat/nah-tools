import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { InvoiceData } from '../types';
import type { InvoiceSummary } from '../calculations';
import { buildHeader, buildBillTo, buildLineItemTable, buildTotalsBlock, buildFooter } from './shared';

export function buildClean(data: InvoiceData, summary: InvoiceSummary): TDocumentDefinitions {
	return {
		pageSize: 'A4',
		pageMargins: [48, 48, 48, 48],
		defaultStyle: {
			font: 'Roboto'
		},
		content: [
			...buildHeader(data, { accentColor: '#1e293b', titleFontSize: 22 }),
			...buildBillTo(data, { labelColor: '#94a3b8' }),
			buildLineItemTable(data, summary, {
				headerBg: '#ffffff',
				headerColor: '#94a3b8',
				altRowBg: '#f8fafc',
				showBorders: false
			}),
			buildTotalsBlock(data, summary, { accentColor: '#1e293b' }),
			...buildFooter(data)
		]
	};
}
