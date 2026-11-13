/**
 * Turn the redirect chain and Clef's answers into allow, hold or block.
 *
 * Thresholds come from the 2026-11-13 evaluation (130 URLs from the OpenPhish
 * feed vs 108 public sites, see the pull request). End to end, no clean link
 * was blocked and 4 were held (2 fetch timeouts, 2 redirects to unreadable
 * pages); 113 of the 130 feed URLs were blocked or held. Change the
 * thresholds only with a new evaluation.
 */
import type { ChainResult } from './fetch-chain';
import type { PageSummary } from './extract';
import type { ClefAnswers } from './questions';

export type Verdict = 'allow' | 'hold' | 'block';

/** Stored in redirects.hold_reason. */
export type HoldReason = 'suspicious' | 'redirect-limit' | 'unchecked' | 'unreadable';

/** Holds that a background recheck may release: the check itself failed, not the destination. */
export const RECHECKABLE_HOLDS: readonly HoldReason[] = ['unchecked', 'unreadable'];

export type GateDecision =
	| { verdict: 'allow' }
	| { verdict: 'hold'; holdReason: HoldReason; detail: string }
	| { verdict: 'block'; reason: string };

/** Block when the model is this sure the page is a scam... */
export const BLOCK_SCAM_MIN = 0.8;
/** ...and names at least one concrete scam trait with this probability. */
export const BLOCK_SIGNAL_MIN = 0.5;
/** Hold for review at this scam probability, unless the page was unreadable. */
export const HOLD_SCAM_MIN = 0.5;
/** Above this, the model says the page was empty or refused the fetch; scam alone then holds nothing. */
export const UNREADABLE_MIN = 0.5;

/**
 * Cloudflare's own warning page for hosts it has flagged as phishing or
 * malware. A site could fake this title, but only to get itself blocked.
 */
const CLOUDFLARE_WARNING_RE = /^Suspected (Phishing|Malware) \| Cloudflare$/;

function host(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
}

/** True when the chain moved to another host, the pattern of a throwaway redirector. */
export function crossesHosts(chain: ChainResult): boolean {
	return new Set(chain.hops.map((h) => host(h.url)).concat(host(chain.finalUrl))).size > 1;
}

/**
 * Unreadable pages. A destination that refuses or stalls the checker could be
 * hiding its real page (cloaking), but many large legitimate sites also
 * refuse automated fetches. In the evaluation, holding every unreadable page
 * would have held 12 of 108 clean links. So only these are held:
 * - the fetch failed (timeout, network error, non-standard port);
 * - the chain redirected to another host and the final page was not readable.
 * A site that refuses the checker on its own first URL is still judged by the
 * model on the URL alone; that cloaking gap is known.
 */
function unreadableHold(chain: ChainResult): GateDecision | null {
	if (chain.outcome === 'fetch-failed') {
		return { verdict: 'hold', holdReason: 'unreadable', detail: chain.reason ?? 'fetch failed' };
	}
	const unreadPage = chain.outcome === 'page' && ((chain.status ?? 0) >= 400 || !chain.body);
	if (unreadPage && crossesHosts(chain)) {
		return { verdict: 'hold', holdReason: 'unreadable', detail: `redirected, final status ${chain.status}` };
	}
	return null;
}

/** Decisions that need no model call. Returns null when the model must judge. */
export function decideFromChain(chain: ChainResult, page: PageSummary | null): GateDecision | null {
	if (chain.outcome === 'policy-blocked') {
		return { verdict: 'block', reason: `The link redirects to a destination that is not allowed: ${chain.reason}` };
	}
	if (page && CLOUDFLARE_WARNING_RE.test(page.title)) {
		return { verdict: 'block', reason: 'The destination has been flagged as phishing or malware.' };
	}
	if (chain.outcome === 'too-many-hops') {
		return { verdict: 'hold', holdReason: 'redirect-limit', detail: chain.reason ?? 'too many redirects' };
	}
	return unreadableHold(chain);
}

export function decideFromAnswers(answers: ClefAnswers, chain?: ChainResult): GateDecision {
	const n = answers.nouls;
	const signals = (['impersonation', 'urgency', 'payment', 'fake_captcha', 'crypto'] as const).filter(
		(id) => n[id] >= BLOCK_SIGNAL_MIN
	);
	if (n.scam >= BLOCK_SCAM_MIN && signals.length > 0) {
		return {
			verdict: 'block',
			reason: 'This destination looks like phishing or a scam, so a short link was not created.'
		};
	}
	if (n.scam >= HOLD_SCAM_MIN && n.empty < UNREADABLE_MIN) {
		return { verdict: 'hold', holdReason: 'suspicious', detail: `scam=${n.scam.toFixed(2)}` };
	}
	// A redirect to another host that lands on a page the model calls empty or blocked.
	if (chain && n.empty >= UNREADABLE_MIN && crossesHosts(chain)) {
		return { verdict: 'hold', holdReason: 'unreadable', detail: `redirected, empty=${n.empty.toFixed(2)}` };
	}
	return { verdict: 'allow' };
}
