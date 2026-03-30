/**
 * PDF Processing — wraps @cantoo/pdf-lib for client-side PDF manipulation.
 * All functions are async and lazily load the library on first use.
 */

import type { PageNumberConfig, PageRange, ProgressCallback, WatermarkConfig } from './types';

let PDFLib: typeof import('@cantoo/pdf-lib');

async function getPDFLib() {
	if (!PDFLib) {
		PDFLib = await import('@cantoo/pdf-lib');
	}
	return PDFLib;
}

/** Get page count from a PDF without full parsing */
export async function getPageCount(source: ArrayBuffer): Promise<number> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source, { ignoreEncryption: true });
	return doc.getPageCount();
}

/** Merge multiple PDFs into one */
export async function mergePDFs(
	files: ArrayBuffer[],
	onProgress?: ProgressCallback
): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const merged = await PDFDocument.create();

	for (let i = 0; i < files.length; i++) {
		const source = await PDFDocument.load(files[i]);
		const pages = await merged.copyPages(source, source.getPageIndices());
		for (const page of pages) {
			merged.addPage(page);
		}
		onProgress?.(i + 1, files.length);
	}

	return merged.save();
}

/** Split a PDF into separate documents by page ranges */
export async function splitPDF(
	source: ArrayBuffer,
	ranges: PageRange[]
): Promise<Uint8Array[]> {
	const { PDFDocument } = await getPDFLib();
	const srcDoc = await PDFDocument.load(source);
	const results: Uint8Array[] = [];

	for (const range of ranges) {
		const newDoc = await PDFDocument.create();
		const indices = [];
		for (let i = range.start - 1; i < range.end; i++) {
			indices.push(i);
		}
		const pages = await newDoc.copyPages(srcDoc, indices);
		for (const page of pages) {
			newDoc.addPage(page);
		}
		results.push(await newDoc.save());
	}

	return results;
}

/** Rotate specific pages (rotations is a map of 0-based page index to degrees: 90, 180, 270) */
export async function rotatePages(
	source: ArrayBuffer,
	rotations: Map<number, number>
): Promise<Uint8Array> {
	const { PDFDocument, degrees } = await getPDFLib();
	const doc = await PDFDocument.load(source);

	for (const [pageIndex, rotation] of rotations) {
		const page = doc.getPage(pageIndex);
		const current = page.getRotation().angle;
		page.setRotation(degrees((current + rotation) % 360));
	}

	return doc.save();
}

/** Remove pages by their 0-based indices */
export async function removePages(
	source: ArrayBuffer,
	pageIndicesToRemove: number[]
): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source);

	// Remove from end to avoid index shifting
	const sorted = [...pageIndicesToRemove].sort((a, b) => b - a);
	for (const index of sorted) {
		doc.removePage(index);
	}

	return doc.save();
}

/** Reorder pages according to a new index order */
export async function reorderPages(
	source: ArrayBuffer,
	newOrder: number[]
): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const srcDoc = await PDFDocument.load(source);
	const newDoc = await PDFDocument.create();

	const pages = await newDoc.copyPages(srcDoc, newOrder);
	for (const page of pages) {
		newDoc.addPage(page);
	}

	return newDoc.save();
}

/** Convert images to a PDF document */
export async function imagesToPDF(
	images: { data: ArrayBuffer; type: 'png' | 'jpg' }[],
	pageSize: 'a4' | 'letter' | 'fit' = 'fit',
	onProgress?: ProgressCallback
): Promise<Uint8Array> {
	const { PDFDocument, PageSizes } = await getPDFLib();
	const doc = await PDFDocument.create();

	for (let i = 0; i < images.length; i++) {
		const img = images[i];
		const embedded =
			img.type === 'png'
				? await doc.embedPng(img.data)
				: await doc.embedJpg(img.data);

		const imgWidth = embedded.width;
		const imgHeight = embedded.height;

		let pageWidth: number;
		let pageHeight: number;

		if (pageSize === 'fit') {
			pageWidth = imgWidth;
			pageHeight = imgHeight;
		} else {
			const [w, h] = pageSize === 'a4' ? PageSizes.A4 : PageSizes.Letter;
			pageWidth = w;
			pageHeight = h;
		}

		const page = doc.addPage([pageWidth, pageHeight]);

		if (pageSize === 'fit') {
			page.drawImage(embedded, { x: 0, y: 0, width: imgWidth, height: imgHeight });
		} else {
			// Scale to fit within page with margins
			const margin = 36; // 0.5 inch
			const availW = pageWidth - margin * 2;
			const availH = pageHeight - margin * 2;
			const scale = Math.min(availW / imgWidth, availH / imgHeight, 1);
			const w = imgWidth * scale;
			const h = imgHeight * scale;
			const x = (pageWidth - w) / 2;
			const y = (pageHeight - h) / 2;
			page.drawImage(embedded, { x, y, width: w, height: h });
		}

		onProgress?.(i + 1, images.length);
	}

	return doc.save();
}

/** Basic PDF compression — strips metadata and removes duplicate objects */
export async function compressPDF(source: ArrayBuffer): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source);

	// Strip metadata
	doc.setTitle('');
	doc.setAuthor('');
	doc.setSubject('');
	doc.setKeywords([]);
	doc.setProducer('');
	doc.setCreator('');

	return doc.save({
		useObjectStreams: true,
		addDefaultPage: false
	});
}

/** Add page numbers to a PDF */
export async function addPageNumbers(
	source: ArrayBuffer,
	config: PageNumberConfig
): Promise<Uint8Array> {
	const { PDFDocument, rgb, StandardFonts } = await getPDFLib();
	const doc = await PDFDocument.load(source);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();
	const total = pages.length;

	const colorValue = 0.3; // dark gray

	for (let i = 0; i < pages.length; i++) {
		const page = pages[i];
		const { width, height } = page.getSize();
		const pageNum = config.startNumber + i;
		const text = config.format
			.replace('{n}', String(pageNum))
			.replace('{total}', String(total + config.startNumber - 1));

		const textWidth = font.widthOfTextAtSize(text, config.fontSize);

		let x: number;
		let y: number;

		const isTop = config.position.startsWith('top');
		const isLeft = config.position.endsWith('left');
		const isRight = config.position.endsWith('right');

		y = isTop ? height - config.margin : config.margin;

		if (isLeft) {
			x = config.margin;
		} else if (isRight) {
			x = width - config.margin - textWidth;
		} else {
			x = (width - textWidth) / 2;
		}

		page.drawText(text, {
			x,
			y,
			size: config.fontSize,
			font,
			color: rgb(colorValue, colorValue, colorValue)
		});
	}

	return doc.save();
}

/** Add a text watermark to all pages */
export async function addWatermark(
	source: ArrayBuffer,
	config: WatermarkConfig
): Promise<Uint8Array> {
	const { PDFDocument, rgb, StandardFonts, degrees } = await getPDFLib();
	const doc = await PDFDocument.load(source);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();

	// Parse hex color
	const hex = config.color.replace('#', '');
	if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
		throw new Error(`Invalid hex color: ${config.color}`);
	}
	const r = parseInt(hex.slice(0, 2), 16) / 255;
	const g = parseInt(hex.slice(2, 4), 16) / 255;
	const b = parseInt(hex.slice(4, 6), 16) / 255;

	for (const page of pages) {
		const { width, height } = page.getSize();
		const textWidth = font.widthOfTextAtSize(config.text, config.fontSize);

		page.drawText(config.text, {
			x: (width - textWidth) / 2,
			y: height / 2,
			size: config.fontSize,
			font,
			color: rgb(r, g, b),
			opacity: config.opacity,
			rotate: degrees(config.rotation)
		});
	}

	return doc.save();
}
