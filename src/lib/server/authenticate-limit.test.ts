import { describe, it, expect, vi } from 'vitest';
import { isHttpError } from '@sveltejs/kit';

vi.mock('$server/auth', () => ({
	verifyPassphrase: vi.fn(async (pass: string, hash: string) => pass === hash)
}));

import { authenticateRedirect } from '$server/db';
import { MAX_FAILURES_PER_TARGET } from '$server/passphrase-limit';

const row = { short_code: 'abc123', custom_alias: 'promo', passphrase_hash: 'secret' };

/** D1 stub whose lookup matches short_code OR custom_alias, like getRedirect's SQL. */
const db = {
	prepare: () => ({
		bind: (a: string) => ({
			first: async () => (a === row.short_code || a === row.custom_alias ? row : null)
		})
	})
} as unknown as D1Database;

function fakeKV() {
	const store = new Map<string, string>();
	return {
		store,
		get: async (k: string) => (store.has(k) ? JSON.parse(store.get(k)!) : null),
		put: async (k: string, v: string) => void store.set(k, v),
		delete: async (k: string) => void store.delete(k)
	};
}

const event = (kv: ReturnType<typeof fakeKV>, ip: string) => ({
	platform: { env: { KV: kv } } as unknown as App.Platform,
	request: new Request('http://x/', { headers: { 'cf-connecting-ip': ip } }),
	locals: {} as App.Locals
});

describe('authenticateRedirect throttling', () => {
	it('shares one counter between a short code and its alias', async () => {
		const kv = fakeKV();
		for (let i = 0; i < MAX_FAILURES_PER_TARGET; i++) {
			const name = i % 2 ? 'promo' : 'abc123';
			const e = await authenticateRedirect(db, name, 'wrong', event(kv, `10.0.0.${i}`)).catch((x) => x);
			expect(isHttpError(e, 403)).toBe(true);
		}
		for (const name of ['abc123', 'promo']) {
			const e = await authenticateRedirect(db, name, 'secret', event(kv, '9.9.9.9')).catch((x) => x);
			expect(isHttpError(e, 429)).toBe(true);
		}
		expect([...kv.store.keys()].filter((k) => k.startsWith('pplimit:t:'))).toEqual([
			'pplimit:t:redirect:abc123'
		]);
	});

	it('success via the alias resets the counter used by the code', async () => {
		const kv = fakeKV();
		await authenticateRedirect(db, 'abc123', 'wrong', event(kv, '1.1.1.1')).catch(() => {});
		await authenticateRedirect(db, 'promo', 'secret', event(kv, '1.1.1.1'));
		expect(kv.store.has('pplimit:t:redirect:abc123')).toBe(false);
	});

	it('unknown codes 404 without being counted', async () => {
		const kv = fakeKV();
		const e = await authenticateRedirect(db, 'nope', 'x', event(kv, '1.1.1.1')).catch((x) => x);
		expect(isHttpError(e, 404)).toBe(true);
		expect(kv.store.size).toBe(0);
	});
});
