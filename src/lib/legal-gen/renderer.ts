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

	// Links: [text](url) — URL is already escaped by escapeHtml
	text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

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
