/**
 * Reduce a fetched HTML page to what the decision model needs: title, visible
 * text, forms and their input kinds, download links, and whether scripts look
 * obfuscated. Uses the linear-time scanners in html-scan.ts because the page
 * is written by whoever controls the destination.
 */
import { attr, decodeEntities, elementContents, openingTags, visibleText } from './html-scan';

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

const DOWNLOAD_RE = /\.(apk|exe|msi|dmg|pkg|scr|bat|cmd|ps1|vbs|jar|appx|msix|iso|zip|rar)(?:[?#]|$)/i;
const OBFUSCATION_RE = /\beval\s*\(|\batob\s*\(|String\.fromCharCode|unescape\s*\(|(?:\\x[0-9a-f]{2}){3}/i;

function squash(s: string): string {
	return s.replace(/\s+/g, ' ').trim();
}

function describeInput(kind: string, tag: string): string {
	const type = kind === 'input' ? (attr(tag, 'type') ?? '').toLowerCase() || 'text' : kind;
	if (type === 'hidden' || type === 'submit' || type === 'button') return '';
	const label = attr(tag, 'name') || attr(tag, 'placeholder') || attr(tag, 'autocomplete') || attr(tag, 'id');
	return `${type}${label ? `:${label.slice(0, 30)}` : ''}`;
}

export function summarizePage(html: string, pageUrl: string): PageSummary {
	const titleEl = elementContents(html, 'title', 1)[0];
	const title = titleEl ? squash(decodeEntities(titleEl.inner.slice(0, 1000))).slice(0, 200) : '';

	const scripts = elementContents(html, 'script', 200);
	const obfuscated = scripts.some((s) => OBFUSCATION_RE.test(s.inner.slice(0, 64 * 1024)));

	const forms: string[] = [];
	for (const f of elementContents(html, 'form', 5)) {
		let action = attr(f.attrs, 'action') ?? '';
		try {
			action = action ? new URL(action, pageUrl).host : 'same page';
		} catch {
			action = 'unparseable';
		}
		const inputs = (['input', 'select', 'textarea'] as const)
			.flatMap((kind) => openingTags(f.inner, kind, 20).map((t) => describeInput(kind, t)))
			.filter(Boolean)
			.slice(0, 10);
		forms.push(`form to ${action}: ${inputs.join(', ') || 'no visible inputs'}`);
	}
	// Inputs outside any form still matter (JS-submitted login boxes).
	if (forms.length === 0) {
		const loose = openingTags(html, 'input', 200)
			.map((t) => (attr(t, 'type') ?? '').toLowerCase())
			.filter((t) => t === 'password' || t === 'email' || t === 'tel');
		if (loose.length) forms.push(`inputs outside a form: ${[...new Set(loose)].join(', ')}`);
	}

	const downloads = [
		...new Set(
			openingTags(html, 'a', 500)
				.map((t) => attr(t, 'href') ?? '')
				.filter((h) => DOWNLOAD_RE.test(h) || /\bdownload\b/i.test(h))
				.map((h) => h.slice(0, 120))
		)
	].slice(0, 5);

	return {
		title,
		text: visibleText(html).slice(0, MAX_TEXT_CHARS),
		forms,
		downloads,
		scripts: { count: scripts.length, obfuscated }
	};
}
