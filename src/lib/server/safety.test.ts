import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateAlias, checkRateLimit } from '$server/safety';

describe('validateAlias', () => {
	it('accepts a valid alias like my-link', () => {
		expect(validateAlias('my-link')).toEqual({ valid: true });
	});

	it('accepts minimum length alias (3 chars)', () => {
		expect(validateAlias('abc')).toEqual({ valid: true });
	});

	it('rejects alias shorter than 3 characters', () => {
		const result = validateAlias('ab');
		expect(result.valid).toBe(false);
		expect(result.reason).toMatch(/at least 3/);
	});

	it('rejects alias longer than 32 characters', () => {
		const result = validateAlias('a'.repeat(33));
		expect(result.valid).toBe(false);
		expect(result.reason).toMatch(/32 characters/);
	});

	it('rejects underscores', () => {
		const result = validateAlias('my_link');
		expect(result.valid).toBe(false);
		expect(result.reason).toMatch(/letters, numbers, and hyphens/);
	});

	it('rejects spaces', () => {
		const result = validateAlias('my link');
		expect(result.valid).toBe(false);
		expect(result.reason).toMatch(/letters, numbers, and hyphens/);
	});

	it('rejects alias starting with hyphen', () => {
		const result = validateAlias('-start');
		expect(result.valid).toBe(false);
		expect(result.reason).toMatch(/cannot start or end with a hyphen/);
	});

	it('rejects alias ending with hyphen', () => {
		const result = validateAlias('end-');
		expect(result.valid).toBe(false);
		expect(result.reason).toMatch(/cannot start or end with a hyphen/);
	});

	it('rejects reserved alias "api"', () => {
		const result = validateAlias('api');
		expect(result.valid).toBe(false);
		expect(result.reason).toMatch(/reserved/);
	});

	it('rejects reserved alias case-insensitively', () => {
		const result = validateAlias('Admin');
		expect(result.valid).toBe(false);
		expect(result.reason).toMatch(/reserved/);
	});
});

describe('checkRateLimit', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns true for the first request', () => {
		expect(checkRateLimit('ip-first')).toBe(true);
	});

	it('returns true for the 10th request', () => {
		const ip = 'ip-ten';
		for (let i = 0; i < 9; i++) {
			checkRateLimit(ip);
		}
		expect(checkRateLimit(ip)).toBe(true);
	});

	it('returns false for the 11th request', () => {
		const ip = 'ip-eleven';
		for (let i = 0; i < 10; i++) {
			checkRateLimit(ip);
		}
		expect(checkRateLimit(ip)).toBe(false);
	});

	it('resets after the time window passes', () => {
		const ip = 'ip-reset';
		for (let i = 0; i < 10; i++) {
			checkRateLimit(ip);
		}
		expect(checkRateLimit(ip)).toBe(false);

		// Advance past the 1-hour window
		vi.advanceTimersByTime(60 * 60 * 1000 + 1);

		expect(checkRateLimit(ip)).toBe(true);
	});

	it('tracks different IPs separately', () => {
		const ipA = 'ip-separate-a';
		const ipB = 'ip-separate-b';

		for (let i = 0; i < 10; i++) {
			checkRateLimit(ipA);
		}
		expect(checkRateLimit(ipA)).toBe(false);
		expect(checkRateLimit(ipB)).toBe(true);
	});
});
