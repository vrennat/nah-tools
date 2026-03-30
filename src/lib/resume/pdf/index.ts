import type { ResumeData, TemplateId } from '../types';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { buildProfessional } from './professional';
import { buildModern } from './modern';
import { buildMinimal } from './minimal';

export function buildDocDefinition(data: ResumeData, template: TemplateId): TDocumentDefinitions {
	switch (template) {
		case 'professional':
			return buildProfessional(data);
		case 'modern':
			return buildModern(data);
		case 'minimal':
			return buildMinimal(data);
		default:
			return buildProfessional(data);
	}
}

async function getPdfMake() {
	const pdfMakeModule = await import('pdfmake/build/pdfmake');
	const pdfFontsModule = (await import('pdfmake/build/vfs_fonts')) as any;
	const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;

	// pdfmake VFS font setup — try all known module shapes
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

export async function generatePDF(data: ResumeData, template: TemplateId = 'professional'): Promise<Blob> {
	const pdfMake = await getPdfMake();
	const docDefinition = buildDocDefinition(data, template);
	const pdf = (pdfMake as any).createPdf(docDefinition);
	// pdfmake 0.3.x: getBlob() returns a Promise (callback arg is ignored)
	return await pdf.getBlob();
}

export function getTemplateMeta(): { id: TemplateId; name: string; description: string }[] {
	return [
		{
			id: 'professional',
			name: 'Professional',
			description: 'Classic single-column layout with clean section headers. Best for traditional industries and ATS compatibility.'
		},
		{
			id: 'modern',
			name: 'Modern',
			description: 'Two-column layout with a sidebar for skills and contact info. Great for tech and creative roles.'
		},
		{
			id: 'minimal',
			name: 'Minimal',
			description: 'Understated single-column design with generous whitespace. Ideal when content speaks for itself.'
		}
	];
}
