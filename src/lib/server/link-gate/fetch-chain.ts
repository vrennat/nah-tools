/**
 * Follow a destination's redirect chain to the page a visitor lands on.
 *
 * Spam links on go.nah.tools pointed at throwaway redirector domains that
 * forwarded to the real phishing page, so judging the first URL is not enough.
 * Every hop is re-checked against the static destination policy before it is
 * fetched: a chain cannot reach an IP literal, localhost, a blocked domain or
 * another shortener partway through.
 */
import { checkDestination } from '$server/destination-policy';

export const MAX_HOPS = 5;
export const TOTAL_TIMEOUT_MS = 3000;
export const MAX_BODY_BYTES = 256 * 1024;

export type HopKind = 'http' | 'meta-refresh' | 'script';

export interface Hop {
	url: string;
	status: number;
	/** How the next hop was reached from this one; absent on the last hop. */
	via?: HopKind;
}

export type ChainOutcome =
	/** A final page was fetched (any status). */
	| 'page'
	/** A hop failed the destination policy; `reason` says which rule. */
	| 'policy-blocked'
	/** More than MAX_HOPS redirects. */
	| 'too-many-hops'
	/** Network error, timeout, or unreadable response. */
	| 'fetch-failed';

export interface ChainResult {
	outcome: ChainOutcome;
	hops: Hop[];
	finalUrl: string;
	/** Present when outcome is 'page'. */
	status?: number;
	contentType?: string;
	/** Decoded body, cut at MAX_BODY_BYTES. Only text-like content types are read. */
	body?: string;
	reason?: string;
}

/** Browser-like headers: many sites answer bare clients with a 403 or a stub. */
const REQUEST_HEADERS = {
	'User-Agent':
		'Mozilla/5.0 (compatible; nah.tools link check; +https://nah.tools/trust)',
	Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
	'Accept-Language': 'en-US,en;q=0.8'
};

const META_REFRESH_RE =
	/<meta[^>]+http-equiv\s*=\s*["']?refresh["']?[^>]*content\s*=\s*["']?\s*\d*\s*;?\s*url\s*=\s*['"]?([^"'>\s]+)/i;
const META_REFRESH_RE_REV =
	/<meta[^>]+content\s*=\s*["']?\s*\d*\s*;?\s*url\s*=\s*['"]?([^"'>\s]+)[^>]*http-equiv\s*=\s*["']?refresh/i;
/** `location = "..."`, `location.href = '...'`, `location.replace("...")`, `location.assign(...)`, optionally on window/document/top. */
const SCRIPT_REDIRECT_RE =
	/(?:window\.|document\.|top\.|self\.)?location(?:\.href)?\s*(?:=\s*|\.(?:replace|assign)\s*\(\s*)["'`]([^"'`]+)["'`]/i;

/**
 * A page with less visible text than this that sets a client-side redirect is
 * treated as a loader and followed. Pages with real content often carry
 * conditional redirect scripts (language or device switches) that must not be
 * followed blindly.
 */
export const LOADER_TEXT_MAX_CHARS = 400;

function visibleTextLength(html: string): number {
	return html
		.replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim().length;
}

/**
 * Find a client-side redirect target in a loader page (little visible text).
 * Returns the raw (possibly relative) URL, or null for a content page.
 */
export function findClientRedirect(html: string): { url: string; via: HopKind } | null {
	const head = html.slice(0, 64 * 1024).replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ');
	if (visibleTextLength(head) > LOADER_TEXT_MAX_CHARS) return null;
	const meta = META_REFRESH_RE.exec(head) ?? META_REFRESH_RE_REV.exec(head);
	if (meta) return { url: decodeEntities(meta[1]), via: 'meta-refresh' };
	for (const script of head.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
		const m = SCRIPT_REDIRECT_RE.exec(script[1]);
		if (m) return { url: decodeEntities(m[1]), via: 'script' };
	}
	return null;
}

function decodeEntities(s: string): string {
	return s.replace(/&amp;/g, '&').replace(/&#x2f;/gi, '/').replace(/&#47;/g, '/');
}

function isTextual(contentType: string): boolean {
	return /^(text\/|application\/(xhtml\+xml|xml|json))/i.test(contentType) || contentType === '';
}

async function readCapped(res: Response, maxBytes: number, signal: AbortSignal): Promise<string> {
	if (!res.body) return '';
	const reader = res.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	try {
		while (total < maxBytes) {
			if (signal.aborted) throw new Error('timeout');
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(value);
			total += value.byteLength;
		}
	} finally {
		reader.cancel().catch(() => {});
	}
	const buf = new Uint8Array(Math.min(total, maxBytes));
	let off = 0;
	for (const c of chunks) {
		const take = Math.min(c.byteLength, buf.byteLength - off);
		buf.set(c.subarray(0, take), off);
		off += take;
		if (off >= buf.byteLength) break;
	}
	return new TextDecoder('utf-8', { fatal: false }).decode(buf);
}

export interface FollowOptions {
	fetchImpl?: typeof fetch;
	maxHops?: number;
	timeoutMs?: number;
	maxBytes?: number;
	/**
	 * Extra check for each hop after the first, such as the D1 blocklist.
	 * Return a reason to stop the chain as policy-blocked, or null to continue.
	 */
	checkHop?: (url: string) => Promise<string | null>;
}

/**
 * Follow `startUrl` through HTTP redirects, meta refreshes and simple script
 * redirects. Never throws. The start URL is assumed to have passed the policy
 * already; every later hop is checked here before it is fetched.
 */
export async function followChain(startUrl: string, opts: FollowOptions = {}): Promise<ChainResult> {
	const fetchImpl = opts.fetchImpl ?? fetch;
	const maxHops = opts.maxHops ?? MAX_HOPS;
	const maxBytes = opts.maxBytes ?? MAX_BODY_BYTES;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? TOTAL_TIMEOUT_MS);

	const hops: Hop[] = [];
	let url = startUrl;
	try {
		for (;;) {
			const policy = checkDestination(url, { forRedirect: true });
			if (!policy.ok) {
				return { outcome: 'policy-blocked', hops, finalUrl: url, reason: policy.reason };
			}
			if (hops.length > 0 && opts.checkHop) {
				const reason = await opts.checkHop(url);
				if (reason) return { outcome: 'policy-blocked', hops, finalUrl: url, reason };
			}

			let res: Response;
			try {
				res = await fetchImpl(url, {
					method: 'GET',
					redirect: 'manual',
					headers: REQUEST_HEADERS,
					signal: controller.signal
				});
			} catch (e) {
				return {
					outcome: 'fetch-failed',
					hops,
					finalUrl: url,
					reason: controller.signal.aborted ? 'timeout' : String(e)
				};
			}

			const hop: Hop = { url, status: res.status };
			hops.push(hop);

			let next: string | null = null;
			const location = res.headers.get('location');
			if (res.status >= 300 && res.status < 400 && location) {
				res.body?.cancel().catch(() => {});
				next = location;
				hop.via = 'http';
			} else {
				const contentType = res.headers.get('content-type') ?? '';
				let body = '';
				if (isTextual(contentType)) {
					try {
						body = await readCapped(res, maxBytes, controller.signal);
					} catch (e) {
						return {
							outcome: 'fetch-failed',
							hops,
							finalUrl: url,
							reason: controller.signal.aborted ? 'timeout' : String(e)
						};
					}
				} else {
					res.body?.cancel().catch(() => {});
				}
				const client = body ? findClientRedirect(body) : null;
				let clientTarget: string | null = null;
				if (client) {
					try {
						clientTarget = new URL(client.url, url).toString();
					} catch {
						// Unparseable script target: judge this page as it is.
					}
				}
				// A client redirect back to a page already seen is a loop; judge this page.
				if (!clientTarget || hops.some((h) => h.url === clientTarget)) {
					return { outcome: 'page', hops, finalUrl: url, status: res.status, contentType, body };
				}
				next = clientTarget;
				hop.via = client!.via;
			}

			if (hops.length > maxHops) {
				return { outcome: 'too-many-hops', hops, finalUrl: url, reason: `more than ${maxHops} redirects` };
			}
			try {
				url = new URL(next, url).toString();
			} catch {
				return { outcome: 'fetch-failed', hops, finalUrl: url, reason: 'invalid redirect target' };
			}
		}
	} finally {
		clearTimeout(timer);
	}
}
