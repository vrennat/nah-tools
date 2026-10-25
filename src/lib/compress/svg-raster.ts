// createImageBitmap() rejects SVG blobs inside a Worker in Chromium, Firefox and
// WebKit (SVG decoding needs the DOM), so SVGs are rasterized here on the main
// thread and handed to the worker as ImageData.

// Browsers rasterize an SVG with only a viewBox at the CSS default replaced size.
const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 150;

export function isSvg(mimeType: string): boolean {
	return mimeType.includes('svg');
}

export async function rasterizeSvg(buffer: ArrayBuffer): Promise<ImageData> {
	const url = URL.createObjectURL(new Blob([buffer], { type: 'image/svg+xml' }));
	try {
		const img = new Image();
		img.src = url;
		await img.decode();
		const width = img.naturalWidth || DEFAULT_WIDTH;
		const height = img.naturalHeight || DEFAULT_HEIGHT;
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not create a canvas to rasterize the SVG');
		ctx.drawImage(img, 0, 0, width, height);
		return ctx.getImageData(0, 0, width, height);
	} finally {
		URL.revokeObjectURL(url);
	}
}
