import { describe, it, expect } from 'vitest';
import {
	checkCreationLimits,
	DAILY_CREATE_CAP,
	type CreationLimitEnv
} from '$server/creation-limits';

function fakeKV(opts: { failWrites?: boolean } = {}) {
	const store = new Map<string, string>();
	const kv = {
		get: async (k: string) => store.get(k) ?? null,
		put: async (k: string, v: string) => {
			if (opts.failWrites) throw new Error('KV put() limit exceeded for the day.');
			store.set(k, v);
		}
	} as unknown as KVNamespace;
	return { kv, store };
}

/** Fixed-window limiter matching the binding's contract: N calls per key. */
function fakeLimiter(limit: number): RateLimit {
	const counts = new Map<string, number>();
	return {
		limit: async ({ key }: { key: string }) => {
			const n = (counts.get(key) ?? 0) + 1;
			counts.set(key, n);
			return { success: n <= limit };
		}
	} as RateLimit;
}

const DAY1 = new Date('2026-11-13T12:00:00Z');
const DAY2 = new Date('2026-11-14T00:00:01Z');

describe('checkCreationLimits', () => {
	it('allows a normal creation', async () => {
		const { kv } = fakeKV();
		const env: CreationLimitEnv = { KV: kv, CREATE_LIMITER: fakeLimiter(5) };
		expect(await checkCreationLimits(env, { ip: '203.0.113.7', cost: 1, now: DAY1 })).toEqual({
			ok: true
		});
	});

	it('trips the burst limit for one IP but not for another', async () => {
		const { kv } = fakeKV();
		const env: CreationLimitEnv = { KV: kv, CREATE_LIMITER: fakeLimiter(5) };
		for (let i = 0; i < 5; i++) {
			expect((await checkCreationLimits(env, { ip: '203.0.113.7', cost: 1, now: DAY1 })).ok).toBe(true);
		}
		const sixth = await checkCreationLimits(env, { ip: '203.0.113.7', cost: 1, now: DAY1 });
		expect(sixth.ok).toBe(false);
		expect((await checkCreationLimits(env, { ip: '198.51.100.1', cost: 1, now: DAY1 })).ok).toBe(true);
	});

	it('limits one passphrase used from many IPs', async () => {
		const { kv } = fakeKV();
		const env: CreationLimitEnv = { KV: kv, CREATE_LIMITER: fakeLimiter(5) };
		for (let i = 0; i < 5; i++) {
			const r = await checkCreationLimits(env, { ip: `203.0.113.${i}`, passphrase: 'shared-secret', cost: 1, now: DAY1 });
			expect(r.ok).toBe(true);
		}
		const r = await checkCreationLimits(env, { ip: '203.0.113.99', passphrase: 'shared-secret', cost: 1, now: DAY1 });
		expect(r.ok).toBe(false);
	});

	it('enforces the daily cap, weighted by batch size, and resets the next day', async () => {
		const { kv } = fakeKV();
		const env: CreationLimitEnv = { KV: kv };
		expect((await checkCreationLimits(env, { ip: '203.0.113.7', cost: DAILY_CREATE_CAP - 1, now: DAY1 })).ok).toBe(true);
		expect((await checkCreationLimits(env, { ip: '203.0.113.7', cost: 1, now: DAY1 })).ok).toBe(true);
		const over = await checkCreationLimits(env, { ip: '203.0.113.7', cost: 1, now: DAY1 });
		expect(over.ok).toBe(false);
		if (!over.ok) expect(over.reason).toMatch(/Daily limit/);
		expect((await checkCreationLimits(env, { ip: '203.0.113.7', cost: 1, now: DAY2 })).ok).toBe(true);
	});

	it('rejects a single batch larger than the daily cap', async () => {
		const { kv } = fakeKV();
		const r = await checkCreationLimits({ KV: kv }, { ip: '203.0.113.7', cost: DAILY_CREATE_CAP + 1, now: DAY1 });
		expect(r.ok).toBe(false);
	});

	it('never stores the IP or passphrase', async () => {
		const { kv, store } = fakeKV();
		await checkCreationLimits({ KV: kv }, { ip: '203.0.113.7', passphrase: 'hunter2hunter2', cost: 1, now: DAY1 });
		const everything = [...store.keys(), ...store.values()].join('\n');
		expect(everything).not.toContain('203.0.113.7');
		expect(everything).not.toContain('hunter2hunter2');
		expect(store.size).toBeGreaterThan(0);
	});

	it('uses a different salt each day, so keys do not link across days', async () => {
		const { kv, store } = fakeKV();
		await checkCreationLimits({ KV: kv }, { ip: '203.0.113.7', cost: 1, now: DAY1 });
		await checkCreationLimits({ KV: kv }, { ip: '203.0.113.7', cost: 1, now: DAY2 });
		const hashes = [...store.keys()]
			.filter((k) => k.startsWith('rl:create:'))
			.map((k) => k.split(':').pop());
		expect(hashes).toHaveLength(2);
		expect(hashes[0]).not.toEqual(hashes[1]);
	});

	it('allows the request when the counter store is failing', async () => {
		const { kv } = fakeKV({ failWrites: true });
		const r = await checkCreationLimits({ KV: kv }, { ip: '203.0.113.7', cost: 1, now: DAY1 });
		expect(r.ok).toBe(true);
	});

	it('skips limits when there is no IP and no passphrase', async () => {
		const { kv, store } = fakeKV();
		expect((await checkCreationLimits({ KV: kv }, { ip: null, cost: 1, now: DAY1 })).ok).toBe(true);
		expect(store.size).toBe(0);
	});
});
