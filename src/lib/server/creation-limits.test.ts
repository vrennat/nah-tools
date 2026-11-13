import { describe, it, expect } from 'vitest';
import {
	checkCreationLimits,
	networkKey,
	reporterKey,
	DAILY_CREATE_CAP,
	type CreationLimitEnv
} from '$server/creation-limits';

function fakeKV(opts: { failWrites?: boolean; failAll?: boolean; failCounterWrites?: boolean } = {}) {
	const store = new Map<string, string>();
	const kv = {
		get: async (k: string) => {
			if (opts.failAll) throw new Error('KV unavailable');
			return store.get(k) ?? null;
		},
		put: async (k: string, v: string) => {
			if (opts.failWrites || opts.failAll) throw new Error('KV put() limit exceeded for the day.');
			if (opts.failCounterWrites && k.startsWith('rl:')) throw new Error('KV put() limit exceeded for the day.');
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

	it('allows the request when only the daily counter cannot be written', async () => {
		const { kv } = fakeKV({ failCounterWrites: true });
		const r = await checkCreationLimits({ KV: kv }, { ip: '203.0.113.7', cost: 1, now: DAY1 });
		expect(r.ok).toBe(true);
	});

	it('still applies the burst limit when KV is down entirely', async () => {
		const { kv } = fakeKV({ failAll: true });
		const env: CreationLimitEnv = { KV: kv, CREATE_LIMITER: fakeLimiter(5) };
		for (let i = 0; i < 5; i++) {
			expect((await checkCreationLimits(env, { ip: '203.0.113.7', cost: 1, now: DAY1 })).ok).toBe(true);
		}
		expect((await checkCreationLimits(env, { ip: '203.0.113.7', cost: 1, now: DAY1 })).ok).toBe(false);
	});

	it('treats every address in one IPv6 /64 as the same client', async () => {
		const { kv } = fakeKV();
		const env: CreationLimitEnv = { KV: kv, CREATE_LIMITER: fakeLimiter(5) };
		for (let i = 1; i <= 5; i++) {
			const r = await checkCreationLimits(env, { ip: `2001:db8:1:2::${i.toString(16)}`, cost: 1, now: DAY1 });
			expect(r.ok).toBe(true);
		}
		const rotated = await checkCreationLimits(env, { ip: '2001:db8:1:2:aaaa:bbbb:cccc:dddd', cost: 1, now: DAY1 });
		expect(rotated.ok).toBe(false);
		expect((await checkCreationLimits(env, { ip: '2001:db8:1:3::1', cost: 1, now: DAY1 })).ok).toBe(true);
	});

	it('skips limits when there is no IP and no passphrase', async () => {
		const { kv, store } = fakeKV();
		expect((await checkCreationLimits({ KV: kv }, { ip: null, cost: 1, now: DAY1 })).ok).toBe(true);
		expect(store.size).toBe(0);
	});
});

describe('networkKey', () => {
	it('keeps IPv4 addresses whole', () => {
		expect(networkKey('203.0.113.7')).toBe('203.0.113.7');
	});
	it('reduces IPv6 to its /64 regardless of notation', () => {
		expect(networkKey('2001:db8:0:1::5')).toBe(networkKey('2001:0DB8:0000:0001:ffff:0:0:9'));
		expect(networkKey('2001:db8::1')).toBe('2001:0db8:0000:0000::/64');
		expect(networkKey('::1')).toBe('0000:0000:0000:0000::/64');
	});
});

describe('reporterKey', () => {
	it('is stable across days for one network and never contains the IP', async () => {
		const { kv, store } = fakeKV();
		const a = await reporterKey(kv, '203.0.113.7');
		const b = await reporterKey(kv, '203.0.113.7');
		expect(a).toBeDefined();
		expect(a).toBe(b);
		expect(a).not.toContain('203.0.113');
		expect([...store.values()].join()).not.toContain('203.0.113.7');
		expect(await reporterKey(kv, '198.51.100.1')).not.toBe(a);
	});
	it('returns undefined instead of throwing when KV fails', async () => {
		const { kv } = fakeKV({ failAll: true });
		expect(await reporterKey(kv, '203.0.113.7')).toBeUndefined();
	});
});
