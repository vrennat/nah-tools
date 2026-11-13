/**
 * Glue between the spam gate and the SvelteKit API routes that set a
 * go.nah.tools destination.
 */
import { error } from '@sveltejs/kit';
import { validateUrlSafety } from '$server/safety';
import { invalidateRedirectCache, resolveUncheckedHold } from '$server/db';
import { judgeDestination, type GateDeps, type HoldReason } from './index';

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
 * For links held because the model was unavailable, try once more in the
 * background and release or keep the hold. Does nothing for other holds.
 */
export function scheduleRecheck(
	platform: App.Platform | undefined,
	db: D1Database,
	shortCode: string,
	url: string,
	holdReason: HoldReason | null
): void {
	if (holdReason !== 'unchecked' || !platform?.context?.waitUntil) return;
	const kv = platform.env?.KV;
	platform.context.waitUntil(
		(async () => {
			const decision = await judgeDestination(url, gateDeps(platform, db));
			const next =
				decision.verdict === 'allow' ? null : decision.verdict === 'block' ? 'blocked' : decision.holdReason;
			const changed = await resolveUncheckedHold(db, shortCode, url, next);
			if (changed && kv) await invalidateRedirectCache(kv, db, shortCode);
		})().catch((e) => console.error('link gate: recheck failed', e))
	);
}
