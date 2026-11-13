/**
 * Turn the redirect chain and Clef's answers into allow, hold or block.
 *
 * Thresholds come from the 2026-11-13 evaluation (OpenPhish feed vs 108 public
 * sites, see the pull request): with these values no clean link was held or
 * blocked, and 48 of 57 live phishing pages were caught. Change them only
 * with a new evaluation.
 */
import type { ChainResult } from './fetch-chain';
import type { PageSummary } from './extract';
import type { ClefAnswers } from './questions';

export type Verdict = 'allow' | 'hold' | 'block';

/** Stored in redirects.hold_reason. */
export type HoldReason = 'suspicious' | 'redirect-limit' | 'unchecked';

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
	return null;
}

export function decideFromAnswers(answers: ClefAnswers): GateDecision {
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
	return { verdict: 'allow' };
}
