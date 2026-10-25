/**
 * Failed-passphrase throttle, backed by Workers KV.
 *
 * Two fixed-window counters per attempt: one for the target (short code or bio
 * handle) and one for the client IP (CF-Connecting-IP). While either is at its
 * cap the request gets 429 + Retry-After and bcrypt is never run. A correct
 * passphrase clears the target counter (not the IP counter).
 *
 * KV is eventually consistent (writes can take ~60s to reach other locations)
 * and allows 1 write/sec per key, so concurrent or geographically spread
 * attempts can undercount. That is accepted: this is a coarse brake on online
 * guessing, not an exact quota. A failed counter write is logged and ignored.
 *
 * When platform.env.KV is absent (local dev), limiting is skipped.
 */

import { error, isHttpError, type RequestEvent } from '@sveltejs/kit';

const WINDOW_SECONDS = 15 * 60;
export const MAX_FAILURES_PER_TARGET = 10;
export const MAX_FAILURES_PER_IP = 30;
/** KV rejects expirations less than 60 seconds out. */
const MIN_KV_TTL = 60;

interface Counter {
	n: number;
	/** Epoch ms when this window ends */
	reset: number;
}

export type LimitEvent = Pick<RequestEvent, 'platform' | 'request' | 'locals'>;

async function read(kv: KVNamespace, key: string, now: number): Promise<Counter | null> {
	const c = await kv.get<Counter>(key, 'json');
	return c && c.reset > now ? c : null;
}

async function bump(kv: KVNamespace, key: string, prev: Counter | null, now: number) {
	const next: Counter = prev
		? { n: prev.n + 1, reset: prev.reset }
		: { n: 1, reset: now + WINDOW_SECONDS * 1000 };
	const ttl = Math.max(MIN_KV_TTL, Math.ceil((next.reset - now) / 1000));
	try {
		await kv.put(key, JSON.stringify(next), { expirationTtl: ttl });
	} catch (e) {
		console.error('passphrase-limit: failed to record failure', key, e);
	}
}

/**
 * Run `authenticate` (which must throw a 403 HttpError on a wrong passphrase)
 * behind the failure throttle. `target` is namespaced by the caller, e.g.
 * `redirect:abc123` or `bio:handle`.
 */
export async function withPassphraseLimit<T>(
	event: LimitEvent,
	target: string,
	authenticate: () => Promise<T>
): Promise<T> {
	const kv = event.platform?.env?.KV;
	if (!kv) return authenticate();

	const ip = event.request.headers.get('cf-connecting-ip') || 'unknown';
	const targetKey = `pplimit:t:${target}`;
	const ipKey = `pplimit:ip:${ip}`;
	const now = Date.now();

	const [t, i] = await Promise.all([read(kv, targetKey, now), read(kv, ipKey, now)]);
	const blocking = [
		t && t.n >= MAX_FAILURES_PER_TARGET ? t : null,
		i && i.n >= MAX_FAILURES_PER_IP ? i : null
	].filter((c): c is Counter => c !== null);
	if (blocking.length > 0) {
		const until = Math.max(...blocking.map((c) => c.reset));
		// Picked up by hooks.server.ts; error() cannot carry response headers.
		event.locals.retryAfter = Math.max(1, Math.ceil((until - now) / 1000));
		throw error(429, 'Too many failed passphrase attempts. Try again later.');
	}

	try {
		const result = await authenticate();
		if (t) {
			try {
				await kv.delete(targetKey);
			} catch (e) {
				console.error('passphrase-limit: failed to reset', targetKey, e);
			}
		}
		return result;
	} catch (e) {
		if (isHttpError(e, 403)) {
			await Promise.all([bump(kv, targetKey, t, now), bump(kv, ipKey, i, now)]);
		}
		throw e;
	}
}
