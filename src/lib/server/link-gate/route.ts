/**
 * Glue between the spam gate and the SvelteKit API routes that set a
 * go.nah.tools destination.
 */
import { error } from '@sveltejs/kit';
import { validateUrlSafety } from '$server/safety';
import { invalidateRedirectCache, resolveUncheckedHold } from '$server/db';
import { judgeDestination, type GateDeps, type HoldReason } from './index';
import { RECHECKABLE_HOLDS } from './decide';

/**
 * The URL the redirect worker will send visitors to: the stored destination
 * with its UTM parameters set. Must match appendUTM in
 * redirect-worker/src/index.ts, so the gate judges exactly what is served
 * (a redirector can branch on a query parameter).
 */
export function servedUrl(
	destination: string,
	utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string }
): string {
	if (!utm) return destination;
	const parsed = new URL(destination);
	for (const [key, value] of Object.entries(utm)) {
		if (value) parsed.searchParams.set(`utm_${key}`, value);
	}
	return parsed.toString();
}

/** Shown to the creator when a link is stored but held. */
export const HOLD_NOTICE =
	'This link was created but is on hold while its destination is checked. It will not redirect until the check passes.';

export function gateDeps(platform: App.Platform | undefined, db: D1Database): GateDeps {
	return {
		ai: platform?.env?.AI,
		// Later hops also go through the D1 blocklist, not only the static policy.
		checkHop: async (url) => {
			const r = await validateUrlSafety(url, db);
			return r.safe ? null : (r.reason ?? 'blocked');
		}
	};
}

/**
 * Run the gate. Throws a 400 when the destination is blocked; otherwise
 * returns the hold reason to store, or null when the link may go live.
 */
export async function gateDestinationOrThrow(
	platform: App.Platform | undefined,
	db: D1Database,
	url: string
): Promise<HoldReason | null> {
	const decision = await judgeDestination(url, gateDeps(platform, db));
	if (decision.verdict === 'block') throw error(400, decision.reason);
	if (decision.verdict === 'hold') {
		console.warn(`link gate: hold (${decision.holdReason}: ${decision.detail}) for ${new URL(url).hostname}`);
		return decision.holdReason;
	}
	return null;
}

/**
 * For links held because the check itself failed (model unavailable, page
 * unreadable), try once more in the background and release or keep the hold.
 * Does nothing for other holds.
 */
export function scheduleRecheck(
	platform: App.Platform | undefined,
	db: D1Database,
	shortCode: string,
	/** The destination as stored, used to match the row. */
	url: string,
	holdReason: HoldReason | null,
	/** The URL to judge, when it differs from the stored one (UTM parameters). */
	gateUrl: string = url
): void {
	if (!holdReason || !RECHECKABLE_HOLDS.includes(holdReason) || !platform?.context?.waitUntil) return;
	const kv = platform.env?.KV;
	platform.context.waitUntil(
		(async () => {
			const decision = await judgeDestination(gateUrl, gateDeps(platform, db));
			const next =
				decision.verdict === 'allow' ? null : decision.verdict === 'block' ? 'blocked' : decision.holdReason;
			const changed = await resolveUncheckedHold(db, shortCode, url, next);
			if (changed && kv) await invalidateRedirectCache(kv, db, shortCode);
		})().catch((e) => console.error('link gate: recheck failed', e))
	);
}
