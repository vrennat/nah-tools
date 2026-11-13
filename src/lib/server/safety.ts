import { checkDestination, domainAndParents } from '$server/destination-policy';

/** Verify a Cloudflare Turnstile token */
export async function verifyTurnstile(
	token: string,
	secretKey: string,
	ip?: string
): Promise<boolean> {
	const body: Record<string, string> = {
		secret: secretKey,
		response: token
	};
	if (ip) body.remoteip = ip;

	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const data = (await res.json()) as { success: boolean };
	return data.success;
}

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

/**
 * Validate a destination URL: the static policy in destination-policy.ts, then
 * the D1 `blocked_domains` table, which blocks a listed domain and all of its
 * subdomains. Pass `forRedirect: false` for bio page links, which may point at
 * nah.tools.
 */
export async function validateUrlSafety(
	url: string,
	db: D1Database,
	opts: { forRedirect?: boolean } = {}
): Promise<{ safe: boolean; reason?: string }> {
	const policy = checkDestination(url, { forRedirect: opts.forRedirect ?? true });
	if (!policy.ok) {
		return { safe: false, reason: policy.reason };
	}

	const hostname = new URL(url).hostname.replace(/\.$/, '');
	// checkDestination caps hostnames at MAX_HOST_LABELS labels, which keeps this
	// IN() list far below D1's bound-parameter limit.
	const candidates = domainAndParents(hostname);
	const blocked = await db
		.prepare(
			`SELECT 1 FROM blocked_domains WHERE domain IN (${candidates.map(() => '?').join(', ')}) LIMIT 1`
		)
		.bind(...candidates)
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

// Simple in-memory rate limiter (resets per Worker isolate)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // 10 creates per IP per hour

export interface RateLimitOptions {
	/** Time window in milliseconds (default: 1 hour) */
	windowMs?: number;
	/** Max requests per window (default: 10) */
	max?: number;
}

/**
 * Returns true if the request is within limits, false if it should be blocked.
 * cost: how many "tokens" to consume (default 1). Bulk endpoints pass links.length
 * so that one bulk request consumes proportional quota.
 * The key should be namespaced when called from multiple contexts (e.g. "mcp:1.2.3.4").
 */
export function checkRateLimit(key: string, cost = 1, opts?: RateLimitOptions): boolean {
	const windowMs = opts?.windowMs ?? RATE_LIMIT_WINDOW_MS;
	const max = opts?.max ?? RATE_LIMIT_MAX;
	const now = Date.now();
	const timestamps = rateLimitMap.get(key) ?? [];

	// Clean old entries
	const recent = timestamps.filter((t) => now - t < windowMs);

	if (recent.length + cost > max) {
		rateLimitMap.set(key, recent);
		return false;
	}

	// Record one timestamp per cost unit so future checks are consistent
	for (let i = 0; i < cost; i++) {
		recent.push(now);
	}
	rateLimitMap.set(key, recent);
	return true;
}
