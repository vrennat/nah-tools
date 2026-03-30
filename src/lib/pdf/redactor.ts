/**
 * PDF Redaction — combines pdfjs-dist (rendering) and @cantoo/pdf-lib (output assembly)
 * to permanently redact content by flattening redacted pages to images.
 */

import type { RedactConfig, RedactRegion, ProgressCallback } from './types';

type PDFJSLib = typeof import('pdfjs-dist');
let pdfjsLib: PDFJSLib;

async function getPDFJS(): Promise<PDFJSLib> {
	if (!pdfjsLib) {
		pdfjsLib = await import('pdfjs-dist');
		pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.mjs',
			import.meta.url
		).href;
	}
	return pdfjsLib;
}

let PDFLib: typeof import('@cantoo/pdf-lib');

async function getPDFLib() {
	if (!PDFLib) {
		PDFLib = await import('@cantoo/pdf-lib');
	}
	return PDFLib;
}

export async function redactPDF(
	source: ArrayBuffer,
	config: RedactConfig,
	onProgress?: ProgressCallback
): Promise<Uint8Array> {
	const pdfjs = await getPDFJS();
	const { PDFDocument } = await getPDFLib();

	const srcPdfjs = await pdfjs.getDocument({ data: source }).promise;
	const srcPdfLib = await PDFDocument.load(source);
	const outDoc = await PDFDocument.create();
	const redactScale = config.scale ?? 2;

	// Build a set of page indices that have redactions
	const redactedPages = new Map<number, RedactRegion[]>();
	for (const pc of config.pages) {
		if (pc.regions.length > 0) {
			redactedPages.set(pc.pageIndex, pc.regions);
		}
	}

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;
	const totalPages = srcPdfLib.getPageCount();

	for (let i = 0; i < totalPages; i++) {
		if (redactedPages.has(i)) {
			// Render page to canvas, apply redactions, embed as image
			const regions = redactedPages.get(i)!;
			const page = await srcPdfjs.getPage(i + 1);
			const viewport = page.getViewport({ scale: redactScale });

			const maxDim = 4096;
			const effectiveScale = Math.min(
				redactScale,
				(maxDim / viewport.width) * redactScale,
				(maxDim / viewport.height) * redactScale
			);
			const finalViewport =
				effectiveScale !== redactScale
					? page.getViewport({ scale: effectiveScale })
					: viewport;

			canvas.width = Math.round(finalViewport.width);
			canvas.height = Math.round(finalViewport.height);
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			await page.render({ canvas, viewport: finalViewport }).promise;
			page.cleanup();

			// Draw black redaction rectangles
			ctx.fillStyle = '#000000';
			for (const r of regions) {
				ctx.fillRect(
					r.x * canvas.width,
					r.y * canvas.height,
					r.width * canvas.width,
					r.height * canvas.height
				);
			}

			// Convert to PNG and embed in new PDF
			const blob = await new Promise<Blob>((resolve, reject) => {
				canvas.toBlob(
					(b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
					'image/png'
				);
			});
			const imgBytes = new Uint8Array(await blob.arrayBuffer());
			const img = await outDoc.embedPng(imgBytes);

			// Get original page size to maintain dimensions
			const origPage = srcPdfLib.getPage(i);
			const { width, height } = origPage.getSize();
			const newPage = outDoc.addPage([width, height]);
			newPage.drawImage(img, { x: 0, y: 0, width, height });
		} else {
			// Copy page as-is (preserves text, vectors, small file size)
			const [copiedPage] = await outDoc.copyPages(srcPdfLib, [i]);
			outDoc.addPage(copiedPage);
		}

		onProgress?.(i + 1, totalPages);
	}

	srcPdfjs.destroy();
	return outDoc.save();
}
