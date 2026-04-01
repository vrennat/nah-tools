/**
 * Coordinate transforms between screen space (CSS pixels, top-left origin)
 * and PDF space (points, bottom-left origin) with rotation handling.
 */

import type { PageTransform } from './types';

/** Convert screen coordinates (relative to canvas element) to PDF coordinates */
export function screenToPdf(
	screenX: number,
	screenY: number,
	transform: PageTransform
): { x: number; y: number } {
	const { scale, rotation, pdfWidth, pdfHeight } = transform;

	let x = screenX / scale;
	let y = screenY / scale;

	switch (rotation) {
		case 0:
			y = pdfHeight - y;
			break;
		case 90:
			[x, y] = [y, x];
			break;
		case 180:
			x = pdfWidth - x;
			break;
		case 270:
			[x, y] = [pdfWidth - y, pdfHeight - x];
			break;
	}

	return { x, y };
}

/** Convert PDF coordinates to screen position (for placing overlay elements) */
export function pdfToScreen(
	pdfX: number,
	pdfY: number,
	transform: PageTransform
): { x: number; y: number } {
	const { scale, rotation, pdfWidth, pdfHeight } = transform;
	let x: number;
	let y: number;

	switch (rotation) {
		case 0:
			x = pdfX;
			y = pdfHeight - pdfY;
			break;
		case 90:
			x = pdfY;
			y = pdfX;
			break;
		case 180:
			x = pdfWidth - pdfX;
			y = pdfY;
			break;
		case 270:
			x = pdfWidth - pdfY;
			y = pdfHeight - pdfX;
			break;
		default:
			x = pdfX;
			y = pdfHeight - pdfY;
	}

	return { x: x * scale, y: y * scale };
}

/** Build a PageTransform from page metadata and current zoom level */
export function buildTransform(
	pdfWidth: number,
	pdfHeight: number,
	rotation: number,
	zoom: number
): PageTransform {
	const scale = zoom;

	// Effective dimensions after rotation
	const isRotated = rotation === 90 || rotation === 270;
	const effectiveWidth = isRotated ? pdfHeight : pdfWidth;
	const effectiveHeight = isRotated ? pdfWidth : pdfHeight;

	return {
		scale,
		rotation,
		pdfWidth,
		pdfHeight,
		canvasWidth: effectiveWidth * scale,
		canvasHeight: effectiveHeight * scale
	};
}
