import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '$utils/debounce';

describe('debounce', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('does not call function immediately', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);
		debounced();
		expect(fn).not.toHaveBeenCalled();
	});

	it('calls function after delay expires', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);
		debounced();
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledOnce();
	});

	it('resets timer on repeated calls', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);
		debounced();
		vi.advanceTimersByTime(50);
		debounced();
		vi.advanceTimersByTime(50);
		expect(fn).not.toHaveBeenCalled();
		vi.advanceTimersByTime(50);
		expect(fn).toHaveBeenCalledOnce();
	});

	it('passes arguments correctly', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);
		debounced('a', 'b');
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledWith('a', 'b');
	});

	it('cancel() prevents pending invocation', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);
		debounced();
		debounced.cancel();
		vi.advanceTimersByTime(100);
		expect(fn).not.toHaveBeenCalled();
	});

	it('multiple rapid calls result in single execution', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);
		debounced();
		debounced();
		debounced();
		debounced();
		debounced();
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledOnce();
	});
});
