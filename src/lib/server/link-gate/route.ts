/**
 * Glue between the spam gate and the SvelteKit API routes that set a
 * go.nah.tools destination.
 */
import { error } from '@sveltejs/kit';
import { validateUrlSafety } from '$server/safety';
import {
	BudgetExhaustedError,
	dailyCap,
	logBudgetError,
	networkCap,
	readNetworkUsage,
	readUsage,
	refundNetworkCall,
	reserveCall,
	reserveNetworkCall
} from './budget';
import { dailySalt, hashIdentity, networkKey } from '$server/creation-limits';
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

export const NETWORK_BUDGET_EXHAUSTED_MESSAGE =
	"This network has used its share of link safety checks for today, so no more links can be created or changed from it. Please try again after 00:00 UTC.";

function hostOf(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return '';
	}
}

function budgetExhausted(url: string, scope: 'global' | 'network' = 'global'): GateDecision {
	if (scope === 'network') {
		return {
			verdict: 'block',
			message: NETWORK_BUDGET_EXHAUSTED_MESSAGE,
			httpStatus: 429,
			log: { event: 'link_gate_network_budget_exhausted', reason: 'network_daily_model_cap', host: hostOf(url) }
		};
	}
	return {
		verdict: 'block',
		message: BUDGET_EXHAUSTED_MESSAGE,
		httpStatus: 503,
		log: { event: 'link_gate_budget_exhausted', reason: 'daily_model_cap', host: hostOf(url) }
	};
}

/** Who a request's model calls are charged to, besides the global count. */
export interface ModelBudget {
	/** Salted hash of the client network; absent without an IP (local dev) or when KV fails. */
	network?: string;
}

/**
 * The client network as a salted hash (the creation limits' daily salt, kind
 * 'gate'), or undefined without an IP or when KV fails (logged).
 */
async function networkId(platform: App.Platform | undefined, request: Request): Promise<string | undefined> {
	const ip = request.headers.get('cf-connecting-ip');
	const kv = platform?.env?.KV;
	if (!ip || !kv) return undefined;
	try {
		return await hashIdentity(await dailySalt(kv), 'gate', networkKey(ip));
	} catch {
		logBudgetError('network_key_failed');
		return undefined;
	}
}

/**
 * Refuse a request that would need the model once the day's model calls, or
 * this network's share of them, are used up, before the caller charges the
 * creator's own allowance (enforceCreationLimits) or fetches anything. Call
 * it after the static URL checks, which decide without the model. Without an
 * AI binding no model call is made, so nothing is refused. Failed reads are
 * logged and allowed. Returns the budget to pass to the gate.
 */
export async function assertModelBudget(
	platform: App.Platform | undefined,
	request: Request,
	url: string
): Promise<ModelBudget> {
	if (!platform?.env?.AI) return {};
	const db = platform.env.DB;
	const used = await readUsage(db);
	if (used !== null && used >= dailyCap(platform.env.LINK_GATE_DAILY_MODEL_CALLS)) {
		logGateDecision(budgetExhausted(url));
		throw error(503, BUDGET_EXHAUSTED_MESSAGE);
	}
	const network = await networkId(platform, request);
	if (network) {
		const mine = await readNetworkUsage(db, network);
		if (mine !== null && mine >= networkCap(platform.env.LINK_GATE_NETWORK_DAILY_MODEL_CALLS)) {
			logGateDecision(budgetExhausted(url, 'network'));
			throw error(429, NETWORK_BUDGET_EXHAUSTED_MESSAGE);
		}
	}
	return { network };
}

/**
 * Judge a destination within the daily model-call budget (budget.ts, counted
 * in D1). Every model call first reserves one unit of the network's share
 * (when the network is known), then one unit of the global count; if the
 * global count is used up, the network unit is given back. Nothing else is
 * refunded: a unit is taken only for a call that is about to run.
 *
 * Global limit reached: refused with 503, logged as link_gate_budget_exhausted,
 * for every creator (Tanner's decision, 2026-11-13). Network share used up:
 * refused with 429, logged as link_gate_network_budget_exhausted.
 */
export async function judgeWithinBudget(
	platform: App.Platform | undefined,
	url: string,
	deps: GateDeps,
	budget: ModelBudget = {}
): Promise<GateDecision> {
	const db = platform?.env?.DB;
	const cap = dailyCap(platform?.env?.LINK_GATE_DAILY_MODEL_CALLS);
	const share = networkCap(platform?.env?.LINK_GATE_NETWORK_DAILY_MODEL_CALLS);
	const { network } = budget;
	// Cheap early refusal, before fetching anything. Without a model there is
	// nothing to count: the gate allows unchecked and logs it.
	if (deps.ai) {
		const used = await readUsage(db);
		if (used !== null && used >= cap) return budgetExhausted(url);
		if (network) {
			const mine = await readNetworkUsage(db, network);
			if (mine !== null && mine >= share) return budgetExhausted(url, 'network');
		}
	}
	const ai = deps.ai && {
		run: async (model: string, input: unknown) => {
			const mine = network ? await reserveNetworkCall(db, network, share) : undefined;
			if (mine && !mine.ok) throw new BudgetExhaustedError('network');
			if (!(await reserveCall(db, cap))) {
				if (network && mine) await refundNetworkCall(db, network, mine);
				throw new BudgetExhaustedError('global');
			}
			return deps.ai!.run(model, input);
		}
	};
	try {
		return await judgeDestination(url, { ...deps, ai });
	} catch (e) {
		if (e instanceof BudgetExhaustedError) return budgetExhausted(url, e.scope);
		throw e;
	}
}

/** Run the gate and log its decision. Throws a 400 with a user-facing message when the destination is blocked. */
export async function gateDestinationOrThrow(
	platform: App.Platform | undefined,
	db: D1Database,
	url: string,
	budget: ModelBudget = {}
): Promise<void> {
	const decision = await judgeWithinBudget(platform, url, gateDeps(platform, db), budget);
	logGateDecision(decision);
	if (decision.verdict === 'block') throw error(decision.httpStatus ?? 400, decision.message);
}
