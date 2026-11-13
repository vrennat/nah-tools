/**
 * Spam gate for go.nah.tools destinations.
 *
 * Runs after the static policy and rate limits, before a link is stored or
 * re-pointed. Follows the redirect chain, reads the final page and asks the
 * Clef decision model about it.
 *
 * Failure direction: if the model is missing, errors or times out, the link
 * is held (stored inactive with hold_reason 'unchecked') and rechecked in the
 * background. The gate never fails open.
 */
import { followChain, type ChainResult } from './fetch-chain';
import { summarizePage, type PageSummary } from './extract';
import {
	CLEF_MODEL,
	CLEF_MODEL_ID,
	buildQuestions,
	buildState,
	parseClefResponse
} from './questions';
import { decideFromAnswers, decideFromChain, worst, type GateDecision } from './decide';

export type { GateDecision, HoldReason } from './decide';

export const CLEF_TIMEOUT_MS = 4000;

/** The slice of the Workers AI binding the gate uses. */
export interface AiRunner {
	run(model: string, input: unknown): Promise<unknown>;
}

export interface GateDeps {
	ai: AiRunner | undefined;
	/** D1 blocklist check for hops after the first; returns a reason or null. */
	checkHop?: (url: string) => Promise<string | null>;
	fetchImpl?: typeof fetch;
	clefTimeoutMs?: number;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
	return new Promise((resolve, reject) => {
		const t = setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms);
		p.then(
			(v) => {
				clearTimeout(t);
				resolve(v);
			},
			(e) => {
				clearTimeout(t);
				reject(e);
			}
		);
	});
}

/**
 * Known gap, kept on purpose (decision by the conductor session under
 * Tanner's delegation, 2026-11-13): a destination that refuses the checker
 * on its own URL (a 4xx/5xx or empty body, no redirect) is judged on the URL
 * alone and usually allowed, because holding these held 12 of 108 clean
 * links in the evaluation and holds cannot be released. This line makes the
 * gap countable: one JSON line per such allow, with no user data.
 */
function logUnreadableAllow(chain: ChainResult, decision: GateDecision): void {
	if (decision.verdict !== 'allow' || chain.outcome !== 'page') return;
	if ((chain.status ?? 0) < 400 && chain.body) return;
	let host = '';
	try {
		host = new URL(chain.finalUrl).hostname;
	} catch {
		// finalUrl was validated before fetching; leave host empty if not.
	}
	console.info(
		JSON.stringify({ event: 'link_gate_allow_unreadable', reason: 'unreadable_first_url', host, status: chain.status })
	);
}

export async function judgeDestination(url: string, deps: GateDeps): Promise<GateDecision> {
	let chain: ChainResult;
	try {
		chain = await followChain(url, { fetchImpl: deps.fetchImpl, checkHop: deps.checkHop });
	} catch (e) {
		// followChain does not throw by design; a throw here is a bug or a failed blocklist lookup.
		console.error('link gate: chain check failed', e);
		return { verdict: 'hold', holdReason: 'unchecked', detail: 'chain check failed' };
	}
	const page: PageSummary | null =
		chain.outcome === 'page' && chain.body ? summarizePage(chain.body, chain.finalUrl) : null;

	const early = decideFromChain(chain, page);
	if (early) return early;

	if (!deps.ai) {
		return { verdict: 'hold', holdReason: 'unchecked', detail: 'AI binding missing' };
	}
	const ai = deps.ai;
	const timeoutMs = deps.clefTimeoutMs ?? CLEF_TIMEOUT_MS;

	// Judge the final page, and also every page the chain read and then left
	// by a client-side redirect: a decoy redirect must not hide the page a
	// visitor actually sees. The worst verdict wins.
	const views: { chain: ChainResult; page: PageSummary | null }[] = [{ chain, page }];
	chain.hops.forEach((hop, i) => {
		if (hop.body === undefined) return;
		const sub: ChainResult = {
			outcome: 'page',
			hops: chain.hops.slice(0, i + 1).map((h, j) => (j === i ? { url: h.url, status: h.status } : h)),
			finalUrl: hop.url,
			status: hop.status,
			contentType: hop.contentType,
			body: hop.body
		};
		views.push({ chain: sub, page: hop.body ? summarizePage(hop.body, hop.url) : null });
	});

	try {
		const decisions = await Promise.all(
			views.map(async (v) => {
				const raw = await withTimeout(
					ai.run(CLEF_MODEL_ID, {
						model: CLEF_MODEL,
						state: buildState(v.chain, v.page),
						questions: buildQuestions()
					}),
					timeoutMs
				);
				return decideFromAnswers(parseClefResponse(raw), v.chain);
			})
		);
		const result = decisions.reduce(worst);
		logUnreadableAllow(chain, result);
		return result;
	} catch (e) {
		console.error('link gate: Clef call failed', e);
		return { verdict: 'hold', holdReason: 'unchecked', detail: 'model unavailable' };
	}
}
