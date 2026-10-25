import { isValidURL } from '$server/db';

// Known bad TLDs commonly used in phishing
const BAD_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq'];

// Known URL shorteners -- block redirect chains
const SHORTENER_DOMAINS = [
	'bit.ly',
	'tinyurl.com',
	't.co',
	'goo.gl',
	'ow.ly',
	'is.gd',
	'buff.ly',
	'rebrand.ly',
	'short.io',
	'cutt.ly',
	'rb.gy'
];

// Reserved aliases that cannot be custom-picked
const RESERVED_ALIASES = [
	'api',
	'admin',
	'manage',
	'links',
	'qr',
	'why',
	'compare',
	'privacy',
	'terms',
	'sitemap',
	'login',
	'signup',
	'dashboard',
	'settings',
	'account',
	'help',
	'support',
	'about',
	'blog',
	'status',
	'health',
	'www',
	'mail',
	'ftp',
	'cdn',
	'static',
	'bio',
	'pdf',
	'photo',
	'resume',
	'remove'
];

/** Validate URL safety beyond basic scheme checks */
export async function validateUrlSafety(
	url: string,
	db: D1Database
): Promise<{ safe: boolean; reason?: string }> {
	// 1. Basic scheme check
	if (!isValidURL(url)) {
		return { safe: false, reason: 'Invalid URL. Must be a valid http or https URL.' };
	}

	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return { safe: false, reason: 'Invalid URL format.' };
	}

	const hostname = parsed.hostname.toLowerCase();

	// 2. Block IP-only hostnames (dotted-decimal IPv4, bracketed IPv6, and localhost variants).
	// These are SSRF vectors — they can reach internal services not exposed to the public internet.
	if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
		return { safe: false, reason: 'IP addresses are not allowed as destinations.' };
	}
	if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
		return { safe: false, reason: 'localhost is not allowed as a destination.' };
	}
	// Bracketed IPv6 — e.g. [::1], [fe80::1]
	if (hostname.startsWith('[')) {
		return { safe: false, reason: 'IPv6 addresses are not allowed as destinations.' };
	}

	// 3. Block known bad TLDs
	for (const tld of BAD_TLDS) {
		if (hostname.endsWith(tld)) {
			return { safe: false, reason: `URLs with ${tld} domains are not allowed.` };
		}
	}

	// 4. Block shortener chains
	for (const shortener of SHORTENER_DOMAINS) {
		if (hostname === shortener || hostname.endsWith('.' + shortener)) {
			return {
				safe: false,
				reason: 'Redirect chains through other URL shorteners are not allowed.'
			};
		}
	}

	// 5. Check blocked domains table
	const blocked = await db
		.prepare('SELECT 1 FROM blocked_domains WHERE domain = ?')
		.bind(hostname)
		.first();
	if (blocked) {
		return { safe: false, reason: 'This domain has been blocked.' };
	}

	return { safe: true };
}

/** Validate a custom alias */
export function validateAlias(alias: string): { valid: boolean; reason?: string } {
	if (alias.length < 3) {
		return { valid: false, reason: 'Alias must be at least 3 characters.' };
	}
	if (alias.length > 32) {
		return { valid: false, reason: 'Alias must be 32 characters or fewer.' };
	}
	if (!/^[a-zA-Z0-9-]+$/.test(alias)) {
		return { valid: false, reason: 'Alias can only contain letters, numbers, and hyphens.' };
	}
	if (alias.startsWith('-') || alias.endsWith('-')) {
		return { valid: false, reason: 'Alias cannot start or end with a hyphen.' };
	}
	if (RESERVED_ALIASES.includes(alias.toLowerCase())) {
		return { valid: false, reason: 'This alias is reserved.' };
	}
	return { valid: true };
}

/** Validate a bio handle (same rules as alias) */
export function validateHandle(handle: string): { valid: boolean; reason?: string } {
	if (handle.length < 3) {
		return { valid: false, reason: 'Handle must be at least 3 characters.' };
	}
	if (handle.length > 32) {
		return { valid: false, reason: 'Handle must be 32 characters or fewer.' };
	}
	if (!/^[a-zA-Z0-9-]+$/.test(handle)) {
		return { valid: false, reason: 'Handle can only contain letters, numbers, and hyphens.' };
	}
	if (handle.startsWith('-') || handle.endsWith('-')) {
		return { valid: false, reason: 'Handle cannot start or end with a hyphen.' };
	}
	if (RESERVED_ALIASES.includes(handle.toLowerCase())) {
		return { valid: false, reason: 'This handle is reserved.' };
	}
	return { valid: true };
}

// Fallback in-memory rate limiter (per Worker isolate), used when KV is absent
// (local dev, tests) or a KV call fails.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // 10 creates per IP per hour
/** KV rejects expirations less than 60 seconds out. */
const MIN_KV_TTL = 60;

export interface RateLimitOptions {
	/** Time window in milliseconds (default: 1 hour) */
	windowMs?: number;
	/** Max requests per window (default: 10) */
	max?: number;
}

function checkMemory(key: string, cost: number, windowMs: number, max: number): boolean {
	const now = Date.now();
	const recent = (rateLimitMap.get(key) ?? []).filter((t) => now - t < windowMs);
	if (recent.length + cost > max) {
		rateLimitMap.set(key, recent);
		return false;
	}
	for (let i = 0; i < cost; i++) recent.push(now);
	rateLimitMap.set(key, recent);
	return true;
}

interface WindowCounter {
	n: number;
	/** Epoch ms when this window ends */
	reset: number;
}

/**
 * Per-client-IP limit for a named scope (`create`, `report`, `click:<handle>`),
 * keyed `<scope>:<CF-Connecting-IP>`. Scopes keep unrelated actions from
 * spending one shared quota.
 *
 * Without CF-Connecting-IP (never on Cloudflare's edge; possible in local or
 * direct-to-origin requests) every such client would share one fleet-wide KV
 * bucket, so the limit is skipped, matching passphrase-limit.ts.
 */
export async function checkIpRateLimit(
	platform: App.Platform | undefined,
	request: Request,
	scope: string,
	cost = 1,
	opts?: RateLimitOptions
): Promise<boolean> {
	const ip = request.headers.get('cf-connecting-ip');
	if (!ip) return true;
	return checkRateLimit(platform, `${scope}:${ip}`, cost, opts);
}

/**
 * Returns true if the request is within limits, false if it should be blocked.
 * cost: how many "tokens" to consume (default 1). Bulk endpoints pass links.length
 * so that one bulk request consumes proportional quota.
 * The key should be namespaced when called from multiple contexts (e.g. "mcp:1.2.3.4").
 *
 * With platform.env.KV this is a fixed-window counter shared across isolates
 * (key `rl:<key>`, window starts at the first hit). Trade-offs versus the
 * per-isolate sliding window it replaces:
 * - Fixed window: a client can spend `max` at the end of one window and `max`
 *   again at the start of the next (up to 2x burst at the boundary).
 * - KV is eventually consistent (~60s across locations) and allows 1 write/sec
 *   per key, so concurrent or geographically spread requests can undercount.
 *   This is a coarse brake, not an exact quota.
 * - The read-then-write is not atomic; racing requests may both pass.
 * - KV TTLs must be >= 60s, so a counter can linger up to 60s past `reset`;
 *   expired counters are ignored by comparing `reset`, not by TTL.
 * When KV is absent (local dev) or a KV call throws, this logs and falls back
 * to the in-memory sliding window so a KV outage never blocks requests outright.
 */
export async function checkRateLimit(
	platform: App.Platform | undefined,
	key: string,
	cost = 1,
	opts?: RateLimitOptions
): Promise<boolean> {
	const windowMs = opts?.windowMs ?? RATE_LIMIT_WINDOW_MS;
	const max = opts?.max ?? RATE_LIMIT_MAX;
	const kv = platform?.env?.KV;
	if (!kv) return checkMemory(key, cost, windowMs, max);

	const kvKey = `rl:${key}`;
	const now = Date.now();
	let prev: WindowCounter | null;
	try {
		const c = await kv.get<WindowCounter>(kvKey, 'json');
		prev = c && c.reset > now ? c : null;
	} catch (e) {
		// No project logger exists for server code; console.error is the convention here.
		console.error('rate-limit: KV read failed, using in-memory limiter', kvKey, e);
		return checkMemory(key, cost, windowMs, max);
	}

	const used = prev?.n ?? 0;
	if (used + cost > max) return false;

	const next: WindowCounter = { n: used + cost, reset: prev?.reset ?? now + windowMs };
	const ttl = Math.max(MIN_KV_TTL, Math.ceil((next.reset - now) / 1000));
	try {
		await kv.put(kvKey, JSON.stringify(next), { expirationTtl: ttl });
	} catch (e) {
		console.error('rate-limit: KV write failed, using in-memory limiter', kvKey, e);
		return checkMemory(key, cost, windowMs, max);
	}
	return true;
}
