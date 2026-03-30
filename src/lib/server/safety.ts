import { isValidURL } from '$server/db';

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
	'static'
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

	// 2. Block IP-only hostnames
	if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
		return { safe: false, reason: 'IP addresses are not allowed as destinations.' };
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

// Simple in-memory rate limiter (resets per Worker isolate)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // 10 creates per IP per hour

export function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const timestamps = rateLimitMap.get(ip) ?? [];

	// Clean old entries
	const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

	if (recent.length >= RATE_LIMIT_MAX) {
		rateLimitMap.set(ip, recent);
		return false;
	}

	recent.push(now);
	rateLimitMap.set(ip, recent);
	return true;
}
