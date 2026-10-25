import { describe, it, expect, vi, beforeEach } from 'vitest';
import { error, isHttpError } from '@sveltejs/kit';
import {
	withPassphraseLimit,
	MAX_FAILURES_PER_TARGET,
	MAX_FAILURES_PER_IP
} from '$server/passphrase-limit';

/** Minimal in-memory KV honoring expirationTtl. */
function fakeKV() {
	const store = new Map<string, { v: string; exp: number }>();
	const kv = {
		store,
		get: vi.fn(async (k: string, type?: string) => {
			const e = store.get(k);
			if (!e || e.exp <= Date.now()) return null;
			return type === 'json' ? JSON.parse(e.v) : e.v;
		}),
		put: vi.fn(async (k: string, v: string, o?: { expirationTtl?: number }) => {
			if (o?.expirationTtl !== undefined && o.expirationTtl < 60) throw new Error('ttl < 60');
			store.set(k, { v, exp: Date.now() + (o?.expirationTtl ?? 1e9) * 1000 });
		}),
		delete: vi.fn(async (k: string) => void store.delete(k))
	};
	return kv;
}

function event(kv: ReturnType<typeof fakeKV> | undefined, ip = '1.1.1.1') {
	return {
		platform: { env: { KV: kv } } as unknown as App.Platform,
		request: new Request('http://x/', { headers: { 'cf-connecting-ip': ip } }),
		locals: {} as App.Locals
	};
}

const wrong = () => Promise.reject(error(403, 'Invalid passphrase'));
const right = () => Promise.resolve('ok');
const notFound = () => Promise.reject(error(404, 'not found'));

async function fail(ev: ReturnType<typeof event>, target: string) {
	return withPassphraseLimit(ev, target, wrong).catch((e) => e);
}

let kv: ReturnType<typeof fakeKV>;
beforeEach(() => {
	kv = fakeKV();
	vi.useRealTimers();
});

describe('withPassphraseLimit', () => {
	it('skips limiting when KV is absent', async () => {
		const ev = event(undefined);
		for (let i = 0; i < MAX_FAILURES_PER_TARGET + 5; i++) {
			expect(isHttpError(await fail(ev, 'redirect:a'), 403)).toBe(true);
		}
		expect(await withPassphraseLimit(ev, 'redirect:a', right)).toBe('ok');
	});

	it('locks a target after MAX_FAILURES_PER_TARGET failures without running authenticate', async () => {
		for (let i = 0; i < MAX_FAILURES_PER_TARGET; i++) {
			expect(isHttpError(await fail(event(kv, `10.0.0.${i}`), 'redirect:a'), 403)).toBe(true);
		}
		const auth = vi.fn(right);
		const ev = event(kv, '9.9.9.9');
		const e = await withPassphraseLimit(ev, 'redirect:a', auth).catch((x) => x);
		expect(isHttpError(e, 429)).toBe(true);
		expect(auth).not.toHaveBeenCalled();
		expect(ev.locals.retryAfter).toBeGreaterThan(0);
		expect(ev.locals.retryAfter).toBeLessThanOrEqual(15 * 60);
		// Other targets are unaffected
		expect(await withPassphraseLimit(event(kv, '9.9.9.9'), 'redirect:b', right)).toBe('ok');
	});

	it('locks an IP after MAX_FAILURES_PER_IP failures across targets', async () => {
		for (let i = 0; i < MAX_FAILURES_PER_IP; i++) {
			await fail(event(kv), `redirect:t${i}`);
		}
		const auth = vi.fn(right);
		const e = await withPassphraseLimit(event(kv), 'redirect:fresh', auth).catch((x) => x);
		expect(isHttpError(e, 429)).toBe(true);
		expect(auth).not.toHaveBeenCalled();
		// A different IP can still reach the same fresh target
		expect(await withPassphraseLimit(event(kv, '2.2.2.2'), 'redirect:fresh', right)).toBe('ok');
	});

	it('resets the target counter on success', async () => {
		for (let i = 0; i < MAX_FAILURES_PER_TARGET - 1; i++) await fail(event(kv), 'bio:x');
		expect(await withPassphraseLimit(event(kv), 'bio:x', right)).toBe('ok');
		expect(kv.store.has('pplimit:t:bio:x')).toBe(false);
		// Full budget again
		for (let i = 0; i < MAX_FAILURES_PER_TARGET - 1; i++) {
			expect(isHttpError(await fail(event(kv), 'bio:x'), 403)).toBe(true);
		}
	});

	it('does not count non-403 errors', async () => {
		for (let i = 0; i < MAX_FAILURES_PER_TARGET + 1; i++) {
			await withPassphraseLimit(event(kv), 'redirect:a', notFound).catch(() => {});
		}
		expect(kv.put).not.toHaveBeenCalled();
	});

	it('writes counters with a KV-legal TTL inside the 15 minute window', async () => {
		await fail(event(kv), 'redirect:a');
		for (const call of kv.put.mock.calls) {
			const ttl = call[2]!.expirationTtl!;
			expect(ttl).toBeGreaterThanOrEqual(60);
			expect(ttl).toBeLessThanOrEqual(15 * 60);
		}
	});

	it('unlocks after the window expires', async () => {
		vi.useFakeTimers();
		for (let i = 0; i < MAX_FAILURES_PER_TARGET; i++) await fail(event(kv, `10.0.0.${i}`), 'redirect:a');
		expect(isHttpError(await fail(event(kv, '3.3.3.3'), 'redirect:a'), 429)).toBe(true);
		vi.advanceTimersByTime(15 * 60 * 1000 + 1);
		expect(await withPassphraseLimit(event(kv, '3.3.3.3'), 'redirect:a', right)).toBe('ok');
	});

	it('still returns the auth error when the KV write fails', async () => {
		kv.put.mockRejectedValue(new Error('KV PUT failed: 429'));
		vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(isHttpError(await fail(event(kv), 'redirect:a'), 403)).toBe(true);
	});
});
