/**
 * QR Code Generator
 * Wraps qr-code-styling for client-side QR generation
 * Must be dynamically imported (no SSR — uses canvas/DOM)
 */

import type { QRStyleOptions } from './types';

let QRCodeStyling: typeof import('qr-code-styling').default;

/** Lazily load qr-code-styling (client-side only) */
async function getQRCodeStyling() {
	if (!QRCodeStyling) {
		const mod = await import('qr-code-styling');
		QRCodeStyling = mod.default;
	}
	return QRCodeStyling;
}

export async function createQRCode(data: string, options: QRStyleOptions, size = 1024) {
	const QRC = await getQRCodeStyling();

	const qrOptions: ConstructorParameters<typeof QRC>[0] = {
		width: size,
		height: size,
		data,
		dotsOptions: {
			color: options.gradient ? undefined : options.foreground,
			type: options.dotStyle,
			...(options.gradient
				? {
						gradient: {
							type: options.gradient.type,
							rotation: ((options.gradient.rotation ?? 0) * Math.PI) / 180,
							colorStops: [
								{ offset: 0, color: options.gradient.colorStops[0] },
								{ offset: 1, color: options.gradient.colorStops[1] }
							]
						}
					}
				: {})
		},
		cornersSquareOptions: {
			color: options.foreground,
			type: options.cornerSquareStyle
		},
		cornersDotOptions: {
			color: options.foreground,
			type: options.cornerDotStyle
		},
		backgroundOptions: {
			color: options.background
		},
		qrOptions: {
			errorCorrectionLevel: options.errorCorrection
		}
	};

	// Add logo if present
	if (options.logo) {
		qrOptions.image = options.logo;
		qrOptions.imageOptions = {
			crossOrigin: 'anonymous',
			margin: 2,
			imageSize: options.logoSize ?? 0.4
		};
	}

	return new QRC(qrOptions);
}

/** Export QR code as PNG blob (client-side only, always returns Blob) */
export async function exportPNG(qr: InstanceType<typeof import('qr-code-styling').default>): Promise<Blob> {
	const data = await qr.getRawData('png');
	if (!data) throw new Error('Failed to generate PNG');
	return data as Blob;
}

/** Export QR code as SVG blob (client-side only, always returns Blob) */
export async function exportSVG(qr: InstanceType<typeof import('qr-code-styling').default>): Promise<Blob> {
	const data = await qr.getRawData('svg');
	if (!data) throw new Error('Failed to generate SVG');
	return data as Blob;
}
