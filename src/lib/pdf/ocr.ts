/**
 * PDF OCR — makes scanned PDFs searchable by adding an invisible text layer.
 * Uses pdfjs-dist for rendering, tesseract.js for OCR, and @cantoo/pdf-lib for text overlay.
 */

import type { OCRConfig } from './types';

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

export interface OCRProgress {
	phase: 'rendering' | 'recognizing' | 'embedding';
	page: number;
	totalPages: number;
	pageProgress: number; // 0-1 for current page
}

export interface OCRResult {
	pdfBytes: Uint8Array;
	pageCount: number;
	wordsFound: number;
}

/**
 * Check if a PDF page already has significant text content.
 */
async function pageHasText(page: any): Promise<boolean> {
	const content = await page.getTextContent();
	const text = content.items
		.filter((item: any) => 'str' in item)
		.map((item: any) => item.str)
		.join('')
		.trim();
	return text.length > 50; // arbitrary threshold
}

/**
 * Run OCR on a PDF and return a new PDF with invisible text overlay.
 */
export async function ocrPDF(
	source: ArrayBuffer,
	config: OCRConfig,
	onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
	const pdfjs = await getPDFJS();
	const { PDFDocument, StandardFonts, rgb } = await import('@cantoo/pdf-lib');
	const Tesseract = await import('tesseract.js');

	// Load PDF with both libraries
	const pdfDoc = await pdfjs.getDocument({ data: source }).promise;
	const numPages = pdfDoc.numPages;

	// Load into pdf-lib for modification
	const doc = await PDFDocument.load(source, { ignoreEncryption: true });
	const font = await doc.embedFont(StandardFonts.Helvetica);

	let totalWords = 0;
	const DPI_SCALE = 3; // render at 3x for ~216 DPI (good balance of quality vs speed)

	// Create a single Tesseract worker for all pages
	let currentPage = 0;
	const worker = await Tesseract.createWorker(config.language, undefined, {
		logger: (m: any) => {
			if (m.status === 'recognizing text' && onProgress) {
				onProgress({
					phase: 'recognizing',
					page: currentPage,
					totalPages: numPages,
					pageProgress: m.progress || 0
				});
			}
		}
	});

	for (let i = 0; i < numPages; i++) {
		currentPage = i + 1;
		const pdfjsPage = await pdfDoc.getPage(i + 1);

		// Check if page already has text
		const hasText = await pageHasText(pdfjsPage);
		if (hasText) {
			pdfjsPage.cleanup();
			onProgress?.({
				phase: 'recognizing',
				page: i + 1,
				totalPages: numPages,
				pageProgress: 1
			});
			continue;
		}

		// Render page to canvas
		onProgress?.({
			phase: 'rendering',
			page: i + 1,
			totalPages: numPages,
			pageProgress: 0
		});

		const scaledViewport = pdfjsPage.getViewport({ scale: DPI_SCALE });
		const canvas = document.createElement('canvas');
		canvas.width = scaledViewport.width;
		canvas.height = scaledViewport.height;
		const ctx = canvas.getContext('2d')!;

		// White background
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		await pdfjsPage.render({ canvas, viewport: scaledViewport }).promise;

		// OCR the rendered page
		onProgress?.({
			phase: 'recognizing',
			page: i + 1,
			totalPages: numPages,
			pageProgress: 0
		});

		const { data } = await worker.recognize(canvas);

		// Extract words from nested structure: blocks -> paragraphs -> lines -> words
		const words: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }[] = [];
		if (data.blocks) {
			for (const block of data.blocks) {
				if (!block.paragraphs) continue;
				for (const paragraph of block.paragraphs) {
					if (!paragraph.lines) continue;
					for (const line of paragraph.lines) {
						for (const word of line.words) {
							words.push(word);
						}
					}
				}
			}
		}

		// Overlay invisible text on the pdf-lib page
		onProgress?.({
			phase: 'embedding',
			page: i + 1,
			totalPages: numPages,
			pageProgress: 0
		});

		const pdfPage = doc.getPage(i);
		const { width: pdfWidth, height: pdfHeight } = pdfPage.getSize();

		for (const word of words) {
			if (!word.text.trim()) continue;
			totalWords++;

			// Convert from pixel coordinates (top-left origin) to PDF coordinates (bottom-left origin)
			const x = (word.bbox.x0 / scaledViewport.width) * pdfWidth;
			const wordTop = (word.bbox.y0 / scaledViewport.height) * pdfHeight;
			const wordBottom = (word.bbox.y1 / scaledViewport.height) * pdfHeight;
			const y = pdfHeight - wordBottom;

			// Estimate font size from word bounding box
			const wordHeightPdf = wordBottom - wordTop;
			const fontSize = Math.max(4, Math.min(wordHeightPdf * 0.8, 72));

			try {
				pdfPage.drawText(word.text, {
					x,
					y,
					size: fontSize,
					font,
					color: rgb(0, 0, 0),
					opacity: 0 // invisible
				});
			} catch {
				// Skip words that can't be embedded (special characters not in font)
			}
		}

		pdfjsPage.cleanup();
		// Release canvas memory
		canvas.width = 0;
		canvas.height = 0;
	}

	await worker.terminate();
	pdfDoc.destroy();

	const pdfBytes = await doc.save();

	return {
		pdfBytes,
		pageCount: numPages,
		wordsFound: totalWords
	};
}
