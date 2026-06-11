import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateAlias, checkRateLimit, validateUrlSafety } from '$server/safety';

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

	it('cost=10 consumes the full quota in one call', () => {
		const ip = 'ip-cost-full';
		expect(checkRateLimit(ip, 10)).toBe(true);
		expect(checkRateLimit(ip, 1)).toBe(false);
	});

	it('cost=11 is rejected when quota is 10', () => {
		const ip = 'ip-cost-over';
		expect(checkRateLimit(ip, 11)).toBe(false);
	});

	it('cost=5 allows two calls before blocking', () => {
		const ip = 'ip-cost-five';
		expect(checkRateLimit(ip, 5)).toBe(true);
		expect(checkRateLimit(ip, 5)).toBe(true);
		expect(checkRateLimit(ip, 1)).toBe(false);
	});
});

// Minimal D1 stub that always returns null from .first() (no blocked domains)
function makeStubDb(): D1Database {
	const stmt = {
		bind: () => stmt,
		first: async () => null,
		all: async () => ({ results: [] }),
		run: async () => ({ success: true }),
	};
	return { prepare: () => stmt } as unknown as D1Database;
}

describe('validateUrlSafety - SSRF gaps', () => {
	it('rejects http://localhost', async () => {
		const result = await validateUrlSafety('http://localhost/foo', makeStubDb());
		expect(result.safe).toBe(false);
		expect(result.reason).toMatch(/localhost/);
	});

	it('rejects http://localhost:8080', async () => {
		const result = await validateUrlSafety('http://localhost:8080', makeStubDb());
		expect(result.safe).toBe(false);
	});

	it('rejects http://sub.localhost', async () => {
		const result = await validateUrlSafety('http://sub.localhost', makeStubDb());
		expect(result.safe).toBe(false);
	});

	it('rejects bracketed IPv6 [::1]', async () => {
		const result = await validateUrlSafety('http://[::1]/', makeStubDb());
		expect(result.safe).toBe(false);
		expect(result.reason).toMatch(/IPv6/);
	});

	it('rejects bracketed IPv6 [fe80::1]', async () => {
		const result = await validateUrlSafety('http://[fe80::1]/', makeStubDb());
		expect(result.safe).toBe(false);
	});

	it('still allows normal https domains', async () => {
		const result = await validateUrlSafety('https://example.com', makeStubDb());
		expect(result.safe).toBe(true);
	});

	it('still rejects dotted-decimal IPv4', async () => {
		const result = await validateUrlSafety('http://192.168.1.1', makeStubDb());
		expect(result.safe).toBe(false);
	});
});
