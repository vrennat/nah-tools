/**
 * QR Code Export Utilities
 * Handles PNG, SVG, and PDF downloads + batch ZIP generation
 */

/** Trigger a file download in the browser */
export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/** Generate a timestamped filename */
export function makeFilename(prefix: string, ext: string): string {
	const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
	return `${prefix}-${ts}.${ext}`;
}

/** Export QR as PDF via jsPDF (lazy loaded) */
export async function exportPDF(svgBlob: Blob, sizeMM = 50): Promise<Blob> {
	const { jsPDF } = await import('jspdf');
	const doc = new jsPDF({
		unit: 'mm',
		format: [sizeMM + 20, sizeMM + 20] // QR + 10mm margins
	});

	const svgText = await svgBlob.text();
	const img = new Image();
	const canvas = document.createElement('canvas');
	const pxSize = sizeMM * 10; // ~300 DPI equivalent
	canvas.width = pxSize;
	canvas.height = pxSize;

	return new Promise((resolve, reject) => {
		img.onload = () => {
			const ctx = canvas.getContext('2d');
			if (!ctx) return reject(new Error('No canvas context'));
			ctx.drawImage(img, 0, 0, pxSize, pxSize);
			const dataUrl = canvas.toDataURL('image/png');
			doc.addImage(dataUrl, 'PNG', 10, 10, sizeMM, sizeMM);
			resolve(doc.output('blob'));
		};
		img.onerror = reject;
		img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
	});
}

/** Batch generate QR codes from CSV data and package as ZIP */
export async function exportBatchZIP(
	entries: { data: string; label?: string }[],
	generateFn: (data: string) => Promise<Blob>,
): Promise<Blob> {
	const JSZip = (await import('jszip')).default;
	const zip = new JSZip();

	const CONCURRENCY = 8;
	for (let i = 0; i < entries.length; i += CONCURRENCY) {
		const chunk = entries.slice(i, i + CONCURRENCY);
		const blobs = await Promise.all(chunk.map((entry) => generateFn(entry.data)));
		for (let j = 0; j < chunk.length; j++) {
			const entry = chunk[j];
			const idx = i + j;
			const name = entry.label
				? `${entry.label.replace(/[^a-zA-Z0-9-_]/g, '_')}.png`
				: `qr-${String(idx + 1).padStart(3, '0')}.png`;
			zip.file(name, blobs[j]);
		}
	}

	return zip.generateAsync({ type: 'blob' });
}
