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
import { decideFromAnswers, decideFromChain, type GateDecision } from './decide';

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
	try {
		const raw = await withTimeout(
			deps.ai.run(CLEF_MODEL_ID, {
				model: CLEF_MODEL,
				state: buildState(chain, page),
				questions: buildQuestions()
			}),
			deps.clefTimeoutMs ?? CLEF_TIMEOUT_MS
		);
		return decideFromAnswers(parseClefResponse(raw));
	} catch (e) {
		console.error('link gate: Clef call failed', e);
		return { verdict: 'hold', holdReason: 'unchecked', detail: 'model unavailable' };
	}
}
