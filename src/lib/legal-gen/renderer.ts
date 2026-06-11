export function markdownToHtml(markdown: string): string {
	const lines = markdown.split('\n');
	const htmlLines: string[] = [];
	let inUnorderedList = false;
	let inOrderedList = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		// Skip empty lines in list context
		if (trimmed === '') {
			if (inUnorderedList) {
				htmlLines.push('</ul>');
				inUnorderedList = false;
			}
			if (inOrderedList) {
				htmlLines.push('</ol>');
				inOrderedList = false;
			}
			htmlLines.push('');
			continue;
		}

		// Headings
		if (trimmed.startsWith('#')) {
			const match = trimmed.match(/^(#{1,3})\s+(.+)$/);
			if (match) {
				const level = match[1].length;
				const content = escapeHtml(match[2]);
				htmlLines.push(`<h${level}>${content}</h${level}>`);
				continue;
			}
		}

		// Unordered list
		if (trimmed.startsWith('- ')) {
			if (!inUnorderedList) {
				htmlLines.push('<ul>');
				inUnorderedList = true;
			}
			const content = trimmed.slice(2);
			htmlLines.push(`<li>${processInline(content)}</li>`);
			continue;
		}

		// Ordered list
		if (trimmed.match(/^\d+\.\s/)) {
			if (!inOrderedList) {
				htmlLines.push('<ol>');
				inOrderedList = true;
			}
			const content = trimmed.replace(/^\d+\.\s/, '');
			htmlLines.push(`<li>${processInline(content)}</li>`);
			continue;
		}

		// Close lists if we're not in a list item
		if (inUnorderedList) {
			htmlLines.push('</ul>');
			inUnorderedList = false;
		}
		if (inOrderedList) {
			htmlLines.push('</ol>');
			inOrderedList = false;
		}

		// Paragraph
		if (trimmed) {
			const processed = processInline(trimmed);
			htmlLines.push(`<p>${processed}</p>`);
		}
	}

	// Close any open lists at end
	if (inUnorderedList) {
		htmlLines.push('</ul>');
	}
	if (inOrderedList) {
		htmlLines.push('</ol>');
	}

	return htmlLines.join('\n');
}

// Escape first, then process inline markup so injected HTML tags are preserved
function processInline(text: string): string {
	text = escapeHtml(text);

	// Links: [text](url) — URL is already escaped by escapeHtml, but javascript: has no
	// HTML-special chars so it passes through; validate the scheme before emitting an anchor.
	text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
		// Unescape the URL (escapeHtml above turned & -> &amp; etc.) to check the raw scheme.
		// Only https/http/mailto are allowed; anything else (javascript:, vbscript:, etc.)
		// renders as plain text to prevent script execution via {@html} output.
		const rawUrl = url
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'");
		const lower = rawUrl.trim().toLowerCase();
		if (lower.startsWith('https://') || lower.startsWith('http://') || lower.startsWith('mailto:')) {
			return `<a href="${url}">${label}</a>`;
		}
		return label;
	});

	// Bold: **text**
	text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

	// Italic: *text*
	text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

	return text;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
