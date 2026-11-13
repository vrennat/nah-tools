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

// D1 stub holding a blocked_domains table; records the bound parameters it saw.
function makeBlocklistDb(blocked: string[]) {
	const seen: unknown[][] = [];
	const db = {
		prepare: (sql: string) => {
			let params: unknown[] = [];
			const stmt = {
				bind: (...p: unknown[]) => {
					params = p;
					seen.push(p);
					return stmt;
				},
				first: async () =>
					/blocked_domains/.test(sql) && params.some((p) => blocked.includes(String(p)))
						? { 1: 1 }
						: null
			};
			return stmt;
		}
	} as unknown as D1Database;
	return { db, seen };
}

describe('validateUrlSafety - blocklist table', () => {
	it('blocks a listed domain', async () => {
		const { db } = makeBlocklistDb(['evil.example']);
		const r = await validateUrlSafety('https://evil.example/x', db);
		expect(r.safe).toBe(false);
		expect(r.reason).toMatch(/blocked/);
	});

	it('blocks subdomains of a listed domain', async () => {
		const { db } = makeBlocklistDb(['evil.example']);
		expect((await validateUrlSafety('https://a.b.evil.example/x', db)).safe).toBe(false);
	});

	it('does not block unrelated domains', async () => {
		const { db } = makeBlocklistDb(['evil.example']);
		expect((await validateUrlSafety('https://notevil.example/', db)).safe).toBe(true);
	});

	it('keeps the lookup under the D1 bound-parameter limit', async () => {
		const { db, seen } = makeBlocklistDb([]);
		await validateUrlSafety(`https://${'a.'.repeat(18)}example.com/`, db);
		expect(Math.max(...seen.map((p) => p.length))).toBeLessThan(100);
	});

	it('lets bio links point at nah.tools but not redirects', async () => {
		const { db } = makeBlocklistDb([]);
		expect((await validateUrlSafety('https://nah.tools/qr', db)).safe).toBe(false);
		expect((await validateUrlSafety('https://nah.tools/qr', db, { forRedirect: false })).safe).toBe(true);
	});
});
