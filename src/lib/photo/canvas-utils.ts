/**
 * Apply a grayscale mask to an image, producing a transparent result.
 * The mask's red channel luminance becomes the alpha channel.
 */
export function applyMask(
	original: ImageBitmap,
	mask: ImageBitmap
): HTMLCanvasElement {
	const w = original.width;
	const h = original.height;

	// Draw mask at original image size and read its pixel data
	const maskCanvas = document.createElement('canvas');
	maskCanvas.width = w;
	maskCanvas.height = h;
	const maskCtx = maskCanvas.getContext('2d')!;
	maskCtx.drawImage(mask, 0, 0, w, h);
	const maskData = maskCtx.getImageData(0, 0, w, h);

	// Draw original image and read its pixel data
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(original, 0, 0);
	const imgData = ctx.getImageData(0, 0, w, h);

	// Copy mask's red channel into image's alpha channel
	for (let i = 0; i < imgData.data.length; i += 4) {
		imgData.data[i + 3] = maskData.data[i]; // R channel of mask -> alpha
	}

	ctx.putImageData(imgData, 0, 0);
	return canvas;
}

/**
 * Composite a masked (transparent) canvas onto a solid background color.
 */
export function compositeOnBackground(
	maskedCanvas: HTMLCanvasElement,
	bgColor: string
): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = maskedCanvas.width;
	canvas.height = maskedCanvas.height;
	const ctx = canvas.getContext('2d')!;

	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(maskedCanvas, 0, 0);

	return canvas;
}

/**
 * Export a canvas to a PNG Blob.
 */
export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error('Canvas toBlob returned null'));
			},
			type
		);
	});
}

/**
 * Create a checkerboard pattern canvas for transparent background preview.
 */
export function createCheckerboard(width: number, height: number, cellSize = 10): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = '#e0e0e0';

	for (let y = 0; y < height; y += cellSize) {
		for (let x = 0; x < width; x += cellSize) {
			if ((Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0) {
				ctx.fillRect(x, y, cellSize, cellSize);
			}
		}
	}

	return canvas;
}
