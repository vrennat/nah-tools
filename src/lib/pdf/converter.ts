/**
 * DOCX to PDF Converter — uses mammoth for DOCX parsing and jsPDF for PDF generation.
 * Runs entirely client-side.
 */

import type { ProgressCallback } from './types';

export type PageSize = 'a4' | 'letter';
export type MarginPreset = 'normal' | 'narrow' | 'wide';

interface PageConfig {
	width: number; // mm
	height: number; // mm
	marginTop: number;
	marginBottom: number;
	marginLeft: number;
	marginRight: number;
}

const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
	a4: { width: 210, height: 297 },
	letter: { width: 215.9, height: 279.4 }
};

const MARGINS: Record<MarginPreset, number> = {
	normal: 25.4, // 1 inch
	narrow: 12.7, // 0.5 inch
	wide: 38.1 // 1.5 inch
};

function getPageConfig(size: PageSize, margins: MarginPreset): PageConfig {
	const { width, height } = PAGE_SIZES[size];
	const m = MARGINS[margins];
	return {
		width,
		height,
		marginTop: m,
		marginBottom: m,
		marginLeft: m,
		marginRight: m
	};
}

interface ParsedNode {
	type:
		| 'heading'
		| 'paragraph'
		| 'list-item'
		| 'table'
		| 'image'
		| 'horizontal-rule';
	level?: number; // for headings (1-6)
	runs?: TextRun[];
	ordered?: boolean; // for list items
	listIndex?: number; // 1-based index within an ordered list
	listDepth?: number;
	rows?: ParsedNode[][]; // for tables — array of rows, each row is array of cell nodes
	src?: string; // for images — base64 data URL
	imgWidth?: number;
	imgHeight?: number;
}

interface TextRun {
	text: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
}

/** Font sizes in pt for headings */
const HEADING_SIZES: Record<number, number> = {
	1: 24,
	2: 20,
	3: 16,
	4: 14,
	5: 12,
	6: 11
};

const BODY_SIZE = 11;
const LINE_HEIGHT = 1.4;

/**
 * Parse mammoth HTML output into structured nodes for PDF rendering.
 */
function parseHtml(html: string): ParsedNode[] {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const nodes: ParsedNode[] = [];

	function extractRuns(el: Element): TextRun[] {
		const runs: TextRun[] = [];

		function walk(node: Node, bold: boolean, italic: boolean, underline: boolean) {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent || '';
				if (text) {
					runs.push({ text, bold, italic, underline });
				}
				return;
			}
			if (node.nodeType === Node.ELEMENT_NODE) {
				const el = node as Element;
				const tag = el.tagName.toLowerCase();
				const b = bold || tag === 'strong' || tag === 'b';
				const i = italic || tag === 'em' || tag === 'i';
				const u = underline || tag === 'u';
				for (const child of el.childNodes) {
					walk(child, b, i, u);
				}
			}
		}

		for (const child of el.childNodes) {
			walk(child, false, false, false);
		}

		return runs;
	}

	function processElement(el: Element) {
		const tag = el.tagName.toLowerCase();

		if (/^h[1-6]$/.test(tag)) {
			const level = parseInt(tag[1]);
			nodes.push({ type: 'heading', level, runs: extractRuns(el) });
			return;
		}

		if (tag === 'p') {
			const runs = extractRuns(el);
			// Skip empty paragraphs but preserve them as spacing
			if (runs.length === 0 || runs.every((r) => !r.text.trim())) {
				nodes.push({ type: 'paragraph', runs: [{ text: '' }] });
			} else {
				nodes.push({ type: 'paragraph', runs });
			}
			return;
		}

		if (tag === 'ul' || tag === 'ol') {
			const ordered = tag === 'ol';
			let itemIndex = 0;
			for (const child of el.children) {
				if (child.tagName.toLowerCase() === 'li') {
					itemIndex++;
					const runs = extractRuns(child);
					nodes.push({ type: 'list-item', runs, ordered, listIndex: itemIndex, listDepth: 0 });

					// Handle nested lists inside the li
					for (const nested of child.children) {
						const nestedTag = nested.tagName.toLowerCase();
						if (nestedTag === 'ul' || nestedTag === 'ol') {
							const nestedOrdered = nestedTag === 'ol';
							let nestedIdx = 0;
							for (const nestedChild of nested.children) {
								if (nestedChild.tagName.toLowerCase() === 'li') {
									nestedIdx++;
									nodes.push({
										type: 'list-item',
										runs: extractRuns(nestedChild),
										ordered: nestedOrdered,
										listIndex: nestedIdx,
										listDepth: 1
									});
								}
							}
						}
					}
				}
			}
			return;
		}

		if (tag === 'table') {
			const rows: ParsedNode[][] = [];
			for (const tr of el.querySelectorAll('tr')) {
				const cells: ParsedNode[] = [];
				for (const td of tr.querySelectorAll('td, th')) {
					cells.push({ type: 'paragraph', runs: extractRuns(td as Element) });
				}
				rows.push(cells);
			}
			if (rows.length > 0) {
				nodes.push({ type: 'table', rows });
			}
			return;
		}

		if (tag === 'img') {
			const src = el.getAttribute('src') || '';
			if (src.startsWith('data:')) {
				nodes.push({ type: 'image', src });
			}
			return;
		}

		if (tag === 'hr') {
			nodes.push({ type: 'horizontal-rule' });
			return;
		}

		// For divs, sections, etc. — recurse into children
		for (const child of el.children) {
			processElement(child);
		}
	}

	for (const child of doc.body.children) {
		processElement(child);
	}

	return nodes;
}

/**
 * Convert a single DOCX file to PDF.
 */
export async function docxToPDF(
	source: ArrayBuffer,
	pageSize: PageSize = 'a4',
	marginPreset: MarginPreset = 'normal'
): Promise<Blob> {
	const mammoth = await import('mammoth');
	const { jsPDF } = await import('jspdf');

	// Convert DOCX to HTML, requesting inline images as base64
	const result = await mammoth.convertToHtml(
		{ arrayBuffer: source },
		{
			convertImage: mammoth.images.imgElement(async (image) => {
				const buf = await image.read();
				const base64 = btoa(
					new Uint8Array(buf).reduce((data, byte) => data + String.fromCharCode(byte), '')
				);
				const contentType = image.contentType || 'image/png';
				return { src: `data:${contentType};base64,${base64}` };
			})
		}
	);

	const html = result.value;
	const nodes = parseHtml(html);
	const config = getPageConfig(pageSize, marginPreset);

	const doc = new jsPDF({
		unit: 'mm',
		format: [config.width, config.height]
	});

	const usableWidth = config.width - config.marginLeft - config.marginRight;
	let y = config.marginTop;

	function ptToMm(pt: number): number {
		return pt * 0.352778;
	}

	function ensureSpace(needed: number): void {
		if (y + needed > config.height - config.marginBottom) {
			doc.addPage([config.width, config.height]);
			y = config.marginTop;
		}
	}

	function renderRuns(
		runs: TextRun[],
		fontSize: number,
		x: number,
		maxWidth: number,
		isHeadingBold?: boolean
	): number {
		// Concatenate all run text to handle word wrap, then render with style changes
		const fontSizeMm = ptToMm(fontSize);
		const lineHeightMm = fontSizeMm * LINE_HEIGHT;
		doc.setFontSize(fontSize);

		// Simple approach: split into lines, then render runs on each line
		// First, build the full text and compute line breaks
		const fullText = runs.map((r) => r.text).join('');
		if (!fullText.trim()) {
			return lineHeightMm * 0.5; // half-line for empty paragraphs
		}

		// Use jsPDF's splitTextToSize for word wrapping
		doc.setFont('helvetica', 'normal');
		const lines: string[] = doc.splitTextToSize(fullText, maxWidth);

		// For each line, render character by character with appropriate styles
		// Simplified: if runs have mixed styles, handle per-run
		const hasMultipleStyles = runs.length > 1 && runs.some((r) => r.bold || r.italic);

		let totalHeight = 0;

		if (!hasMultipleStyles) {
			// All same style — simple case
			const run = runs[0] || { text: '', bold: false, italic: false };
			const style =
				isHeadingBold || run.bold
					? run.italic
						? 'bolditalic'
						: 'bold'
					: run.italic
						? 'italic'
						: 'normal';
			doc.setFont('helvetica', style);

			// Re-split with correct font
			const styledLines: string[] = doc.splitTextToSize(fullText, maxWidth);

			for (const line of styledLines) {
				ensureSpace(lineHeightMm);
				doc.text(line, x, y + fontSizeMm);
				y += lineHeightMm;
				totalHeight += lineHeightMm;
			}
		} else {
			// Mixed styles — render run by run on each line
			// Build a flat array of {char, style} and then split into lines by word wrap
			let currentX = x;
			let runOffset = 0;

			for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
				const lineText = lines[lineIdx];
				ensureSpace(lineHeightMm);

				// Map this line back to runs
				let lineCharIdx = 0;
				currentX = x;

				while (lineCharIdx < lineText.length) {
					// Find which run this char belongs to
					let charCount = 0;
					let currentRun: TextRun | undefined;
					let runStart = 0;

					for (const r of runs) {
						if (runOffset + lineCharIdx >= charCount && runOffset + lineCharIdx < charCount + r.text.length) {
							currentRun = r;
							runStart = charCount;
							break;
						}
						charCount += r.text.length;
					}

					if (!currentRun) {
						lineCharIdx++;
						continue;
					}

					// Find how much of this run fits on this line
					const runEndInLine = Math.min(
						lineText.length - lineCharIdx,
						currentRun.text.length - (runOffset + lineCharIdx - runStart)
					);
					const chunk = lineText.substring(lineCharIdx, lineCharIdx + runEndInLine);

					const style = (isHeadingBold || currentRun.bold)
						? currentRun.italic
							? 'bolditalic'
							: 'bold'
						: currentRun.italic
							? 'italic'
							: 'normal';
					doc.setFont('helvetica', style);
					doc.setFontSize(fontSize);
					doc.text(chunk, currentX, y + fontSizeMm);
					currentX += doc.getTextWidth(chunk);
					lineCharIdx += runEndInLine;
				}

				runOffset += lineText.length;
				// Account for space between wrapped lines that splitTextToSize may have removed
				if (lineIdx < lines.length - 1) {
					// Check if original text has a space at the break point
					const nextChar = fullText[runOffset];
					if (nextChar === ' ') {
						runOffset += 1;
					}
				}

				y += lineHeightMm;
				totalHeight += lineHeightMm;
			}
		}

		return totalHeight;
	}

	for (const node of nodes) {
		switch (node.type) {
			case 'heading': {
				const level = node.level || 1;
				const fontSize = HEADING_SIZES[level] || BODY_SIZE;
				const fontSizeMm = ptToMm(fontSize);
				const spaceBefore = fontSizeMm * 0.8;
				const spaceAfter = fontSizeMm * 0.3;

				y += spaceBefore;
				ensureSpace(fontSizeMm * LINE_HEIGHT + spaceAfter);

				doc.setTextColor(0, 0, 0);
				renderRuns(node.runs || [], fontSize, config.marginLeft, usableWidth, true);
				y += spaceAfter;
				break;
			}

			case 'paragraph': {
				const spaceAfter = ptToMm(BODY_SIZE) * 0.5;
				doc.setTextColor(0, 0, 0);
				renderRuns(node.runs || [], BODY_SIZE, config.marginLeft, usableWidth);
				y += spaceAfter;
				break;
			}

			case 'list-item': {
				const indent = (node.listDepth || 0) * 6 + 6; // mm
				const bulletX = config.marginLeft + indent - 4;
				const textX = config.marginLeft + indent;
				const maxWidth = usableWidth - indent;
				const fontSizeMm = ptToMm(BODY_SIZE);
				const lineHeightMm = fontSizeMm * LINE_HEIGHT;

				ensureSpace(lineHeightMm);

				doc.setFont('helvetica', 'normal');
				doc.setFontSize(BODY_SIZE);
				doc.setTextColor(0, 0, 0);

				if (node.ordered) {
					doc.text(`${node.listIndex ?? 1}.`, bulletX, y + fontSizeMm);
				} else {
					doc.text('\u2022', bulletX, y + fontSizeMm);
				}

				renderRuns(node.runs || [], BODY_SIZE, textX, maxWidth);
				y += ptToMm(BODY_SIZE) * 0.3;
				break;
			}

			case 'table': {
				if (!node.rows || node.rows.length === 0) break;

				const rows = node.rows;
				const numCols = Math.max(...rows.map((r) => r.length));
				if (numCols === 0) break;

				const colWidth = usableWidth / numCols;
				const cellPadding = 2; // mm
				const fontSizeMm = ptToMm(BODY_SIZE);
				const rowHeight = fontSizeMm * LINE_HEIGHT + cellPadding * 2;

				for (const row of rows) {
					ensureSpace(rowHeight);

					for (let colIdx = 0; colIdx < row.length; colIdx++) {
						const cellX = config.marginLeft + colIdx * colWidth;

						// Draw cell border
						doc.setDrawColor(180, 180, 180);
						doc.setLineWidth(0.2);
						doc.rect(cellX, y, colWidth, rowHeight);

						// Render cell text
						const cellNode = row[colIdx];
						const runs = cellNode.runs || [{ text: '' }];
						const text = runs.map((r) => r.text).join('');
						doc.setFont('helvetica', 'normal');
						doc.setFontSize(BODY_SIZE);
						doc.setTextColor(0, 0, 0);
						const clipped = doc.splitTextToSize(text, colWidth - cellPadding * 2);
						doc.text(
							clipped[0] || '',
							cellX + cellPadding,
							y + cellPadding + fontSizeMm
						);
					}

					y += rowHeight;
				}

				y += ptToMm(BODY_SIZE) * 0.5;
				break;
			}

			case 'image': {
				if (!node.src) break;

				try {
					// Load the image to get dimensions
					const img = await loadImage(node.src);
					const maxImgWidth = usableWidth;
					const maxImgHeight = config.height - config.marginTop - config.marginBottom - 20;

					let imgW = img.width * 0.264583; // px to mm at 96 DPI
					let imgH = img.height * 0.264583;

					// Scale down if needed
					if (imgW > maxImgWidth) {
						const scale = maxImgWidth / imgW;
						imgW *= scale;
						imgH *= scale;
					}
					if (imgH > maxImgHeight) {
						const scale = maxImgHeight / imgH;
						imgW *= scale;
						imgH *= scale;
					}

					ensureSpace(imgH + 4);

					const format = node.src.includes('image/png') ? 'PNG' : 'JPEG';
					doc.addImage(node.src, format, config.marginLeft, y, imgW, imgH);
					y += imgH + 4;
				} catch {
					// Skip images that fail to load
				}
				break;
			}

			case 'horizontal-rule': {
				y += 4;
				ensureSpace(4);
				doc.setDrawColor(180, 180, 180);
				doc.setLineWidth(0.3);
				doc.line(config.marginLeft, y, config.marginLeft + usableWidth, y);
				y += 4;
				break;
			}
		}
	}

	return doc.output('blob');
}

/**
 * Convert multiple DOCX files, returning an array of { name, blob } results.
 */
export async function batchDocxToPDF(
	files: File[],
	pageSize: PageSize = 'a4',
	marginPreset: MarginPreset = 'normal',
	onProgress?: ProgressCallback
): Promise<{ name: string; blob: Blob }[]> {
	const results: { name: string; blob: Blob }[] = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const buf = await file.arrayBuffer();
		const blob = await docxToPDF(buf, pageSize, marginPreset);
		const pdfName = file.name.replace(/\.(docx?|DOCX?)$/, '.pdf');
		results.push({ name: pdfName, blob });
		onProgress?.(i + 1, files.length);
	}

	return results;
}

/**
 * Convert DOCX to HTML for preview rendering.
 */
export async function docxToHtml(source: ArrayBuffer): Promise<string> {
	const mammoth = await import('mammoth');

	const result = await mammoth.convertToHtml(
		{ arrayBuffer: source },
		{
			convertImage: mammoth.images.imgElement(async (image) => {
				const buf = await image.read();
				const base64 = btoa(
					new Uint8Array(buf).reduce((data, byte) => data + String.fromCharCode(byte), '')
				);
				const contentType = image.contentType || 'image/png';
				return { src: `data:${contentType};base64,${base64}` };
			})
		}
	);

	return result.value;
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}
