/**
 * Spam gate for go.nah.tools destinations.
 *
 * Runs after the static policy and rate limits, before a link is stored or
 * re-pointed. Follows the redirect chain, reads the final page and asks the
 * Clef decision model about it.
 *
 * Only a block stops a link. If the check cannot finish (fetch failure or
 * timeout, model missing, failing or timing out), the link is allowed and the
 * decision is logged as link_gate_allow_unchecked so outages are countable
 * (decision by the conductor session under Tanner's delegation, 2026-11-13:
 * there is no way to review or release a held link, so holding would leave
 * clean links dead).
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
import { decideFromAnswers, decideFromChain, uncheckedAllow, worst, type GateDecision } from './decide';

export type { GateDecision, GateLog } from './decide';

export const CLEF_TIMEOUT_MS = 4000;

/** The slice of the Workers AI binding the gate uses. */
export interface AiRunner {
	run(model: string, input: unknown): Promise<unknown>;
}

export interface GateDeps {
	ai: AiRunner | undefined;
	/** D1 blocklist check for hops after the first; returns a reason or null. */
	checkHop?: (url: string) => Promise<string | null>;
	/** Why ai is missing, when it was withheld on purpose (the daily budget). */
	noAiReason?: string;
	fetchImpl?: typeof fetch;
	/** Total time budget for the redirect chain; defaults to TOTAL_TIMEOUT_MS. */
	fetchTimeoutMs?: number;
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
		chain = await followChain(url, {
			fetchImpl: deps.fetchImpl,
			checkHop: deps.checkHop,
			timeoutMs: deps.fetchTimeoutMs
		});
	} catch {
		// followChain does not throw by design; a throw here is a bug or a failed blocklist lookup.
		return uncheckedAllow({ outcome: 'fetch-failed', hops: [], finalUrl: url }, 'chain_check_error');
	}
	const page: PageSummary | null =
		chain.outcome === 'page' && chain.body ? summarizePage(chain.body, chain.finalUrl) : null;

	const early = decideFromChain(chain, page);
	if (early) return early;

	if (!deps.ai) return uncheckedAllow(chain, deps.noAiReason ?? 'ai_binding_missing');
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
		return decisions.reduce(worst);
	} catch (e) {
		const reason =
			e instanceof Error && e.message.startsWith('timed out')
				? 'model_timeout'
				: e instanceof Error && e.message.startsWith('Clef ')
					? 'model_malformed_answer'
					: 'model_error';
		return uncheckedAllow(chain, reason);
	}
}
