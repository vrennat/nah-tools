/**
 * PDF Comparison — renders two PDFs page-by-page and produces pixel-level diff images.
 * Lazily loads pdfjs-dist on first use, following the same pattern as renderer.ts.
 */

import type { CompareOptions, PageCompareResult, ProgressCallback } from './types';

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

/** Compare two PDFs page-by-page and return diff results for each page */
export async function comparePDFs(
	original: ArrayBuffer,
	revised: ArrayBuffer,
	options?: CompareOptions,
	onProgress?: ProgressCallback
): Promise<PageCompareResult[]> {
	const pdfjs = await getPDFJS();
	const scale = options?.scale ?? 1.5;
	const diffColor = options?.diffColor ?? [255, 0, 80];
	const threshold = options?.threshold ?? 30;

	const [origDoc, revDoc] = await Promise.all([
		pdfjs.getDocument({ data: original }).promise,
		pdfjs.getDocument({ data: revised }).promise
	]);

	const maxPages = Math.max(origDoc.numPages, revDoc.numPages);
	const results: PageCompareResult[] = [];
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	for (let i = 0; i < maxPages; i++) {
		const hasOrig = i < origDoc.numPages;
		const hasRev = i < revDoc.numPages;

		// Render both pages
		const origImg = hasOrig ? await renderPage(origDoc, i + 1, scale, canvas, ctx) : null;
		const revImg = hasRev ? await renderPage(revDoc, i + 1, scale, canvas, ctx) : null;

		// Determine canvas size (use larger dimensions)
		const w = Math.max(origImg?.width ?? 0, revImg?.width ?? 0);
		const h = Math.max(origImg?.height ?? 0, revImg?.height ?? 0);

		// Get data URLs for both
		const origDataUrl =
			origImg?.dataUrl ?? makePlaceholder(w, h, 'Page missing', canvas, ctx);
		const revDataUrl =
			revImg?.dataUrl ?? makePlaceholder(w, h, 'Page missing', canvas, ctx);

		// Get pixel data, padded to the max dimensions if needed
		const origPixels = padPixels(origImg?.pixels ?? null, origImg?.width ?? 0, origImg?.height ?? 0, w, h);
		const revPixels = padPixels(revImg?.pixels ?? null, revImg?.width ?? 0, revImg?.height ?? 0, w, h);

		// Build diff image
		canvas.width = w;
		canvas.height = h;
		const diffImageData = ctx.createImageData(w, h);
		const diff = diffImageData.data;
		let diffCount = 0;
		const total = w * h;

		for (let p = 0; p < total; p++) {
			const idx = p * 4;
			const dr = Math.abs(origPixels[idx] - revPixels[idx]);
			const dg = Math.abs(origPixels[idx + 1] - revPixels[idx + 1]);
			const db = Math.abs(origPixels[idx + 2] - revPixels[idx + 2]);

			if (dr > threshold || dg > threshold || db > threshold) {
				diff[idx] = diffColor[0];
				diff[idx + 1] = diffColor[1];
				diff[idx + 2] = diffColor[2];
				diff[idx + 3] = 255;
				diffCount++;
			} else {
				// Dimmed original
				diff[idx] = origPixels[idx];
				diff[idx + 1] = origPixels[idx + 1];
				diff[idx + 2] = origPixels[idx + 2];
				diff[idx + 3] = 60;
			}
		}

		ctx.putImageData(diffImageData, 0, 0);
		const diffDataUrl = canvas.toDataURL('image/png');

		results.push({
			pageIndex: i,
			originalDataUrl: origDataUrl,
			revisedDataUrl: revDataUrl,
			diffDataUrl,
			diffPixelCount: diffCount,
			totalPixelCount: total,
			diffPercent: Math.round((diffCount / total) * 10000) / 100,
			width: w,
			height: h
		});

		onProgress?.(i + 1, maxPages);
	}

	origDoc.destroy();
	revDoc.destroy();
	return results;
}

async function renderPage(
	doc: { getPage: (n: number) => Promise<any> },
	pageNum: number,
	scale: number,
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D
): Promise<{ width: number; height: number; dataUrl: string; pixels: Uint8ClampedArray }> {
	const page = await doc.getPage(pageNum);
	const viewport = page.getViewport({ scale });

	// Cap canvas size for iOS Safari (max ~16.7M pixels)
	const maxDim = 4096;
	const effectiveScale = Math.min(
		scale,
		(maxDim / viewport.width) * scale,
		(maxDim / viewport.height) * scale
	);
	const finalViewport =
		effectiveScale !== scale ? page.getViewport({ scale: effectiveScale }) : viewport;

	canvas.width = Math.round(finalViewport.width);
	canvas.height = Math.round(finalViewport.height);
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	await page.render({ canvasContext: ctx, viewport: finalViewport }).promise;
	page.cleanup();

	const w = canvas.width;
	const h = canvas.height;
	const pixels = ctx.getImageData(0, 0, w, h).data;
	const dataUrl = canvas.toDataURL('image/png');

	return { width: w, height: h, dataUrl, pixels: new Uint8ClampedArray(pixels) };
}

function makePlaceholder(
	w: number,
	h: number,
	text: string,
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D
): string {
	canvas.width = w || 400;
	canvas.height = h || 600;
	ctx.fillStyle = '#1e293b';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#94a3b8';
	ctx.font = '24px sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText(text, canvas.width / 2, canvas.height / 2);
	return canvas.toDataURL('image/png');
}

/** Pad pixel data to target dimensions with white pixels */
function padPixels(
	pixels: Uint8ClampedArray | null,
	srcW: number,
	srcH: number,
	targetW: number,
	targetH: number
): Uint8ClampedArray {
	if (!pixels) {
		// Return white pixels
		const buf = new Uint8ClampedArray(targetW * targetH * 4);
		for (let i = 0; i < buf.length; i += 4) {
			buf[i] = 255;
			buf[i + 1] = 255;
			buf[i + 2] = 255;
			buf[i + 3] = 255;
		}
		return buf;
	}

	if (srcW === targetW && srcH === targetH) return pixels;

	// Need to pad — place source at top-left, fill rest with white
	const buf = new Uint8ClampedArray(targetW * targetH * 4);
	for (let i = 0; i < buf.length; i += 4) {
		buf[i] = 255;
		buf[i + 1] = 255;
		buf[i + 2] = 255;
		buf[i + 3] = 255;
	}
	for (let y = 0; y < srcH; y++) {
		const srcOffset = y * srcW * 4;
		const dstOffset = y * targetW * 4;
		buf.set(pixels.subarray(srcOffset, srcOffset + srcW * 4), dstOffset);
	}
	return buf;
}
