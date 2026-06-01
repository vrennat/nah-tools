// Favicon / app-icon generator. Produces a multi-size PNG set and a real ICO
// (with embedded PNGs), packaged as a ZIP. All client-side via canvas + JSZip.

import JSZip from 'jszip';
import { canvasToBlob } from './canvas-utils';

export const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];
const APPLE_TOUCH_SIZE = 180;

/** Square-crop (center) and resize a source image to a given size. */
function renderSize(img: HTMLImageElement | ImageBitmap, size: number, background: string | null): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingQuality = 'high';

	if (background) {
		ctx.fillStyle = background;
		ctx.fillRect(0, 0, size, size);
	}

	const sw = img.width;
	const sh = img.height;
	const side = Math.min(sw, sh);
	const sx = (sw - side) / 2;
	const sy = (sh - side) / 2;
	ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
	return canvas;
}

/** Build an .ico file from PNG-encoded images (modern ICO supports embedded PNG). */
function buildIco(pngs: { size: number; data: ArrayBuffer }[]): Blob {
	const count = pngs.length;
	const headerSize = 6 + count * 16;
	let dataSize = 0;
	for (const p of pngs) dataSize += p.data.byteLength;

	const buffer = new ArrayBuffer(headerSize + dataSize);
	const view = new DataView(buffer);
	const bytes = new Uint8Array(buffer);

	// ICONDIR
	view.setUint16(0, 0, true); // reserved
	view.setUint16(2, 1, true); // type: 1 = icon
	view.setUint16(4, count, true);

	let offset = headerSize;
	for (let i = 0; i < count; i++) {
		const { size, data } = pngs[i];
		const entry = 6 + i * 16;
		view.setUint8(entry, size >= 256 ? 0 : size); // width (0 = 256)
		view.setUint8(entry + 1, size >= 256 ? 0 : size); // height
		view.setUint8(entry + 2, 0); // color palette
		view.setUint8(entry + 3, 0); // reserved
		view.setUint16(entry + 4, 1, true); // color planes
		view.setUint16(entry + 6, 32, true); // bits per pixel
		view.setUint32(entry + 8, data.byteLength, true); // size of image data
		view.setUint32(entry + 12, offset, true); // offset of image data
		bytes.set(new Uint8Array(data), offset);
		offset += data.byteLength;
	}

	return new Blob([buffer], { type: 'image/x-icon' });
}

const MANIFEST = JSON.stringify(
	{
		icons: [
			{ src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
			{ src: '/favicon-256.png', sizes: '256x256', type: 'image/png' }
		]
	},
	null,
	2
);

const HTML_SNIPPET = `<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

export interface FaviconBundle {
	zip: Blob;
	previews: { size: number; url: string }[];
}

/**
 * Generate the full favicon bundle. `background` fills transparent areas
 * (useful for ICO/apple-touch which don't render alpha well); pass null to keep
 * transparency.
 */
export async function generateFavicons(
	img: HTMLImageElement | ImageBitmap,
	background: string | null
): Promise<FaviconBundle> {
	const zip = new JSZip();
	const previews: { size: number; url: string }[] = [];
	const icoSources: { size: number; data: ArrayBuffer }[] = [];

	for (const size of FAVICON_SIZES) {
		const canvas = renderSize(img, size, background);
		const blob = await canvasToBlob(canvas, 'image/png');
		const data = await blob.arrayBuffer();
		zip.file(`favicon-${size}.png`, data);
		previews.push({ size, url: URL.createObjectURL(blob) });
		// ICO entries are limited to <=256; include the standard set.
		if ([16, 32, 48, 256].includes(size)) icoSources.push({ size, data });
	}

	// 192 PNG for the web manifest.
	const blob192 = await canvasToBlob(renderSize(img, 192, background), 'image/png');
	zip.file('favicon-192.png', await blob192.arrayBuffer());

	// Apple touch icon (always opaque — Safari ignores transparency).
	const appleBlob = await canvasToBlob(renderSize(img, APPLE_TOUCH_SIZE, background ?? '#ffffff'), 'image/png');
	zip.file('apple-touch-icon.png', await appleBlob.arrayBuffer());

	// Multi-size ICO.
	const ico = buildIco(icoSources);
	zip.file('favicon.ico', await ico.arrayBuffer());

	zip.file('site.webmanifest', MANIFEST);
	zip.file('README.txt', `Drop these files in your site root and add to <head>:\n\n${HTML_SNIPPET}\n`);

	const zipBlob = await zip.generateAsync({ type: 'blob' });
	return { zip: zipBlob, previews };
}
