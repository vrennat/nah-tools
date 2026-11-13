/**
 * Static rules for where a go.nah.tools redirect may point.
 *
 * These run before the D1 blocklist lookup and need no I/O, so they are
 * cheap to apply on every create and update.
 */

export const MAX_DESTINATION_LENGTH = 2048;

/** Real hostnames rarely exceed a handful of labels; the cap also bounds the blocklist query. */
export const MAX_HOST_LABELS = 20;

/** Hosts that serve nah.tools itself. A redirect to them is a loop or a disguise. */
const SELF_DOMAINS = ['nah.tools'];

/** Other link shorteners. Chaining through them hides the real destination. */
export const SHORTENER_DOMAINS = [
	'bit.ly',
	'bitly.com',
	'tinyurl.com',
	't.co',
	'goo.gl',
	'ow.ly',
	'is.gd',
	'v.gd',
	'buff.ly',
	'rebrand.ly',
	'short.io',
	'cutt.ly',
	'rb.gy',
	's.id',
	't.ly',
	'tiny.cc',
	'shorturl.at',
	'bl.ink',
	'lnkd.in',
	'qrco.de',
	'shorturl.gg',
	'urlz.fr',
	'clck.ru'
];

/**
 * Registrable domains seen hosting the November 2026 redirect-rotator campaign
 * on go.nah.tools (29 .com domains registered within five seconds on
 * 2026-08-14, one more on 2026-11-08) and a casino phishing host. Subdomains
 * are blocked too. Add new domains to the D1 `blocked_domains` table instead
 * of here; this list exists so the block holds without a database write.
 */
export const SEED_BLOCKED_DOMAINS = [
	'bgp09.icu',
	'ccbtspx.com',
	'dgjetnv.com',
	'dsdckkf.com',
	'ebnccxh.com',
	'eikvptb.com',
	'frywxfu.com',
	'fvvxctw.com',
	'hsbpqwj.com',
	'ivwanbx.com',
	'jehenmy.com',
	'jgoelmi.com',
	'klveggf.com',
	'lsppreo.com',
	'mgyrfjr.com',
	'mitrpmd.com',
	'mwampdk.com',
	'nbmgpmx.com',
	'nbycfou.com',
	'npqymns.com',
	'omaehhm.com',
	'onmtonj.com',
	'pqqolce.com',
	'qixeddf.com',
	'qokhimt.com',
	'sccjlej.com',
	'upofrnh.com',
	'vxokzce.com',
	'wkhycsy.com',
	'wlkybdd.com',
	'wvttzqr.com',
	'xdvqnxj.com',
	'xlsntlg.com',
	'ymzbwb.com'
];

/**
 * Path prefixes used by that campaign. Its domains rotate faster than a
 * blocklist can follow, but every link used the same landing path.
 */
const BLOCKED_PATH_PREFIXES = ['/wqamhcsom'];

/** Known bad TLDs commonly used in phishing (free-registration ccTLDs). */
const BAD_TLDS = ['tk', 'ml', 'ga', 'cf', 'gq'];

const LABEL_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
const TLD_RE = /^([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;

export type PolicyResult = { ok: true } | { ok: false; reason: string };

/** The hostname and each parent domain, most specific first: a.b.com -> [a.b.com, b.com, com]. */
export function domainAndParents(hostname: string): string[] {
	const labels = hostname.split('.');
	return labels.map((_, i) => labels.slice(i).join('.'));
}

function matchesDomainList(hostname: string, list: readonly string[]): boolean {
	return domainAndParents(hostname).some((d) => list.includes(d));
}

/**
 * Check a destination URL against the static policy.
 * `forRedirect` adds the rules that only matter for go.nah.tools redirects
 * (no links back to nah.tools); bio page links may point at nah.tools.
 */
export function checkDestination(url: string, opts: { forRedirect: boolean }): PolicyResult {
	if (url.length > MAX_DESTINATION_LENGTH) {
		return { ok: false, reason: `URL must be ${MAX_DESTINATION_LENGTH} characters or fewer.` };
	}

	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return { ok: false, reason: 'Invalid URL format.' };
	}

	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		return { ok: false, reason: 'Invalid URL. Must be a valid http or https URL.' };
	}
	if (parsed.username || parsed.password) {
		return { ok: false, reason: 'URLs with embedded credentials are not allowed.' };
	}

	// The URL parser lowercases, punycodes, and turns numeric IPv4 forms
	// (http://2130706433, http://0x7f.1) into dotted decimal.
	const hostname = parsed.hostname.replace(/\.$/, '');

	if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
		return { ok: false, reason: 'IP addresses are not allowed as destinations.' };
	}
	if (hostname.startsWith('[')) {
		return { ok: false, reason: 'IPv6 addresses are not allowed as destinations.' };
	}
	if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
		return { ok: false, reason: 'localhost is not allowed as a destination.' };
	}

	const labels = hostname.split('.');
	const tld = labels[labels.length - 1];
	if (
		hostname.length > 253 ||
		labels.length < 2 ||
		labels.length > MAX_HOST_LABELS ||
		!labels.every((l) => LABEL_RE.test(l)) ||
		!TLD_RE.test(tld)
	) {
		return { ok: false, reason: 'The destination must use a valid public domain name.' };
	}

	if (BAD_TLDS.includes(tld)) {
		return { ok: false, reason: `URLs with .${tld} domains are not allowed.` };
	}
	if (opts.forRedirect && matchesDomainList(hostname, SELF_DOMAINS)) {
		return { ok: false, reason: 'Short links cannot point to nah.tools.' };
	}
	if (matchesDomainList(hostname, SHORTENER_DOMAINS)) {
		return { ok: false, reason: 'Redirect chains through other URL shorteners are not allowed.' };
	}
	if (matchesDomainList(hostname, SEED_BLOCKED_DOMAINS)) {
		return { ok: false, reason: 'This domain has been blocked.' };
	}
	const path = parsed.pathname.toLowerCase();
	if (BLOCKED_PATH_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) {
		return { ok: false, reason: 'This destination has been blocked.' };
	}

	return { ok: true };
}
