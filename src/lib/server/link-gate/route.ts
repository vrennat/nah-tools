/**
 * Glue between the spam gate and the SvelteKit API routes that set a
 * go.nah.tools destination.
 */
import { error } from '@sveltejs/kit';
import { validateUrlSafety } from '$server/safety';
import { cacheRedirectRow, disableFlaggedRedirect } from '$server/db';
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
 * Write the decision's log line, if it has one: one JSON object with a fixed
 * event name and reason code, the destination host and status, and model
 * scores. Never the path, query or anything about the person creating the link.
 */
export function logGateDecision(decision: GateDecision): void {
	if (decision.log) console.info(JSON.stringify(decision.log));
}

/**
 * Run the gate and log its decision. Throws a 400 with a user-facing message
 * when the destination is blocked; otherwise returns the decision, which
 * scheduleRecheck needs.
 */
export async function gateDestinationOrThrow(
	platform: App.Platform | undefined,
	db: D1Database,
	url: string
): Promise<GateDecision> {
	const decision = await judgeDestination(url, gateDeps(platform, db));
	logGateDecision(decision);
	if (decision.verdict === 'block') throw error(400, decision.message);
	return decision;
}

/** Budgets for the background recheck, which runs after the response inside waitUntil's 30 s. */
export const RECHECK_FETCH_TIMEOUT_MS = 10_000;
export const RECHECK_MODEL_TIMEOUT_MS = 8_000;

/** Dependencies for the background recheck: the normal gate, with longer budgets. */
export function recheckDeps(platform: App.Platform | undefined, db: D1Database): GateDeps {
	return { ...gateDeps(platform, db), fetchTimeoutMs: RECHECK_FETCH_TIMEOUT_MS, clefTimeoutMs: RECHECK_MODEL_TIMEOUT_MS };
}

/**
 * A link allowed because the check could not finish (a first-URL timeout or
 * network error, or a model failure) gets one more check after the response,
 * with longer budgets (issue #54). If that check blocks, the link is
 * disabled with disabled_reason 'destination_flagged', which the owner's
 * manage page and the redirect worker show. If it allows or cannot finish
 * either, the link stays active: there is no waiting state.
 *
 * Every recheck that completes writes one line, link_gate_recheck_done, with
 * its verdict and whether the link was disabled; a recheck that throws writes
 * link_gate_recheck_error with a fixed code. A recheck the runtime cuts off
 * after waitUntil's 30 s writes neither, so started rechecks (the
 * link_gate_allow_unchecked lines) minus done and error lines counts those.
 * Returns the background promise, for tests.
 */
export function scheduleRecheck(
	platform: App.Platform | undefined,
	db: D1Database,
	decision: GateDecision,
	link: {
		shortCode: string;
		storedUrl: string;
		/** The UTM fields stored with the link: the recheck only disables the row if they are unchanged. */
		storedUtm?: UTMParams;
		gateUrl: string;
	}
): Promise<void> | undefined {
	if (decision.verdict !== 'allow' || decision.log?.event !== 'link_gate_allow_unchecked') return;
	if (!platform?.context?.waitUntil) return;
	let stage = 'judge';
	const task = (async () => {
		const result = await judgeDestination(link.gateUrl, recheckDeps(platform, db));
		let disabled = false;
		if (result.verdict === 'block') {
			stage = 'disable';
			disabled = await disableFlaggedRedirect(db, link.shortCode, link.storedUrl, link.storedUtm);
			const kv = platform.env?.KV;
			if (disabled && kv) {
				stage = 'cache';
				await cacheRedirectRow(kv, db, link.shortCode);
			}
		}
		console.info(
			JSON.stringify({
				event: 'link_gate_recheck_done',
				verdict: result.verdict,
				result_event: result.log?.event ?? null,
				reason: result.log?.reason ?? null,
				host: result.log?.host ?? null,
				disabled
			})
		);
	})().catch(() => {
		console.error(JSON.stringify({ event: 'link_gate_recheck_error', reason: `${stage}_failed` }));
	});
	platform.context.waitUntil(task);
	return task;
}
