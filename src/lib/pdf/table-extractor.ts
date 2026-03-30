/**
 * PDF Table Extraction — detects tabular data in PDFs using text position analysis.
 * Uses pdfjs-dist for text extraction with position data.
 */

import type { ExtractedTable, ProgressCallback } from './types';

type PDFJSLib = typeof import('pdfjs-dist');
let pdfjsLib: PDFJSLib;

async function getPDFJS(): Promise<PDFJSLib> {
	if (!pdfjsLib) {
		pdfjsLib = await import('pdfjs-dist');
		pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.mjs',
			import.meta.url
		).href;
	}
	return pdfjsLib;
}

interface TextItem {
	text: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Extract text items with position data from a single PDF page.
 */
async function extractTextItems(page: any): Promise<TextItem[]> {
	const content = await page.getTextContent();
	const items: TextItem[] = [];

	for (const item of content.items) {
		if (!('str' in item) || !item.str.trim()) continue;
		const tx = item.transform;
		items.push({
			text: item.str,
			x: tx[4],
			y: tx[5],
			width: item.width,
			height: item.height || Math.abs(tx[3]) || 12
		});
	}

	return items;
}

/**
 * Cluster text items into rows by y-position (within tolerance).
 */
function clusterIntoRows(items: TextItem[], tolerance: number = 3): TextItem[][] {
	if (items.length === 0) return [];

	// Sort by y descending (PDF coordinates: bottom = 0, top = max)
	const sorted = [...items].sort((a, b) => b.y - a.y);
	const rows: TextItem[][] = [];
	let currentRow: TextItem[] = [sorted[0]];
	let currentY = sorted[0].y;

	for (let i = 1; i < sorted.length; i++) {
		if (Math.abs(sorted[i].y - currentY) <= tolerance) {
			currentRow.push(sorted[i]);
		} else {
			// Sort row left-to-right
			currentRow.sort((a, b) => a.x - b.x);
			rows.push(currentRow);
			currentRow = [sorted[i]];
			currentY = sorted[i].y;
		}
	}
	currentRow.sort((a, b) => a.x - b.x);
	rows.push(currentRow);

	return rows;
}

/**
 * Detect column boundaries from rows of text items.
 * Uses x-position clustering across all rows.
 */
function detectColumns(rows: TextItem[][]): number[] {
	// Collect all x-positions
	const xPositions: number[] = [];
	for (const row of rows) {
		for (const item of row) {
			xPositions.push(Math.round(item.x));
		}
	}

	if (xPositions.length === 0) return [];

	// Sort and cluster x positions
	xPositions.sort((a, b) => a - b);
	const clusters: number[] = [xPositions[0]];
	const clusterTolerance = 15; // pixels

	for (let i = 1; i < xPositions.length; i++) {
		const lastCluster = clusters[clusters.length - 1];
		if (xPositions[i] - lastCluster > clusterTolerance) {
			clusters.push(xPositions[i]);
		}
	}

	return clusters;
}

/**
 * Assign text items to columns and build a string grid.
 */
function buildGrid(rows: TextItem[][], columnBoundaries: number[]): string[][] {
	const grid: string[][] = [];

	for (const row of rows) {
		const cells: string[] = new Array(columnBoundaries.length).fill('');

		for (const item of row) {
			// Find nearest column
			let bestCol = 0;
			let bestDist = Infinity;
			for (let c = 0; c < columnBoundaries.length; c++) {
				const dist = Math.abs(item.x - columnBoundaries[c]);
				if (dist < bestDist) {
					bestDist = dist;
					bestCol = c;
				}
			}
			// Append text to cell (in case multiple items map to same cell)
			if (cells[bestCol]) {
				cells[bestCol] += ' ' + item.text;
			} else {
				cells[bestCol] = item.text;
			}
		}

		grid.push(cells);
	}

	return grid;
}

/**
 * Determine if a page has tabular content.
 * Heuristic: at least 3 rows with 2+ columns of consistent structure.
 */
function isTabular(rows: TextItem[][], columnBoundaries: number[]): boolean {
	if (rows.length < 2 || columnBoundaries.length < 2) return false;

	// Check that most rows use multiple columns
	let multiColRows = 0;
	for (const row of rows) {
		const usedCols = new Set<number>();
		for (const item of row) {
			let bestCol = 0;
			let bestDist = Infinity;
			for (let c = 0; c < columnBoundaries.length; c++) {
				const dist = Math.abs(item.x - columnBoundaries[c]);
				if (dist < bestDist) {
					bestDist = dist;
					bestCol = c;
				}
			}
			usedCols.add(bestCol);
		}
		if (usedCols.size >= 2) multiColRows++;
	}

	return multiColRows >= Math.min(2, rows.length * 0.5);
}

/**
 * Extract tables from all pages of a PDF.
 */
export async function extractTables(
	source: ArrayBuffer,
	options?: { firstRowHeader?: boolean },
	onProgress?: ProgressCallback
): Promise<ExtractedTable[]> {
	const pdfjs = await getPDFJS();
	const doc = await pdfjs.getDocument({ data: source }).promise;
	const tables: ExtractedTable[] = [];
	const firstRowHeader = options?.firstRowHeader ?? true;

	for (let i = 0; i < doc.numPages; i++) {
		const page = await doc.getPage(i + 1); // 1-based
		const items = await extractTextItems(page);

		if (items.length === 0) {
			page.cleanup();
			onProgress?.(i + 1, doc.numPages);
			continue;
		}

		const rows = clusterIntoRows(items);
		const columns = detectColumns(rows);

		if (isTabular(rows, columns)) {
			const grid = buildGrid(rows, columns);

			// Remove completely empty rows
			const filtered = grid.filter((row) => row.some((cell) => cell.trim()));

			if (filtered.length >= 2) {
				if (firstRowHeader) {
					tables.push({
						headers: filtered[0].map((h) => h.trim()),
						rows: filtered.slice(1).map((row) => row.map((cell) => cell.trim())),
						pageIndex: i
					});
				} else {
					// Generate column headers (A, B, C, ...)
					const headers = columns.map((_, idx) =>
						String.fromCharCode(65 + (idx % 26))
					);
					tables.push({
						headers,
						rows: filtered.map((row) => row.map((cell) => cell.trim())),
						pageIndex: i
					});
				}
			}
		}

		page.cleanup();
		onProgress?.(i + 1, doc.numPages);
	}

	doc.destroy();
	return tables;
}

/**
 * Convert an ExtractedTable to a CSV string with proper escaping.
 */
export function tableToCSV(table: ExtractedTable): string {
	function escapeCell(cell: string): string {
		if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
			return '"' + cell.replace(/"/g, '""') + '"';
		}
		return cell;
	}

	const lines: string[] = [];
	lines.push(table.headers.map(escapeCell).join(','));
	for (const row of table.rows) {
		lines.push(row.map(escapeCell).join(','));
	}
	return lines.join('\n');
}
