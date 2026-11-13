/**
 * Glue between the spam gate and the SvelteKit API routes that set a
 * go.nah.tools destination.
 */
import { error } from '@sveltejs/kit';
import { validateUrlSafety } from '$server/safety';
import { cacheRedirectRow, disableFlaggedRedirect, getRedirect } from '$server/db';
import { verifyPassphrase } from '$server/auth';
import { BudgetExhaustedError, dailyCap, readUsage, reserveCall } from './budget';
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

export const BUDGET_EXHAUSTED_MESSAGE =
	'New short links are paused for today because the link safety check has reached its daily limit. Please try again after 00:00 UTC.';

function budgetExhausted(url: string): GateDecision {
	let host = '';
	try {
		host = new URL(url).hostname;
	} catch {
		// Leave host empty.
	}
	return {
		verdict: 'block',
		message: BUDGET_EXHAUSTED_MESSAGE,
		httpStatus: 503,
		log: { event: 'link_gate_budget_exhausted', reason: 'daily_model_cap', host }
	};
}

/**
 * Refuse a request that would need the model once the day's model calls are
 * used up, before the caller charges the creator's own allowance
 * (enforceCreationLimits) or fetches anything. Call it after the static URL
 * checks, which decide without the model. Without an AI binding no model
 * call is made, so nothing is refused. A failed read is logged and allowed.
 */
export async function assertModelBudget(platform: App.Platform | undefined, url: string): Promise<void> {
	if (!platform?.env?.AI) return;
	const used = await readUsage(platform.env.DB);
	if (used === null || used < dailyCap(platform.env.LINK_GATE_DAILY_MODEL_CALLS)) return;
	const decision = budgetExhausted(url);
	logGateDecision(decision);
	throw error(503, BUDGET_EXHAUSTED_MESSAGE);
}

/**
 * Judge a destination within the global daily model-call budget (budget.ts,
 * counted in D1). Every model call reserves one unit just before it runs;
 * there is nothing to refund. When the budget
 * is used up, the request is refused with a 503 and logged as
 * link_gate_budget_exhausted, for every creator: a passphrase costs nothing
 * to set, so exempting passphrase users would leave the same bypass.
 */
export async function judgeWithinBudget(
	platform: App.Platform | undefined,
	url: string,
	deps: GateDeps
): Promise<GateDecision> {
	const db = platform?.env?.DB;
	const cap = dailyCap(platform?.env?.LINK_GATE_DAILY_MODEL_CALLS);
	// Cheap early refusal, before fetching anything. Without a model there is
	// nothing to count: the gate allows unchecked and logs it.
	if (deps.ai) {
		const used = await readUsage(db);
		if (used !== null && used >= cap) return budgetExhausted(url);
	}
	const ai = deps.ai && {
		run: async (model: string, input: unknown) => {
			if (!(await reserveCall(db, cap))) throw new BudgetExhaustedError();
			return deps.ai!.run(model, input);
		}
	};
	try {
		return await judgeDestination(url, { ...deps, ai });
	} catch (e) {
		if (e instanceof BudgetExhaustedError) return budgetExhausted(url);
		throw e;
	}
}

/**
 * Run the gate and log its decision. Throws with a user-facing message (400,
 * or the decision's own status such as 503 at the daily limit) when the
 * destination is blocked; otherwise returns the decision, which
 * scheduleRecheck needs.
 */
export async function gateDestinationOrThrow(
	platform: App.Platform | undefined,
	db: D1Database,
	url: string,
	opts: GateOptions = {}
): Promise<GateDecision> {
	if (opts.forRedirect === false && isOwnSite(url)) return { verdict: 'allow' };
	const decision = await judgeWithinBudget(platform, url, gateDeps(platform, db, opts));
	logGateDecision(decision);
	if (decision.verdict === 'block') throw error(decision.httpStatus ?? 400, decision.message);
	return decision;
}

/**
 * At most this many gate checks run at once. A Worker invocation can have six
 * connections waiting for response headers; a seventh fetch is queued
 * (https://developers.cloudflare.com/workers/platform/limits/#simultaneous-open-connections),
 * and its 3-second fetch budget keeps running while it waits, so a queued
 * destination would time out and be allowed unchecked. Five leaves a slot
 * for D1 and KV. It also bounds model calls in flight.
 */
export const GATE_CONCURRENCY = 5;

/**
 * gateDestinationOrThrow for several URLs, at most GATE_CONCURRENCY at a
 * time. The first block rejects; no further checks are started after it.
 */
export async function gateAllOrThrow(
	platform: App.Platform | undefined,
	db: D1Database,
	urls: readonly string[],
	opts: GateOptions = {}
): Promise<void> {
	let next = 0;
	let failed = false;
	const worker = async () => {
		while (!failed && next < urls.length) {
			const url = urls[next++];
			try {
				await gateDestinationOrThrow(platform, db, url, opts);
			} catch (e) {
				failed = true;
				throw e;
			}
		}
	};
	await Promise.all(Array.from({ length: Math.min(GATE_CONCURRENCY, urls.length) }, worker));
}

/**
 * True when a decision blocks because of the destination itself (the model,
 * Cloudflare's warning page, a redirect rule, an installer). Any other block,
 * such as a refusal because the daily model-call limit is used up, means the
 * check could not finish: a recheck must not disable a link for it.
 */
export function isSpamVerdict(decision: GateDecision): boolean {
	return (
		decision.verdict === 'block' &&
		(decision.log.event === 'link_gate_block' || decision.log.event === 'link_gate_block_download')
	);
}

export const FLAGGED_LINK_MESSAGE =
	'This link was disabled because its destination was flagged as harmful, so its destination cannot be changed. If you think this is wrong, report it at https://github.com/vrennat/nah-tools/issues.';

/**
 * Refuse a destination change on a link a recheck disabled. Its recheck could
 * not disable it again (the row is already inactive), so a later manual
 * restore would switch on a destination nobody cleared.
 */
export function assertNotFlagged(row: { disabled_reason?: string | null }): void {
	if (row.disabled_reason === 'destination_flagged') throw error(409, FLAGGED_LINK_MESSAGE);
}

/**
 * Refuse the owner's destination change on a flagged link with 409 before
 * anything is charged: call it before the model budget and the creation
 * limits. It reads the row, and only for a flagged link verifies the
 * passphrase. Anyone else continues on the normal path, where the creation
 * limits still throttle guessing and a wrong passphrase gets 403. Flagged
 * status is no secret: the short link itself answers 410 saying so.
 */
export async function refuseFlaggedChangeForOwner(db: D1Database, shortCode: string, passphrase: string): Promise<void> {
	const row = await getRedirect(db, shortCode);
	if (row?.disabled_reason !== 'destination_flagged') return;
	if (await verifyPassphrase(passphrase, row.passphrase_hash)) throw error(409, FLAGGED_LINK_MESSAGE);
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
 * Only a spam verdict (isSpamVerdict) disables the link; any other block
 * leaves it active, logged in link_gate_recheck_done with its result event.
 *
 * Every scheduled recheck writes link_gate_recheck_started. One that
 * completes writes link_gate_recheck_done, with its verdict and whether the
 * link was disabled; one that throws writes link_gate_recheck_error with a
 * fixed code. A recheck the runtime cuts off after waitUntil's 30 s writes
 * neither, so started minus done and error lines counts those.
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
	console.info(JSON.stringify({ event: 'link_gate_recheck_started', host: decision.log?.host ?? null }));
	let stage = 'judge';
	const task = (async () => {
		const result = await judgeWithinBudget(platform, link.gateUrl, recheckDeps(platform, db));
		let disabled = false;
		if (isSpamVerdict(result)) {
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
