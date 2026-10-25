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

/** Minimal in-memory KV honoring expirationTtl and KV's 60s TTL floor. */
function fakeKV() {
	const store = new Map<string, { v: string; exp: number }>();
	return {
		store,
		get: vi.fn(async (k: string, type?: string) => {
			const e = store.get(k);
			if (!e || e.exp <= Date.now()) return null;
			return type === 'json' ? JSON.parse(e.v) : e.v;
		}),
		put: vi.fn(async (k: string, v: string, o?: { expirationTtl?: number }) => {
			if (o?.expirationTtl !== undefined && o.expirationTtl < 60) throw new Error('ttl < 60');
			store.set(k, { v, exp: Date.now() + (o?.expirationTtl ?? 1e9) * 1000 });
		})
	};
}

const withKV = (kv: unknown) => ({ env: { KV: kv } }) as unknown as App.Platform;

// Same quota semantics must hold for the in-memory fallback and the KV path.
describe.each([
	['in-memory (no KV)', () => undefined],
	['KV', () => withKV(fakeKV())]
])('checkRateLimit %s', (name, makePlatform) => {
	let platform: App.Platform | undefined;
	// Unique keys per backend: the in-memory map is module-level.
	const k = (s: string) => `${name}:${s}`;

	beforeEach(() => {
		vi.useFakeTimers();
		platform = makePlatform();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns true for the first request', async () => {
		expect(await checkRateLimit(platform, k('ip-first'))).toBe(true);
	});

	it('allows the 10th request and blocks the 11th', async () => {
		const ip = k('ip-eleven');
		for (let i = 0; i < 9; i++) await checkRateLimit(platform, ip);
		expect(await checkRateLimit(platform, ip)).toBe(true);
		expect(await checkRateLimit(platform, ip)).toBe(false);
	});

	it('resets after the time window passes', async () => {
		const ip = k('ip-reset');
		for (let i = 0; i < 10; i++) await checkRateLimit(platform, ip);
		expect(await checkRateLimit(platform, ip)).toBe(false);
		vi.advanceTimersByTime(60 * 60 * 1000 + 1);
		expect(await checkRateLimit(platform, ip)).toBe(true);
	});

	it('tracks different keys separately', async () => {
		const ipA = k('ip-separate-a');
		for (let i = 0; i < 10; i++) await checkRateLimit(platform, ipA);
		expect(await checkRateLimit(platform, ipA)).toBe(false);
		expect(await checkRateLimit(platform, k('ip-separate-b'))).toBe(true);
	});

	it('cost=10 consumes the full quota in one call', async () => {
		const ip = k('ip-cost-full');
		expect(await checkRateLimit(platform, ip, 10)).toBe(true);
		expect(await checkRateLimit(platform, ip, 1)).toBe(false);
	});

	it('cost=11 is rejected when quota is 10', async () => {
		expect(await checkRateLimit(platform, k('ip-cost-over'), 11)).toBe(false);
	});

	it('cost=5 allows two calls before blocking', async () => {
		const ip = k('ip-cost-five');
		expect(await checkRateLimit(platform, ip, 5)).toBe(true);
		expect(await checkRateLimit(platform, ip, 5)).toBe(true);
		expect(await checkRateLimit(platform, ip, 1)).toBe(false);
	});

	it('honors custom windowMs/max (MCP: 30/min)', async () => {
		const ip = k('mcp:ip');
		const opts = { windowMs: 60_000, max: 30 };
		for (let i = 0; i < 30; i++) expect(await checkRateLimit(platform, ip, 1, opts)).toBe(true);
		expect(await checkRateLimit(platform, ip, 1, opts)).toBe(false);
		vi.advanceTimersByTime(60_001);
		expect(await checkRateLimit(platform, ip, 1, opts)).toBe(true);
	});
});

describe('checkRateLimit KV specifics', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('shares state through KV, not isolate memory', async () => {
		const kv = fakeKV();
		for (let i = 0; i < 10; i++) await checkRateLimit(withKV(kv), 'shared');
		expect(kv.store.get('rl:shared')).toBeDefined();
		// A fresh platform object over the same namespace sees the spent quota.
		expect(await checkRateLimit(withKV(kv), 'shared')).toBe(false);
		// The in-memory fallback never saw this key.
		expect(await checkRateLimit(undefined, 'shared')).toBe(true);
	});

	it('does not write when blocked', async () => {
		const kv = fakeKV();
		await checkRateLimit(withKV(kv), 'nowrite', 10);
		kv.put.mockClear();
		expect(await checkRateLimit(withKV(kv), 'nowrite')).toBe(false);
		expect(kv.put).not.toHaveBeenCalled();
	});

	it('keeps the TTL at or above 60s even near the end of a short window', async () => {
		const kv = fakeKV();
		const opts = { windowMs: 60_000, max: 30 };
		await checkRateLimit(withKV(kv), 'ttl', 1, opts);
		vi.advanceTimersByTime(59_000);
		expect(await checkRateLimit(withKV(kv), 'ttl', 1, opts)).toBe(true);
		expect(kv.put).toHaveBeenCalledTimes(2);
		for (const call of kv.put.mock.calls) {
			expect(call[2]?.expirationTtl).toBeGreaterThanOrEqual(60);
		}
	});

	it('ignores a counter whose window ended even if KV has not expired it yet', async () => {
		const kv = fakeKV();
		const opts = { windowMs: 60_000, max: 1 };
		expect(await checkRateLimit(withKV(kv), 'stale', 1, opts)).toBe(true);
		expect(await checkRateLimit(withKV(kv), 'stale', 1, opts)).toBe(false);
		vi.advanceTimersByTime(60_001);
		expect(await checkRateLimit(withKV(kv), 'stale', 1, opts)).toBe(true);
	});

	it('falls back to in-memory limiting when KV get throws', async () => {
		const kv = fakeKV();
		kv.get.mockRejectedValue(new Error('kv down'));
		for (let i = 0; i < 10; i++) expect(await checkRateLimit(withKV(kv), 'getfail')).toBe(true);
		expect(await checkRateLimit(withKV(kv), 'getfail')).toBe(false);
		expect(console.error).toHaveBeenCalled();
	});

	it('falls back to in-memory limiting when KV put throws', async () => {
		const kv = fakeKV();
		kv.put.mockRejectedValue(new Error('429 too many writes'));
		for (let i = 0; i < 10; i++) expect(await checkRateLimit(withKV(kv), 'putfail')).toBe(true);
		expect(await checkRateLimit(withKV(kv), 'putfail')).toBe(false);
		expect(console.error).toHaveBeenCalled();
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
