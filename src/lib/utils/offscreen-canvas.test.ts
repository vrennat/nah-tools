import { afterEach, describe, expect, it, vi } from 'vitest';
import { createOffscreenCanvas, OFFSCREEN_CANVAS_UNSUPPORTED } from './offscreen-canvas';

describe('createOffscreenCanvas', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('throws an update-your-browser error when OffscreenCanvas is missing', () => {
		vi.stubGlobal('OffscreenCanvas', undefined);
		expect(() => createOffscreenCanvas(1, 1)).toThrow(OFFSCREEN_CANVAS_UNSUPPORTED);
	});

	it('constructs the canvas when supported', () => {
		class FakeCanvas {
			constructor(
				public width: number,
				public height: number
			) {}
		}
		vi.stubGlobal('OffscreenCanvas', FakeCanvas);
		const canvas = createOffscreenCanvas(4, 3);
		expect(canvas).toBeInstanceOf(FakeCanvas);
		expect([canvas.width, canvas.height]).toEqual([4, 3]);
	});
});
