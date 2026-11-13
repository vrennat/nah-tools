// OffscreenCanvas shipped in Safari 16.4; older browsers throw a bare
// ReferenceError from inside the worker. Fail with a message users can act on.
export const OFFSCREEN_CANVAS_UNSUPPORTED =
	'Your browser does not support this tool (OffscreenCanvas is missing). Please update your browser to the latest version.';

export function createOffscreenCanvas(width: number, height: number): OffscreenCanvas {
	if (typeof OffscreenCanvas === 'undefined') throw new Error(OFFSCREEN_CANVAS_UNSUPPORTED);
	return new OffscreenCanvas(width, height);
}
