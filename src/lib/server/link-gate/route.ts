/**
 * Glue between the spam gate and the SvelteKit API routes that set a
 * go.nah.tools destination.
 */
import { error } from '@sveltejs/kit';
import { validateUrlSafety } from '$server/safety';
import type { UTMParams } from '$qr/types';
import { judgeDestination, type GateDecision, type GateDeps } from './index';

/**
 * The URL the redirect worker will send visitors to: the stored destination
 * with its UTM parameters set. Must match appendUTM in
 * redirect-worker/src/index.ts, so the gate judges exactly what is served
 * (a redirector can branch on a query parameter).
 */
export function servedUrl(destination: string, utm?: UTMParams): string {
	if (!utm) return destination;
	const parsed = new URL(destination);
	// Only the five stored fields, in the worker's order; other request keys are never stored.
	for (const key of ['source', 'medium', 'campaign', 'term', 'content'] as const) {
		const value = utm[key];
		if (value) parsed.searchParams.set(`utm_${key}`, String(value));
	}
	return parsed.toString();
}

export interface GateOptions {
	/** False for bio page links, which may point at nah.tools. Defaults to true. */
	forRedirect?: boolean;
}

export function gateDeps(
	platform: App.Platform | undefined,
	db: D1Database,
	opts: GateOptions = {}
): GateDeps {
	const forRedirect = opts.forRedirect ?? true;
	return {
		ai: platform?.env?.AI,
		forRedirect,
		// Later hops also go through the D1 blocklist, not only the static policy.
		checkHop: async (url) => {
			const r = await validateUrlSafety(url, db, { forRedirect });
			return r.safe ? null : (r.reason ?? 'blocked');
		}
	};
}

/**
 * nah.tools itself (and www): bio links may point here, and the site is not
 * checked against itself. Other subdomains are judged like any destination:
 * a go.nah.tools short link is followed to wherever it redirects, which may
 * predate the gate.
 */
export function isOwnSite(url: string): boolean {
	try {
		const host = new URL(url).hostname.replace(/\.$/, '');
		return host === 'nah.tools' || host === 'www.nah.tools';
	} catch {
		return false;
	}
}

/**
 * Write the decision's log line, if it has one: one JSON object with a fixed
 * event name and reason code, the destination host and status, and model
 * scores. Never the path, query or anything about the person creating the link.
 */
export function logGateDecision(decision: GateDecision): void {
	if (decision.log) console.info(JSON.stringify(decision.log));
}

/** Run the gate and log its decision. Throws a 400 with a user-facing message when the destination is blocked. */
export async function gateDestinationOrThrow(
	platform: App.Platform | undefined,
	db: D1Database,
	url: string,
	opts: GateOptions = {}
): Promise<void> {
	if (opts.forRedirect === false && isOwnSite(url)) return;
	const decision = await judgeDestination(url, gateDeps(platform, db, opts));
	logGateDecision(decision);
	if (decision.verdict === 'block') throw error(400, decision.message);
}
