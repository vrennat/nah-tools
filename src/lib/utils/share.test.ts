import { describe, it, expect, vi } from 'vitest';
import { canShare } from '$utils/share';

describe('canShare', () => {
	it('returns false when navigator is undefined', () => {
		const original = globalThis.navigator;
		Object.defineProperty(globalThis, 'navigator', {
			value: undefined,
			writable: true,
			configurable: true
		});
		expect(canShare()).toBe(false);
		Object.defineProperty(globalThis, 'navigator', {
			value: original,
			writable: true,
			configurable: true
		});
	});

	it('returns false when navigator.share is missing', () => {
		const original = globalThis.navigator;
		Object.defineProperty(globalThis, 'navigator', {
			value: { canShare: vi.fn() },
			writable: true,
			configurable: true
		});
		expect(canShare()).toBe(false);
		Object.defineProperty(globalThis, 'navigator', {
			value: original,
			writable: true,
			configurable: true
		});
	});

	it('returns true when both share and canShare exist', () => {
		const original = globalThis.navigator;
		Object.defineProperty(globalThis, 'navigator', {
			value: { share: vi.fn(), canShare: vi.fn() },
			writable: true,
			configurable: true
		});
		expect(canShare()).toBe(true);
		Object.defineProperty(globalThis, 'navigator', {
			value: original,
			writable: true,
			configurable: true
		});
	});
});
