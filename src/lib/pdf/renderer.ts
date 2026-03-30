/**
 * PDF Rendering — wraps pdfjs-dist for thumbnail generation and PDF-to-image export.
 * All functions lazily load the library on first use.
 */

import type { ExtractedImage, PageThumbnail, ProgressCallback } from './types';

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

/** Render page thumbnails for visual tools (rotate, reorder, remove) */
export async function renderThumbnails(
	source: ArrayBuffer,
	options?: { maxWidth?: number; pages?: number[] }
): Promise<PageThumbnail[]> {
	const pdfjs = await getPDFJS();
	const doc = await pdfjs.getDocument({ data: source }).promise;
	const maxWidth = options?.maxWidth ?? 200;
	const pageIndices = options?.pages ?? Array.from({ length: doc.numPages }, (_, i) => i);
	const thumbnails: PageThumbnail[] = [];
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	for (const pageIndex of pageIndices) {
		const page = await doc.getPage(pageIndex + 1); // pdfjs uses 1-based
		const viewport = page.getViewport({ scale: 1 });
		const scale = maxWidth / viewport.width;
		const scaled = page.getViewport({ scale });

		canvas.width = scaled.width;
		canvas.height = scaled.height;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		await page.render({ canvas, viewport: scaled }).promise;

		thumbnails.push({
			pageIndex,
			dataUrl: canvas.toDataURL('image/png'),
			width: scaled.width,
			height: scaled.height
		});

		page.cleanup();
	}

	doc.destroy();
	return thumbnails;
}

/** Export all PDF pages as images */
export async function pdfToImages(
	source: ArrayBuffer,
	options: { format: 'png' | 'jpg'; quality?: number; scale?: number },
	onProgress?: ProgressCallback
): Promise<Blob[]> {
	const pdfjs = await getPDFJS();
	const doc = await pdfjs.getDocument({ data: source }).promise;
	const scale = options.scale ?? 2;
	const blobs: Blob[] = [];
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	for (let i = 0; i < doc.numPages; i++) {
		const page = await doc.getPage(i + 1);
		const viewport = page.getViewport({ scale: 1 });

		// Cap canvas size for iOS Safari (max ~16.7M pixels)
		const maxDim = 4096;
		const effectiveScale = Math.min(
			scale,
			maxDim / viewport.width,
			maxDim / viewport.height
		);
		const scaled = page.getViewport({ scale: effectiveScale });

		canvas.width = scaled.width;
		canvas.height = scaled.height;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Fill white background for JPG (no transparency)
		if (options.format === 'jpg') {
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		await page.render({ canvas, viewport: scaled }).promise;

		const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png';
		const quality = options.format === 'jpg' ? (options.quality ?? 0.92) : undefined;

		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
				mimeType,
				quality
			);
		});

		blobs.push(blob);
		page.cleanup();
		onProgress?.(i + 1, doc.numPages);
	}

	doc.destroy();
	return blobs;
}

/** Extract all embedded images from a PDF */
export async function extractImages(
	source: ArrayBuffer,
	onProgress?: ProgressCallback
): Promise<ExtractedImage[]> {
	const pdfjs = await getPDFJS();
	const doc = await pdfjs.getDocument({ data: source }).promise;
	const images: ExtractedImage[] = [];
	const seenObjIds = new Set<string>();
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	for (let i = 0; i < doc.numPages; i++) {
		const page = await doc.getPage(i + 1);
		const opList = await page.getOperatorList();

		for (let j = 0; j < opList.fnArray.length; j++) {
			const fn = opList.fnArray[j];
			if (fn !== pdfjs.OPS.paintImageXObject && fn !== pdfjs.OPS.paintInlineImageXObject)
				continue;

			const isInline = fn === pdfjs.OPS.paintInlineImageXObject;
			let imgData: any;

			if (isInline) {
				imgData = opList.argsArray[j][0];
			} else {
				const objId = opList.argsArray[j][0];
				if (seenObjIds.has(objId)) continue;
				seenObjIds.add(objId);
				try {
					imgData = await new Promise((resolve, reject) => {
						page.objs.get(objId, (data: any) => {
							if (data) resolve(data);
							else reject(new Error('No data'));
						});
					});
				} catch {
					continue;
				}
			}

			if (!imgData?.data || !imgData.width || !imgData.height) continue;
			if (imgData.width < 10 || imgData.height < 10) continue;

			// Render to canvas for PNG export
			canvas.width = imgData.width;
			canvas.height = imgData.height;
			const imageData = new ImageData(
				new Uint8ClampedArray(imgData.data),
				imgData.width,
				imgData.height
			);
			ctx.putImageData(imageData, 0, 0);

			const blob = await new Promise<Blob>((resolve, reject) => {
				canvas.toBlob(
					(b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
					'image/png'
				);
			});

			// Thumbnail
			const thumbMax = 200;
			const scale = Math.min(1, thumbMax / Math.max(imgData.width, imgData.height));
			const tw = Math.round(imgData.width * scale);
			const th = Math.round(imgData.height * scale);
			canvas.width = tw;
			canvas.height = th;
			ctx.drawImage(await createImageBitmap(imageData), 0, 0, tw, th);
			const dataUrl = canvas.toDataURL('image/png');

			images.push({
				id: `p${i + 1}-img${images.length}`,
				pageNumber: i + 1,
				width: imgData.width,
				height: imgData.height,
				dataUrl,
				blob
			});
		}

		page.cleanup();
		onProgress?.(i + 1, doc.numPages);
	}

	doc.destroy();
	return images;
}
