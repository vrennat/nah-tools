import { markdownToHtml } from './renderer';

export async function copyText(markdown: string): Promise<void> {
	await navigator.clipboard.writeText(markdown);
}

export function downloadMarkdown(markdown: string, filename: string): void {
	const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
	downloadBlob(blob, `${filename}.md`);
}

export function downloadHtml(markdown: string, filename: string): void {
	const html = markdownToHtml(markdown);

	const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${escapeHtml(filename)}</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
			line-height: 1.6;
			max-width: 900px;
			margin: 0 auto;
			padding: 2rem;
			color: #333;
		}
		h1, h2, h3 { margin-top: 2rem; margin-bottom: 1rem; }
		h1 { font-size: 2.5rem; }
		h2 { font-size: 2rem; border-bottom: 2px solid #f0f0f0; padding-bottom: 0.5rem; }
		h3 { font-size: 1.5rem; }
		p { margin: 1rem 0; }
		ul, ol { margin: 1rem 0; padding-left: 2rem; }
		li { margin: 0.5rem 0; }
		a { color: #3b82f6; text-decoration: none; }
		a:hover { text-decoration: underline; }
		strong { font-weight: 600; }
		em { font-style: italic; }
		code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
	</style>
</head>
<body>
${html}
</body>
</html>`;

	const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
	downloadBlob(blob, `${filename}.html`);
}

export async function downloadPdf(markdown: string, filename: string): Promise<void> {
	try {
		const pdfMakeModule = await import('pdfmake/build/pdfmake');
		const vfsFontsModule = await import('pdfmake/build/vfs_fonts');

		const pdfMake = pdfMakeModule.default as unknown as {
			vfs: Record<string, unknown>;
			createPdf(doc: unknown): { download(name: string): void };
		};
		const pdfVfs = (vfsFontsModule as unknown as { pdfMake: { vfs: Record<string, unknown> } }).pdfMake.vfs;

		pdfMake.vfs = pdfVfs;

		const docDefinition = markdownToPdfMakeDocument(markdown) as unknown;

		const pdf = pdfMake.createPdf(docDefinition);
		pdf.download(`${filename}.pdf`);
	} catch (error) {
		throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function markdownToPdfMakeDocument(markdown: string): Record<string, unknown> {
	const lines = markdown.split('\n');
	const content: Array<Record<string, unknown>> = [];
	let listItems: string[] = [];
	let listType: 'ul' | 'ol' | null = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		// Skip empty lines
		if (trimmed === '') {
			// Flush any open list
			if (listItems.length > 0) {
				if (listType === 'ul') {
					content.push({ ul: listItems });
				} else if (listType === 'ol') {
					content.push({ ol: listItems });
				}
				listItems = [];
				listType = null;
			}
			continue;
		}

		// Headings
		if (trimmed.startsWith('# ')) {
			const match = trimmed.match(/^(#{1,3})\s+(.+)$/);
			if (match) {
				const level = match[1].length;
				const text = match[2];

				if (listItems.length > 0) {
					if (listType === 'ul') content.push({ ul: listItems });
					else if (listType === 'ol') content.push({ ol: listItems });
					listItems = [];
					listType = null;
				}

				if (level === 1) {
					content.push({ text, style: 'heading1' });
				} else if (level === 2) {
					content.push({ text, style: 'heading2' });
				} else {
					content.push({ text, style: 'heading3' });
				}
				continue;
			}
		}

		// Unordered list
		if (trimmed.startsWith('- ')) {
			if (listType === 'ol') {
				content.push({ ol: listItems });
				listItems = [];
			}
			listType = 'ul';
			listItems.push(trimmed.slice(2));
			continue;
		}

		// Ordered list
		if (trimmed.match(/^\d+\.\s/)) {
			if (listType === 'ul') {
				content.push({ ul: listItems });
				listItems = [];
			}
			listType = 'ol';
			listItems.push(trimmed.replace(/^\d+\.\s/, ''));
			continue;
		}

		// Flush list if we hit non-list content
		if (listItems.length > 0) {
			if (listType === 'ul') content.push({ ul: listItems });
			else if (listType === 'ol') content.push({ ol: listItems });
			listItems = [];
			listType = null;
		}

		// Regular paragraph
		if (trimmed) {
			content.push({ text: trimmed, style: 'body' });
		}
	}

	// Flush any remaining list
	if (listItems.length > 0) {
		if (listType === 'ul') content.push({ ul: listItems });
		else if (listType === 'ol') content.push({ ol: listItems });
	}

	return {
		content,
		defaultStyle: {
			font: 'Helvetica',
			size: 11,
			lineHeight: 1.5
		},
		styles: {
			heading1: {
				fontSize: 24,
				bold: true,
				marginBottom: 12
			},
			heading2: {
				fontSize: 18,
				bold: true,
				marginTop: 12,
				marginBottom: 8
			},
			heading3: {
				fontSize: 14,
				bold: true,
				marginTop: 10,
				marginBottom: 6
			},
			body: {
				fontSize: 11,
				alignment: 'justify',
				marginBottom: 6
			}
		}
	};
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
