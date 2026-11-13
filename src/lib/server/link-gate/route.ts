/**
 * Glue between the spam gate and the SvelteKit API routes that set a
 * go.nah.tools destination.
 */
import { error } from '@sveltejs/kit';
import { validateUrlSafety } from '$server/safety';
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
 * Judge a destination within the global daily model-call budget (budget.ts,
 * counted in D1). Every model call reserves one unit first. When the budget
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
	// Cheap early refusal, before fetching anything.
	const used = await readUsage(db);
	if (used !== null && used >= cap) return budgetExhausted(url);
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

/** Run the gate and log its decision. Throws a 400 with a user-facing message when the destination is blocked. */
export async function gateDestinationOrThrow(
	platform: App.Platform | undefined,
	db: D1Database,
	url: string
): Promise<void> {
	const decision = await judgeWithinBudget(platform, url, gateDeps(platform, db));
	logGateDecision(decision);
	if (decision.verdict === 'block') throw error(decision.httpStatus ?? 400, decision.message);
}
