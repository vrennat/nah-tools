/**
 * Rate limits for creating redirects (short links and dynamic QR codes) and
 * for changing their destinations.
 *
 * Two layers, each applied per client network and, when one is given, per passphrase:
 * - Burst: the Workers rate limiting binding CREATE_LIMITER (configured in
 *   wrangler.jsonc). It counts requests per Cloudflare location and keeps no
 *   data we can read back.
 * - Daily: a KV counter of links created or changed per UTC day, weighted by
 *   batch size.
 *
 * Neither IPs nor passphrases are stored. Keys are SHA-256 hashes salted with a
 * random value that is regenerated every UTC day and expires from KV after two
 * days, so a stored key cannot be linked to an IP once that salt is gone.
 */

import { error } from '@sveltejs/kit';
import { getKV } from '$server/db';

/** Links one network or one passphrase may create or change per UTC day. Bulk requests count each link. */
export const DAILY_CREATE_CAP = 100;

const DAY_TTL_SECONDS = 2 * 24 * 60 * 60;

/** Used only for the burst limiter when KV cannot supply the daily salt. Lives for one isolate. */
const FALLBACK_SALT = crypto.randomUUID();

export interface CreationLimitEnv {
	KV: KVNamespace;
	CREATE_LIMITER?: RateLimit;
}

export interface CreationRequest {
	/** CF-Connecting-IP, or null when absent (local dev). */
	ip: string | null;
	/** Raw passphrase, when the creator set one. */
	passphrase?: string;
	/** Number of links this request creates or changes. */
	cost: number;
	/** Injected for tests; defaults to now. */
	now?: Date;
}

export type LimitResult = { ok: true } | { ok: false; reason: string };

function utcDay(now: Date): string {
	return now.toISOString().slice(0, 10);
}

function toHex(buf: ArrayBuffer): string {
	return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * The part of a client address that identifies one network. IPv6 clients
 * usually control a whole /64, so per-address limits would be trivial to
 * rotate around; IPv4 addresses are used as-is.
 */
export function networkKey(ip: string): string {
	if (!ip.includes(':')) return ip;
	const [head, tail = ''] = ip.toLowerCase().split('::');
	const headGroups = head ? head.split(':') : [];
	const tailGroups = tail ? tail.split(':') : [];
	const missing = 8 - headGroups.length - tailGroups.length;
	const groups = [...headGroups, ...Array(Math.max(missing, 0)).fill('0'), ...tailGroups];
	return groups
		.slice(0, 4)
		.map((g) => g.padStart(4, '0'))
		.join(':') + '::/64';
}

/** Today's salt, created on first use. A rare race between isolates can mint two; that only loosens a limit briefly. */
export async function dailySalt(kv: KVNamespace, now: Date = new Date()): Promise<string> {
	const key = `salt:create:${utcDay(now)}`;
	const existing = await kv.get(key);
	if (existing) return existing;
	const salt = toHex(crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer);
	await kv.put(key, salt, { expirationTtl: DAY_TTL_SECONDS });
	return salt;
}

export async function hashIdentity(salt: string, kind: string, value: string): Promise<string> {
	const data = new TextEncoder().encode(`${salt}:${kind}:${value}`);
	return toHex(await crypto.subtle.digest('SHA-256', data)).slice(0, 32);
}

/**
 * Check and, if allowed, record a creation or destination change. Returns
 * ok:false with a message suitable for a 429 when any limit is exceeded.
 *
 * KV failures (for example the daily write quota) skip only the daily cap, so
 * an outage of the counter store does not take link creation down; the burst
 * limiter and destination rules still apply.
 */
export async function checkCreationLimits(
	env: CreationLimitEnv,
	req: CreationRequest
): Promise<LimitResult> {
	const now = req.now ?? new Date();
	const identities: Array<[string, string]> = [];
	if (req.ip) identities.push(['ip', networkKey(req.ip)]);
	if (req.passphrase) identities.push(['pp', req.passphrase]);
	if (identities.length === 0) return { ok: true };

	let salt: string;
	let kvAvailable = true;
	try {
		salt = await dailySalt(env.KV, now);
	} catch (e) {
		console.error('creation limits: daily salt unavailable, applying burst limit only', e);
		salt = FALLBACK_SALT;
		kvAvailable = false;
	}
	const hashed = await Promise.all(
		identities.map(async ([kind, value]) => [kind, await hashIdentity(salt, kind, value)] as const)
	);

	if (env.CREATE_LIMITER) {
		for (const [kind, h] of hashed) {
			const { success } = await env.CREATE_LIMITER.limit({ key: `create:${kind}:${h}` });
			if (!success) {
				return { ok: false, reason: 'Too many links created too quickly. Wait a minute and try again.' };
			}
		}
	}

	if (!kvAvailable) return { ok: true };

	const day = utcDay(now);
	try {
		const keys = hashed.map(([kind, h]) => `rl:create:${day}:${kind}:${h}`);
		const counts = await Promise.all(keys.map(async (k) => Number((await env.KV.get(k)) ?? 0)));
		if (counts.some((c) => c + req.cost > DAILY_CREATE_CAP)) {
			return {
				ok: false,
				reason: `Daily limit of ${DAILY_CREATE_CAP} links reached. Try again tomorrow.`
			};
		}
		await Promise.all(
			keys.map((k, i) =>
				env.KV.put(k, String(counts[i] + req.cost), { expirationTtl: DAY_TTL_SECONDS })
			)
		);
	} catch (e) {
		console.error('creation limits: daily counter unavailable, allowing request', e);
	}

	return { ok: true };
}

/** Route helper: apply the creation limits for this request or throw a 429. */
export async function enforceCreationLimits(
	platform: App.Platform | undefined,
	request: Request,
	passphrase: unknown,
	cost = 1
): Promise<void> {
	const result = await checkCreationLimits(
		{ KV: getKV(platform), CREATE_LIMITER: platform?.env?.CREATE_LIMITER },
		{
			ip: request.headers.get('cf-connecting-ip'),
			passphrase: typeof passphrase === 'string' && passphrase ? passphrase : undefined,
			cost
		}
	);
	if (!result.ok) throw error(429, result.reason);
}

/**
 * A stable, non-reversible key for a link reporter, so one network can file
 * only one open report per link. The salt is random, kept only in KV, and never
 * rotates (rotating it would let one client re-report the same link every day).
 * Returns undefined when there is no IP or KV is unavailable; the report is
 * still recorded.
 */
export async function reporterKey(kv: KVNamespace, ip: string | null): Promise<string | undefined> {
	if (!ip) return undefined;
	try {
		let salt = await kv.get('salt:report');
		if (!salt) {
			salt = toHex(crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer);
			await kv.put('salt:report', salt);
		}
		return await hashIdentity(salt, 'report', networkKey(ip));
	} catch (e) {
		console.error('report: reporter key unavailable, recording report without it', e);
		return undefined;
	}
}
