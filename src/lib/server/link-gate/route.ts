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
	blockCap,
	networkCap,
	readNetworkUsage,
	readUsage,
	refundNetworkCall,
	reserveCall,
	reserveNetworkCall,
	type NetworkReservation
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

function budgetExhausted(url: string, scope: 'global' | 'network' | 'block' = 'global'): GateDecision {
	if (scope !== 'global') {
		// A network over its share and an IPv6 /48 over its share get the same answer.
		return {
			verdict: 'block',
			message: NETWORK_BUDGET_EXHAUSTED_MESSAGE,
			httpStatus: 429,
			log: {
				event: 'link_gate_network_budget_exhausted',
				reason: scope === 'block' ? 'block_daily_model_cap' : 'network_daily_model_cap',
				host: hostOf(url)
			}
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
	/** Salted hash of the client network (IPv4 address or IPv6 /64); absent without an IP (local dev) or when KV fails. */
	network?: string;
	/** Salted hash of the client's IPv6 /48; absent for IPv4 and when network is absent. */
	block?: string;
}

/** The IPv6 /48 containing a /64 network key ('2001:0db8:0001:0002::/64'), or undefined for IPv4. */
export function ipv6BlockKey(networkKeyValue: string): string | undefined {
	if (!networkKeyValue.endsWith('::/64')) return undefined;
	return networkKeyValue.split(':').slice(0, 3).join(':') + '::/48';
}

/**
 * The client network and, for IPv6, its /48 block, as salted hashes (the
 * creation limits' daily salt, kinds 'gate' and 'gate48'); empty without an
 * IP or when KV fails (logged).
 */
async function budgetIds(platform: App.Platform | undefined, request: Request): Promise<ModelBudget> {
	const ip = request.headers.get('cf-connecting-ip');
	const kv = platform?.env?.KV;
	if (!ip || !kv) return {};
	try {
		const salt = await dailySalt(kv);
		const key = networkKey(ip);
		const blockKey = ipv6BlockKey(key);
		return {
			network: await hashIdentity(salt, 'gate', key),
			block: blockKey ? await hashIdentity(salt, 'gate48', blockKey) : undefined
		};
	} catch {
		logBudgetError('network_key_failed');
		return {};
	}
}

/** One share a model call is charged to before the global count, in reservation order. */
interface Share {
	id: string;
	cap: number;
	scope: 'network' | 'block';
}

/** The shares to charge, in order: the network (IPv4 address or IPv6 /64), then its IPv6 /48. */
function sharesFor(platform: App.Platform | undefined, budget: ModelBudget): Share[] {
	const network = networkCap(platform?.env?.LINK_GATE_NETWORK_DAILY_MODEL_CALLS);
	const shares: Share[] = [];
	if (budget.network) shares.push({ id: budget.network, cap: network, scope: 'network' });
	if (budget.network && budget.block) {
		shares.push({ id: budget.block, cap: blockCap(platform?.env?.LINK_GATE_BLOCK_DAILY_MODEL_CALLS, network), scope: 'block' });
	}
	return shares;
}

/** The first share already used up, read without reserving; failed reads are logged and pass. */
async function exhaustedShare(db: D1Database | undefined, shares: Share[]): Promise<Share | undefined> {
	for (const share of shares) {
		const used = await readNetworkUsage(db, share.id);
		if (used !== null && used >= share.cap) return share;
	}
	return undefined;
}

/**
 * Refuse a request that would need the model once the day's model calls, or
 * this network's or IPv6 /48's share of them, are used up, before the caller
 * charges the creator's own allowance (enforceCreationLimits) or fetches
 * anything. Call it after the static URL checks, which decide without the
 * model. Without an AI binding no model call is made, so nothing is refused.
 * Failed reads are logged and allowed. Returns the budget to pass to the gate.
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
	const budget = await budgetIds(platform, request);
	const full = await exhaustedShare(db, sharesFor(platform, budget));
	if (full) {
		logGateDecision(budgetExhausted(url, full.scope));
		throw error(429, NETWORK_BUDGET_EXHAUSTED_MESSAGE);
	}
	return budget;
}

/**
 * Judge a destination within the daily model-call budget (budget.ts, counted
 * in D1). Every model call reserves, in order, one unit of the network's
 * share, one unit of its IPv6 /48's share (IPv6 only), then one unit of the
 * global count. When a later step refuses, every unit taken by an earlier
 * step is given back, on the day it was taken. Nothing else is refunded: a
 * unit is taken only for a call that is about to run.
 *
 * Global limit reached: refused with 503, logged as link_gate_budget_exhausted,
 * for every creator (Tanner's decision, 2026-11-13). A network's or /48's
 * share used up: refused with 429, logged as link_gate_network_budget_exhausted
 * (reason network_daily_model_cap or block_daily_model_cap).
 */
export async function judgeWithinBudget(
	platform: App.Platform | undefined,
	url: string,
	deps: GateDeps,
	budget: ModelBudget = {}
): Promise<GateDecision> {
	const db = platform?.env?.DB;
	const cap = dailyCap(platform?.env?.LINK_GATE_DAILY_MODEL_CALLS);
	const shares = sharesFor(platform, budget);
	// Cheap early refusal, before fetching anything. Without a model there is
	// nothing to count: the gate allows unchecked and logs it.
	if (deps.ai) {
		const used = await readUsage(db);
		if (used !== null && used >= cap) return budgetExhausted(url);
		const full = await exhaustedShare(db, shares);
		if (full) return budgetExhausted(url, full.scope);
	}
	const ai = deps.ai && {
		run: async (model: string, input: unknown) => {
			const taken: Array<[Share, NetworkReservation]> = [];
			const giveBack = async () => {
				for (const [share, reservation] of taken) await refundNetworkCall(db, share.id, reservation);
			};
			for (const share of shares) {
				const reservation = await reserveNetworkCall(db, share.id, share.cap);
				if (!reservation.ok) {
					await giveBack();
					throw new BudgetExhaustedError(share.scope);
				}
				taken.push([share, reservation]);
			}
			if (!(await reserveCall(db, cap))) {
				await giveBack();
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
