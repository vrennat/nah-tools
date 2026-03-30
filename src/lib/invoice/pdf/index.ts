import type { InvoiceData, InvoiceTemplateId } from '../types';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { calculateInvoiceSummary } from '../calculations';
import { buildClean } from './clean';
import { buildClassic } from './classic';
import { buildBold } from './bold';

export function buildDocDefinition(data: InvoiceData): TDocumentDefinitions {
	const summary = calculateInvoiceSummary(data);

	switch (data.template) {
		case 'clean':
			return buildClean(data, summary);
		case 'classic':
			return buildClassic(data, summary);
		case 'bold':
			return buildBold(data, summary);
		default:
			return buildClean(data, summary);
	}
}

async function getPdfMake() {
	const pdfMakeModule = await import('pdfmake/build/pdfmake');
	const pdfFontsModule = (await import('pdfmake/build/vfs_fonts')) as any;
	const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;

	const vfs =
		pdfFontsModule?.pdfMake?.vfs ??
		pdfFontsModule?.default?.pdfMake?.vfs ??
		pdfFontsModule?.default ??
		null;

	if (vfs && typeof vfs === 'object') {
		pdfMake.vfs = vfs;
	}

	return pdfMake;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
	const pdfMake = await getPdfMake();
	const docDefinition = buildDocDefinition(data);
	const pdf = (pdfMake as any).createPdf(docDefinition);
	return await pdf.getBlob();
}

export function getTemplateMeta(): { id: InvoiceTemplateId; name: string; description: string }[] {
	return [
		{
			id: 'clean',
			name: 'Clean',
			description: 'Minimal layout with generous whitespace. Modern and professional.'
		},
		{
			id: 'classic',
			name: 'Classic',
			description: 'Traditional formal layout with borders and structured grid.'
		},
		{
			id: 'bold',
			name: 'Bold',
			description: 'Strong accent colors and heavy typography. Makes a statement.'
		}
	];
}
