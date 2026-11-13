/**
 * Linear-time HTML scanning for untrusted pages.
 *
 * The gate reads pages written by attackers, so nothing here may backtrack
 * over the whole body: element boundaries are found with indexOf, and
 * regular expressions only run on single tags. Nothing is capped by count or
 * length (the body itself is capped when fetched), because a cap is a place
 * to hide a redirect after.
 */

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
			end = commentEnd(lower, lt);
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

/**
 * End of the comment starting at `lt`, as browsers parse it: `<!-->` and
 * `<!--->` close immediately, and both `-->` and `--!>` end a comment.
 */
function commentEnd(lower: string, lt: number): number {
	if (lower.startsWith('>', lt + 4)) return lt + 5;
	if (lower.startsWith('->', lt + 4)) return lt + 6;
	const a = lower.indexOf('-->', lt + 4);
	const b = lower.indexOf('--!>', lt + 4);
	if (a === -1 && b === -1) return lower.length;
	if (b === -1 || (a !== -1 && a < b)) return a + 3;
	return b + 4;
}

/** Inner contents of each `<tag ...>...</tag>` (or to the end if unclosed), at most `limit`. */
export function elementContents(html: string, tag: string, limit = Infinity): { attrs: string; inner: string }[] {
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
		found.push({ attrs: html.slice(start + tag.length + 1, gt), inner: html.slice(gt + 1, innerEnd) });
		pos = close === -1 ? html.length : close + tag.length + 2;
	}
	return found;
}

/** Attribute strings of each opening `<tag ...>` (void elements such as meta, input, a), at most `limit`. */
export function openingTags(html: string, tag: string, limit = Infinity): string[] {
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
		found.push(html.slice(start + tag.length + 1, gt));
		pos = gt + 1;
	}
	return found;
}

/** Value of attribute `name` in a single tag's attribute string. */
export function attr(tag: string, name: string): string | null {
	const m = new RegExp(`(?:^|[\\s/])${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
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
		stripElements(html, ['script', 'style', 'noscript', 'template'])
			// [^<>] keeps this linear: an unclosed `<` stops at the next `<`.
			.replace(/<[^<>]*>/g, ' ')
	)
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Target of a refresh instruction, from a `Refresh` header or a meta
 * refresh `content` value: "0; url=/x", "0;https://x", "0.5, URL='x'".
 * Returns null for a plain reload with no target. Any delay counts: a
 * spam loader can wait, and pages are only followed when they are loaders
 * (see isLoaderPage). Tabs and newlines are removed from the target, as the
 * URL parser does.
 */
export function parseRefresh(value: string): string | null {
	const m = /^\s*[\d.]*\s*[;,]?\s*(?:url\s*=\s*)?([\s\S]*)$/i.exec(value);
	if (!m) return null;
	const target = m[1].replace(/[\t\n\r]/g, '').trim().replace(/^['"]|['"]$/g, '').trim();
	return target ? target : null;
}
