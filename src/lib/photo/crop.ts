// Social-media crop presets. Each preset has fixed output dimensions; the
// source image is scaled to cover and center-cropped to fit exactly.

export interface CropPreset {
	id: string;
	label: string;
	platform: string;
	width: number;
	height: number;
}

export const CROP_PRESETS: CropPreset[] = [
	{ id: 'instagram-square', label: 'Square Post', platform: 'Instagram', width: 1080, height: 1080 },
	{ id: 'instagram-portrait', label: 'Portrait Post', platform: 'Instagram', width: 1080, height: 1350 },
	{ id: 'instagram-story', label: 'Story / Reel', platform: 'Instagram', width: 1080, height: 1920 },
	{ id: 'twitter-post', label: 'Post Image', platform: 'Twitter / X', width: 1600, height: 900 },
	{ id: 'twitter-header', label: 'Header', platform: 'Twitter / X', width: 1500, height: 500 },
	{ id: 'linkedin-post', label: 'Shared Image', platform: 'LinkedIn', width: 1200, height: 627 },
	{ id: 'linkedin-cover', label: 'Cover Photo', platform: 'LinkedIn', width: 1584, height: 396 },
	{ id: 'facebook-post', label: 'Post Image', platform: 'Facebook', width: 1200, height: 630 },
	{ id: 'youtube-thumbnail', label: 'Thumbnail', platform: 'YouTube', width: 1280, height: 720 },
	{ id: 'youtube-channel', label: 'Channel Art', platform: 'YouTube', width: 2560, height: 1440 }
];

export function getCropPreset(id: string): CropPreset | undefined {
	return CROP_PRESETS.find((p) => p.id === id);
}

/**
 * Scale-to-cover and center-crop an image to exact preset dimensions.
 * focusX/focusY (0-1) shift the crop window; 0.5 = centered.
 */
export function cropToPreset(
	img: HTMLImageElement | ImageBitmap,
	preset: CropPreset,
	focusX = 0.5,
	focusY = 0.5
): HTMLCanvasElement {
	const sw = img.width;
	const sh = img.height;
	const targetRatio = preset.width / preset.height;
	const sourceRatio = sw / sh;

	let cropW: number, cropH: number;
	if (sourceRatio > targetRatio) {
		// Source wider than target: crop sides.
		cropH = sh;
		cropW = sh * targetRatio;
	} else {
		// Source taller than target: crop top/bottom.
		cropW = sw;
		cropH = sw / targetRatio;
	}

	const maxX = sw - cropW;
	const maxY = sh - cropH;
	const sx = Math.max(0, Math.min(maxX, maxX * focusX));
	const sy = Math.max(0, Math.min(maxY, maxY * focusY));

	const canvas = document.createElement('canvas');
	canvas.width = preset.width;
	canvas.height = preset.height;
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, preset.width, preset.height);
	return canvas;
}
