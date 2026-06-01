// Compact, XSS-safe Markdown -> HTML renderer. Supports headings, fenced and
// inline code, blockquotes, ordered/unordered lists, hr, links, images, bold,
// italic, strikethrough, and paragraphs. Link/image URLs are protocol-checked.

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function safeUrl(url: string): string {
	const trimmed = url.trim();
	if (/^(https?:|mailto:|tel:|#|\/)/i.test(trimmed)) return trimmed;
	if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return '#'; // block javascript:, data:, etc.
	return trimmed;
}

function inline(text: string): string {
	let t = escapeHtml(text);
	// inline code (protect from other replacements by escaping already done)
	t = t.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
	// images ![alt](url)
	t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}" />`);
	// links [text](url)
	t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${txt}</a>`);
	// bold
	t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	t = t.replace(/__([^_]+)__/g, '<strong>$1</strong>');
	// italic
	t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
	t = t.replace(/_([^_]+)_/g, '<em>$1</em>');
	// strikethrough
	t = t.replace(/~~([^~]+)~~/g, '<del>$1</del>');
	return t;
}

export function renderMarkdown(md: string): string {
	const lines = md.replace(/\r\n/g, '\n').split('\n');
	const out: string[] = [];
	let i = 0;

	type ListType = 'ul' | 'ol' | null;
	let listType: ListType = null;
	const closeList = () => {
		if (listType) {
			out.push(`</${listType}>`);
			listType = null;
		}
	};

	while (i < lines.length) {
		const line = lines[i];

		// fenced code block
		const fence = line.match(/^```(\w*)\s*$/);
		if (fence) {
			closeList();
			const lang = fence[1];
			const buf: string[] = [];
			i++;
			while (i < lines.length && !/^```\s*$/.test(lines[i])) {
				buf.push(lines[i]);
				i++;
			}
			i++; // skip closing fence
			const cls = lang ? ` class="language-${lang}"` : '';
			out.push(`<pre><code${cls}>${escapeHtml(buf.join('\n'))}</code></pre>`);
			continue;
		}

		// blank line
		if (line.trim() === '') {
			closeList();
			i++;
			continue;
		}

		// horizontal rule
		if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
			closeList();
			out.push('<hr />');
			i++;
			continue;
		}

		// heading
		const h = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
		if (h) {
			closeList();
			const lvl = h[1].length;
			out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
			i++;
			continue;
		}

		// blockquote (consume consecutive)
		if (/^>\s?/.test(line)) {
			closeList();
			const buf: string[] = [];
			while (i < lines.length && /^>\s?/.test(lines[i])) {
				buf.push(lines[i].replace(/^>\s?/, ''));
				i++;
			}
			out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
			continue;
		}

		// unordered list item
		if (/^\s*[-*+]\s+/.test(line)) {
			if (listType !== 'ul') {
				closeList();
				out.push('<ul>');
				listType = 'ul';
			}
			out.push(`<li>${inline(line.replace(/^\s*[-*+]\s+/, ''))}</li>`);
			i++;
			continue;
		}

		// ordered list item
		if (/^\s*\d+\.\s+/.test(line)) {
			if (listType !== 'ol') {
				closeList();
				out.push('<ol>');
				listType = 'ol';
			}
			out.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`);
			i++;
			continue;
		}

		// paragraph (merge consecutive non-blank, non-special lines)
		closeList();
		const para: string[] = [line];
		i++;
		while (
			i < lines.length &&
			lines[i].trim() !== '' &&
			!/^(#{1,6}\s|>|\s*[-*+]\s|\s*\d+\.\s|```)/.test(lines[i]) &&
			!/^(\s*[-*_]\s*){3,}$/.test(lines[i])
		) {
			para.push(lines[i]);
			i++;
		}
		out.push(`<p>${inline(para.join(' '))}</p>`);
	}

	closeList();
	return out.join('\n');
}
