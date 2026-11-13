/**
 * Reduce a fetched HTML page to what the decision model needs: title, visible
 * text, forms and their input kinds, and scripts that look like redirects or
 * downloads. Regex-based on purpose: it runs in the Worker and in tests
 * without a DOM, and an adversary gains nothing by confusing it that they
 * could not gain by serving a different page.
 */

export const MAX_TEXT_CHARS = 6000;

export interface PageSummary {
	title: string;
	text: string;
	/** One line per form: action host and the input types/names it asks for. */
	forms: string[];
	/** Links whose target looks like an installable file. */
	downloads: string[];
	/** Count of <script> tags and whether any references eval/atob-style obfuscation. */
	scripts: { count: number; obfuscated: boolean };
}

const ENTITY_MAP: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' '
};

function decode(s: string): string {
	return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
		if (e[0] === '#') {
			const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
			return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
		}
		return ENTITY_MAP[e.toLowerCase()] ?? m;
	});
}

function squash(s: string): string {
	return s.replace(/\s+/g, ' ').trim();
}

function attr(tag: string, name: string): string {
	const m = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
	return m ? decode(m[1] ?? m[2] ?? m[3] ?? '') : '';
}

const DOWNLOAD_RE = /\.(apk|exe|msi|dmg|pkg|scr|bat|cmd|ps1|vbs|jar|appx|msix|iso|zip|rar)(?:[?#]|$)/i;

export function summarizePage(html: string, pageUrl: string): PageSummary {
	const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
	const title = titleMatch ? squash(decode(titleMatch[1])).slice(0, 200) : '';

	const scriptTags = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
	const obfuscated = scriptTags.some((s) =>
		/\beval\s*\(|\batob\s*\(|String\.fromCharCode|unescape\s*\(|\\x[0-9a-f]{2}\\x[0-9a-f]{2}\\x/i.test(s[1])
	);

	const forms: string[] = [];
	for (const f of html.matchAll(/<form\b([^>]*)>([\s\S]*?)(?:<\/form>|$)/gi)) {
		if (forms.length >= 5) break;
		let action = attr(f[1], 'action');
		try {
			action = action ? new URL(action, pageUrl).host : 'same page';
		} catch {
			action = 'unparseable';
		}
		const inputs = [...f[2].matchAll(/<(input|select|textarea)\b([^>]*)>/gi)]
			.map((i) => {
				const type = i[1].toLowerCase() === 'input' ? attr(i[2], 'type').toLowerCase() || 'text' : i[1].toLowerCase();
				if (type === 'hidden' || type === 'submit' || type === 'button') return '';
				const label = attr(i[2], 'name') || attr(i[2], 'placeholder') || attr(i[2], 'autocomplete') || attr(i[2], 'id');
				return `${type}${label ? `:${label.slice(0, 30)}` : ''}`;
			})
			.filter(Boolean)
			.slice(0, 10);
		forms.push(`form to ${action}: ${inputs.join(', ') || 'no visible inputs'}`);
	}
	// Inputs outside any form still matter (JS-submitted login boxes).
	if (forms.length === 0) {
		const loose = [...html.matchAll(/<input\b([^>]*)>/gi)]
			.map((i) => attr(i[1], 'type').toLowerCase())
			.filter((t) => t === 'password' || t === 'email' || t === 'tel');
		if (loose.length) forms.push(`inputs outside a form: ${[...new Set(loose)].join(', ')}`);
	}

	const downloads = [
		...new Set(
			[...html.matchAll(/<a\b([^>]*)>/gi)]
				.map((a) => attr(a[1], 'href'))
				.filter((h) => DOWNLOAD_RE.test(h) || /\bdownload\b/i.test(h))
				.map((h) => h.slice(0, 120))
		)
	].slice(0, 5);

	const text = squash(
		decode(
			html
				.replace(/<!--[\s\S]*?-->/g, ' ')
				.replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
				.replace(/<(br|p|div|li|h[1-6]|tr|section|article|button|a)\b[^>]*>/gi, ' ')
				.replace(/<[^>]+>/g, ' ')
		)
	).slice(0, MAX_TEXT_CHARS);

	return { title, text, forms, downloads, scripts: { count: scriptTags.length, obfuscated } };
}
