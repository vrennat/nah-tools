/**
 * Linear-time HTML scanning for untrusted pages.
 *
 * The gate reads pages written by attackers, so nothing here may backtrack
 * over the whole body: element boundaries are found with indexOf, and
 * regular expressions only run on single tags capped at MAX_TAG_CHARS.
 */

export const MAX_TAG_CHARS = 2048;

/**
 * Remove comments and the given elements with their contents. An element
 * that is never closed is removed to the end of the document, which is how
 * browsers treat an unclosed <script> too.
 */
export function stripElements(html: string, tags: readonly string[]): string {
	const lower = html.toLowerCase();
	const out: string[] = [];
	let pos = 0;
	while (pos < html.length) {
		const lt = lower.indexOf('<', pos);
		if (lt === -1) break;
		let end = -1;
		if (lower.startsWith('<!--', lt)) {
			const close = lower.indexOf('-->', lt + 4);
			end = close === -1 ? html.length : close + 3;
		} else {
			for (const tag of tags) {
				if (lower.startsWith(`<${tag}`, lt) && /[\s>/]/.test(lower[lt + tag.length + 1] ?? '>')) {
					const close = lower.indexOf(`</${tag}`, lt + tag.length + 1);
					if (close === -1) end = html.length;
					else {
						const gt = lower.indexOf('>', close);
						end = gt === -1 ? html.length : gt + 1;
					}
					break;
				}
			}
		}
		if (end === -1) {
			out.push(html.slice(pos, lt + 1));
			pos = lt + 1;
		} else {
			out.push(html.slice(pos, lt), ' ');
			pos = end;
		}
	}
	out.push(html.slice(pos));
	return out.join('');
}

/** Inner contents of each `<tag ...>...</tag>` (or to the end if unclosed), at most `limit`. */
export function elementContents(html: string, tag: string, limit = 50): { attrs: string; inner: string }[] {
	const lower = html.toLowerCase();
	const found: { attrs: string; inner: string }[] = [];
	let pos = 0;
	while (found.length < limit) {
		const start = lower.indexOf(`<${tag}`, pos);
		if (start === -1) break;
		const next = lower[start + tag.length + 1] ?? '>';
		if (!/[\s>/]/.test(next)) {
			pos = start + 1;
			continue;
		}
		const gt = lower.indexOf('>', start);
		if (gt === -1) break;
		const close = lower.indexOf(`</${tag}`, gt);
		const innerEnd = close === -1 ? html.length : close;
		found.push({ attrs: html.slice(start + tag.length + 1, Math.min(gt, start + MAX_TAG_CHARS)), inner: html.slice(gt + 1, innerEnd) });
		pos = close === -1 ? html.length : close + tag.length + 2;
	}
	return found;
}

/** Attribute strings of each opening `<tag ...>` (void elements such as meta, input, a), at most `limit`. */
export function openingTags(html: string, tag: string, limit = 200): string[] {
	const lower = html.toLowerCase();
	const found: string[] = [];
	let pos = 0;
	while (found.length < limit) {
		const start = lower.indexOf(`<${tag}`, pos);
		if (start === -1) break;
		const next = lower[start + tag.length + 1] ?? '>';
		pos = start + 1;
		if (!/[\s>/]/.test(next)) continue;
		const gt = lower.indexOf('>', start);
		if (gt === -1) break;
		found.push(html.slice(start + tag.length + 1, Math.min(gt, start + MAX_TAG_CHARS)));
		pos = gt + 1;
	}
	return found;
}

/** Value of attribute `name` in a single tag's attribute string. */
export function attr(tag: string, name: string): string | null {
	const m = new RegExp(`(?:^|[\\s/])${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(
		tag.slice(0, MAX_TAG_CHARS)
	);
	return m ? decodeEntities(m[1] ?? m[2] ?? m[3] ?? '') : null;
}

const ENTITY_MAP: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(s: string): string {
	return s.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, (m, e: string) => {
		if (e[0] === '#') {
			const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
			return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
		}
		return ENTITY_MAP[e.toLowerCase()] ?? m;
	});
}

/** Visible text: scripts, styles and comments removed, tags replaced by spaces, whitespace squashed. */
export function visibleText(html: string): string {
	return decodeEntities(
		stripElements(html, ['script', 'style', 'noscript', 'template', 'svg'])
			// [^<>] keeps this linear: an unclosed `<` stops at the next `<`.
			.replace(/<[^<>]*>/g, ' ')
	)
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Target of a refresh instruction, from a `Refresh` header or a meta
 * refresh `content` value: "0; url=/x", "0;https://x", "0.5, URL='x'".
 * Returns null for a plain reload with no target.
 */
export function parseRefresh(value: string): string | null {
	const m = /^\s*[\d.]*\s*[;,]?\s*(?:url\s*=\s*)?(.*)$/i.exec(value.slice(0, MAX_TAG_CHARS));
	const target = (m?.[1] ?? '').trim().replace(/^['"]|['"]$/g, '').trim();
	return target ? target : null;
}
