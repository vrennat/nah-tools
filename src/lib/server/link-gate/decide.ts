/**
 * Turn the redirect chain and Clef's answers into allow or block.
 *
 * Only a block stops a link. There is no hold state: nothing could review or
 * release a held link, so every weaker signal is allowed and logged with its
 * own event name instead, to be counted later (decision by the conductor
 * session under Tanner's delegation, 2026-11-13).
 *
 * The block thresholds come from a 2026-11-13 evaluation against the
 * OpenPhish feed and a hand-picked set of public sites; see
 * scripts/link-gate-eval/ (the clean list is committed with a tune/held-out
 * split, phishing URLs are not). They were tuned on all of that data, so
 * change them only with a new evaluation on the tune split.
 */
import { isLoaderPage, isTextual, type ChainResult } from './fetch-chain';
import type { PageSummary } from './extract';
import type { ClefAnswers, NoulId } from './questions';

export type GateEvent =
	| 'link_gate_block'
	| 'link_gate_block_download'
	| 'link_gate_allow_suspicious'
	| 'link_gate_allow_unreadable'
	| 'link_gate_allow_download'
	| 'link_gate_allow_unchecked'
	| 'link_gate_budget_exhausted';

/** One structured log line. Host and status only: never a path, query or user data. */
export interface GateLog {
	event: GateEvent;
	/** Fixed reason code. */
	reason: string;
	host: string;
	status?: number;
	scores?: Partial<Record<NoulId, number>>;
}

export type GateDecision =
	| { verdict: 'allow'; log?: GateLog }
	| {
			verdict: 'block';
			message: string;
			log: GateLog;
			/** HTTP status for the refusal; 400 when absent. 503 when the daily budget is used up. */
			httpStatus?: number;
	  };

/** Block when the model is this sure the page is a scam... */
export const BLOCK_SCAM_MIN = 0.8;
/** ...and names at least one concrete scam trait with this probability. */
export const BLOCK_SIGNAL_MIN = 0.5;
/** Log as suspicious (still allowed) at this scam probability. */
export const SUSPICIOUS_SCAM_MIN = 0.5;
/** At or above this, the model says the page was empty or refused the fetch. */
export const UNREADABLE_MIN = 0.5;
/**
 * How sure the model must be that a blank page redirects for the
 * unfollowed-redirect log. JavaScript-rendered apps (YouTube, Google sign-in)
 * look the same to the checker, so this is only logged.
 */
export const UNFOLLOWED_REDIRECT_MIN = 0.8;

const REPORT_HINT = 'If you think this is wrong, report it at https://github.com/vrennat/nah-tools/issues.';

export const MESSAGES = {
	scam: `This destination looks like phishing or a scam, so no short link was created. ${REPORT_HINT}`,
	cloudflareWarning: `Cloudflare has flagged this destination as phishing or malware, so no short link was created. ${REPORT_HINT}`,
	redirectLimit:
		'This link redirects more than 5 times, so it could not be checked. Link to the final page instead.',
	download:
		'Short links to app installers and executable files are not allowed. Link to the page that offers the download instead.',
	unreadableAfterRedirect:
		'This link redirects to another site that could not be checked. Link to the final page directly instead.',
	hopPolicy: (reason: string) =>
		`This link redirects to a destination that is not allowed: ${reason} Link to the final page directly if it is allowed.`
} as const;

/**
 * Cloudflare's own warning page for hosts it has flagged as phishing or
 * malware. A site could fake this title, but only to get itself blocked.
 */
const CLOUDFLARE_WARNING_RE = /^Suspected (Phishing|Malware) \| Cloudflare$/;

/**
 * File types that install or run code. A short link to one is blocked.
 * (`.com` is left out: a URL path often ends in a domain name.)
 */
const EXECUTABLE_EXT_RE =
	/\.(apk|xapk|aab|exe|msi|msix|msixbundle|appx|appxbundle|dmg|pkg|mpkg|scr|bat|cmd|ps1|vbs|vbe|jse|wsf|hta|jar|xpi|deb|rpm|run|command|ipa)$/i;
/** ZIP-based app packages: a PK signature with one of these names is an installer. */
const ZIP_PACKAGE_EXT_RE = /\.(apk|xapk|aab|jar|xpi|ipa|appx|appxbundle|msix|msixbundle)$/i;
const EXECUTABLE_TYPE_RE =
	/^application\/(vnd\.android\.package-archive|x-msdownload|x-ms-installer|x-msi|x-msdos-program|x-dosexec|x-apple-diskimage|x-newton-compatible-pkg|java-archive|x-java-archive|vnd\.microsoft\.portable-executable|x-sh|x-executable|x-debian-package|x-rpm|x-ms-application|vnd\.ms-appx)\b/i;

function hostOf(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return '';
	}
}

function bareHost(url: string): string {
	return hostOf(url).replace(/^www\./, '') || url;
}

/** True when the chain moved to another host, the pattern of a throwaway redirector. */
export function crossesHosts(chain: ChainResult): boolean {
	return new Set(chain.hops.map((h) => bareHost(h.url)).concat(bareHost(chain.finalUrl))).size > 1;
}

function log(event: GateEvent, reason: string, chain: ChainResult, scores?: GateLog['scores']): GateLog {
	return { event, reason, host: hostOf(chain.finalUrl), status: chain.status, ...(scores ? { scores } : {}) };
}

/** The file name a download would be saved as, from Content-Disposition or the URL path. */
export function downloadName(chain: ChainResult): string {
	const cd = chain.contentDisposition ?? '';
	const star = /filename\*\s*=\s*[^']*'[^']*'([^;]+)/i.exec(cd);
	const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(cd);
	let name = star ? star[1] : plain ? plain[1] : '';
	if (!name) {
		try {
			name = new URL(chain.finalUrl).pathname.split('/').pop() ?? '';
		} catch {
			name = '';
		}
	}
	try {
		name = decodeURIComponent(name);
	} catch {
		// Keep the raw name.
	}
	return name.trim();
}

function startsWith(prefix: Uint8Array | undefined, sig: number[]): boolean {
	return !!prefix && prefix.length >= sig.length && sig.every((b, i) => prefix[i] === b);
}

/**
 * An installer or executable, by content type, by the file name in the URL
 * path or Content-Disposition (whatever the content type, which may be
 * missing or wrong), or by the first bytes: MZ (Windows), ELF, Mach-O, xar
 * (macOS .pkg), or a ZIP named as an app package. DMG images carry their
 * signature at the end of the file, so they are recognised by name and type only.
 */
export function isExecutableDownload(chain: ChainResult): boolean {
	if (chain.outcome !== 'page') return false;
	const name = downloadName(chain);
	let pathName = '';
	try {
		pathName = decodeURIComponent(new URL(chain.finalUrl).pathname);
	} catch {
		// Keep empty.
	}
	if (EXECUTABLE_TYPE_RE.test(chain.contentType ?? '')) return true;
	if (EXECUTABLE_EXT_RE.test(name) || EXECUTABLE_EXT_RE.test(pathName)) return true;
	const p = chain.prefix;
	if (
		startsWith(p, [0x4d, 0x5a]) || // MZ
		startsWith(p, [0x7f, 0x45, 0x4c, 0x46]) || // ELF
		startsWith(p, [0xfe, 0xed, 0xfa, 0xce]) ||
		startsWith(p, [0xfe, 0xed, 0xfa, 0xcf]) ||
		startsWith(p, [0xce, 0xfa, 0xed, 0xfe]) ||
		startsWith(p, [0xcf, 0xfa, 0xed, 0xfe]) || // Mach-O
		startsWith(p, [0x78, 0x61, 0x72, 0x21]) // xar!
	) {
		return true;
	}
	return startsWith(p, [0x50, 0x4b, 0x03, 0x04]) && (ZIP_PACKAGE_EXT_RE.test(name) || ZIP_PACKAGE_EXT_RE.test(pathName));
}

/** The destination did not answer usefully: no page body, or an error status. Downloads are not refusals. */
function refused(chain: ChainResult): boolean {
	if (chain.outcome !== 'page') return false;
	if ((chain.status ?? 0) >= 400) return true;
	return isTextual(chain.contentType) && !chain.body;
}

/**
 * A timeout, network error or refusal after a redirect to another host is
 * blocked: that is how a throwaway redirector hides its final page (decision
 * by the conductor session under Tanner's delegation, 2026-11-13). On the
 * first URL, or after only same-host redirects (http to https, www, a
 * trailing slash), it is allowed and logged instead, because large sites
 * often refuse or stall automated fetches.
 */
function failedAfterCrossHostRedirect(chain: ChainResult): boolean {
	return (chain.outcome === 'fetch-failed' || refused(chain)) && crossesHosts(chain);
}

/** Decisions that need no model call. Returns null when the model must judge. */
export function decideFromChain(chain: ChainResult, page: PageSummary | null): GateDecision | null {
	if (chain.outcome === 'policy-blocked') {
		return {
			verdict: 'block',
			message: MESSAGES.hopPolicy(chain.reason ?? ''),
			log: log('link_gate_block', 'hop_policy', chain)
		};
	}
	if (page && CLOUDFLARE_WARNING_RE.test(page.title)) {
		return {
			verdict: 'block',
			message: MESSAGES.cloudflareWarning,
			log: log('link_gate_block', 'cloudflare_warning', chain)
		};
	}
	if (chain.outcome === 'too-many-hops') {
		return { verdict: 'block', message: MESSAGES.redirectLimit, log: log('link_gate_block', 'redirect_limit', chain) };
	}
	if (failedAfterCrossHostRedirect(chain)) {
		return {
			verdict: 'block',
			message: MESSAGES.unreadableAfterRedirect,
			log: log('link_gate_block', chain.outcome === 'fetch-failed' ? `redirected_${chain.reason}` : 'redirected_refused', chain)
		};
	}
	if (isExecutableDownload(chain)) {
		return {
			verdict: 'block',
			message: MESSAGES.download,
			log: log('link_gate_block_download', 'executable_download', chain)
		};
	}
	return null;
}

/**
 * The check could not finish (fetch failed or timed out, model missing,
 * failed or timed out): allowed and logged under its own event so outages are
 * countable. Same policy as a site that refuses the checker.
 */
export function uncheckedAllow(chain: ChainResult, reason: string): GateDecision {
	return { verdict: 'allow', log: log('link_gate_allow_unchecked', reason, chain) };
}

function scoresOf(n: Record<NoulId, number>, ids: readonly NoulId[]): Partial<Record<NoulId, number>> {
	return Object.fromEntries(ids.map((id) => [id, Math.round(n[id] * 100) / 100]));
}

/**
 * @param chain The chain up to and including the page the answers are about
 *   (for a page the chain passed through, the chain is cut at that page).
 */
export function decideFromAnswers(answers: ClefAnswers, chain: ChainResult): GateDecision {
	const n = answers.nouls;
	const signals = (['impersonation', 'urgency', 'payment', 'fake_captcha', 'crypto'] as const).filter(
		(id) => n[id] >= BLOCK_SIGNAL_MIN
	);
	if (n.scam >= BLOCK_SCAM_MIN && signals.length > 0) {
		return {
			verdict: 'block',
			message: MESSAGES.scam,
			log: log('link_gate_block', 'model_scam', chain, scoresOf(n, ['scam', ...signals]))
		};
	}

	// A page the model calls empty is excused from the scam score only if it
	// really has nothing on it: no fields and little visible text. Otherwise
	// attacker text could raise "empty" to hide a login form.
	const blank = !chain.body || isLoaderPage(chain.body);
	const excusedAsEmpty = n.empty >= UNREADABLE_MIN && blank;

	if (n.scam >= SUSPICIOUS_SCAM_MIN && !excusedAsEmpty) {
		return {
			verdict: 'allow',
			log: log('link_gate_allow_suspicious', 'model_suspicious', chain, scoresOf(n, ['scam', 'login', 'impersonation']))
		};
	}
	// A blank 2xx page the model calls a redirect: the redirect may be hidden from the scanner.
	if (
		chain.status !== undefined &&
		chain.status >= 200 &&
		chain.status < 300 &&
		chain.body !== undefined &&
		isLoaderPage(chain.body) &&
		n.redirector >= UNFOLLOWED_REDIRECT_MIN
	) {
		return {
			verdict: 'allow',
			log: log('link_gate_allow_suspicious', 'unfollowed_redirect', chain, scoresOf(n, ['redirector', 'scam']))
		};
	}
	if (chain.outcome === 'page' && !isTextual(chain.contentType)) {
		return { verdict: 'allow', log: log('link_gate_allow_download', 'file_download', chain) };
	}
	if (chain.outcome === 'fetch-failed') {
		return uncheckedAllow(chain, chain.reason ?? 'fetch_failed');
	}
	// Known gap: a destination that refuses or blanks the checker is judged on the URL alone.
	const readable = chain.outcome === 'page' && !!chain.body && (chain.status ?? 0) < 400;
	if (!readable || excusedAsEmpty) {
		// A refusal after a cross-host redirect was blocked earlier; what reaches
		// here after one is a readable but blank page (a JavaScript app).
		const reason = crossesHosts(chain) ? 'redirected_blank' : 'unreadable_first_url';
		return { verdict: 'allow', log: log('link_gate_allow_unreadable', reason, chain) };
	}
	return { verdict: 'allow' };
}

/**
 * Severity for combining the verdicts of several pages in one chain: block,
 * then a suspicious allow, then any other logged allow, then a plain allow.
 */
function rank(d: GateDecision): number {
	if (d.verdict === 'block') return 3;
	if (d.log?.event === 'link_gate_allow_suspicious') return 2;
	return d.log ? 1 : 0;
}

/** The more severe of two decisions; the first wins a tie. */
export function worst(a: GateDecision, b: GateDecision): GateDecision {
	return rank(b) > rank(a) ? b : a;
}
