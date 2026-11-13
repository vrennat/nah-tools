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
import {
	attr,
	decodeEntities,
	elementContents,
	openingTags,
	parseRefresh,
	stripElements,
	visibleText
} from './html-scan';

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

/** `location = "..."`, `location.href = '...'`, `location.replace("...")`, `location.assign(...)`, optionally on window/document/top. */
const SCRIPT_REDIRECT_RE =
	/(?:window\.|document\.|top\.|self\.)?location(?:\.href)?\s*(?:=\s*|\.(?:replace|assign)\s*\(\s*)["'`]([^"'`]{1,2048})["'`]/i;

/**
 * A page with less visible text than this that sets a client-side redirect is
 * treated as a loader and followed. Pages with real content often carry
 * conditional redirect scripts (language or device switches) that must not be
 * followed blindly.
 */
export const LOADER_TEXT_MAX_CHARS = 400;

/**
 * Find a client-side redirect target in a loader page (little visible text).
 * Returns the raw (possibly relative) URL, or null for a content page.
 * Scans the whole (already size-capped) body in linear time.
 */
export function findClientRedirect(html: string): { url: string; via: HopKind } | null {
	// Comments and <noscript> fallbacks do not run in a browser with JavaScript.
	const live = stripElements(html, ['noscript']);
	if (visibleText(live).length > LOADER_TEXT_MAX_CHARS) return null;
	for (const tag of openingTags(live, 'meta')) {
		if (!/^refresh$/i.test((attr(tag, 'http-equiv') ?? '').trim())) continue;
		const target = parseRefresh(attr(tag, 'content') ?? '');
		if (target) return { url: target, via: 'meta-refresh' };
	}
	for (const script of elementContents(live, 'script')) {
		const m = SCRIPT_REDIRECT_RE.exec(script.inner.slice(0, 64 * 1024));
		if (m) return { url: decodeEntities(m[1]), via: 'script' };
	}
	return null;
}

/** Content types that are read: HTML and other text, XML, JSON, and SVG (which can carry scripts). */
function isTextual(contentType: string): boolean {
	return (
		/^(text\/|application\/(xhtml\+xml|xml|json)|image\/svg\+xml)/i.test(contentType) || contentType === ''
	);
}

function resolveTarget(target: string | null, base: string): string | null {
	if (!target) return null;
	try {
		return new URL(target, base).toString();
	} catch {
		return null;
	}
}

/** Only default web ports are fetched; other ports end the chain as unreadable. */
const ALLOWED_PORTS = new Set(['', '80', '443']);

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
 * Follow `startUrl` through HTTP redirects, `Refresh` headers, meta refreshes
 * and simple script redirects. Every hop, including the first, is checked
 * against the static policy before it is fetched. Does not throw, except that
 * an error thrown by `checkHop` propagates to the caller.
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
			if (!ALLOWED_PORTS.has(new URL(url).port)) {
				return { outcome: 'fetch-failed', hops, finalUrl: url, reason: 'non-standard port' };
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
			const refresh = resolveTarget(parseRefresh(res.headers.get('refresh') ?? ''), url);
			if (res.status >= 300 && res.status < 400 && location) {
				res.body?.cancel().catch(() => {});
				next = location;
				hop.via = 'http';
			} else if (refresh && !hops.some((h) => h.url === refresh)) {
				// A Refresh header that reloads a page already seen is not a hop; read the page.
				res.body?.cancel().catch(() => {});
				next = refresh;
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
				// An unparseable target leaves clientTarget null: judge this page as it is.
				const clientTarget = resolveTarget(client?.url ?? null, url);
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
