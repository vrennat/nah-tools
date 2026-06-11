/**
 * MCP Tools — PDF Processing
 *
 * Server-side PDF operations via @cantoo/pdf-lib (pure JS, no DOM required).
 * All files are passed as base64-encoded strings.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bufferToB64, MAX_BASE64_BYTES, MAX_MERGE_FILES } from './utils';

// Lazy-load pdf-lib to avoid top-level await
let PDFLib: typeof import('@cantoo/pdf-lib');
async function getPDFLib() {
	if (!PDFLib) PDFLib = await import('@cantoo/pdf-lib');
	return PDFLib;
}

function b64ToBuffer(b64: string): ArrayBuffer {
	const raw = atob(b64);
	const buf = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
	return buf.buffer;
}

function error(message: string) {
	return { content: [{ type: 'text' as const, text: message }], isError: true };
}

function pdfResult(data: Uint8Array, extra?: Record<string, unknown>) {
	return {
		content: [{
			type: 'text' as const,
			text: JSON.stringify({
				pdf_base64: bufferToB64(data),
				size_bytes: data.length,
				...extra
			})
		}]
	};
}

// Valid hex color: optional leading #, exactly 6 hex digits.
const HEX_COLOR_RE = /^#?[0-9A-Fa-f]{6}$/;

const BASE64_PDF = z
	.string()
	.max(MAX_BASE64_BYTES, `PDF must be under ${MAX_BASE64_BYTES / 1_000_000} MB (base64)`)
	.describe('Base64-encoded PDF file data');

export function registerPDFTools(server: McpServer) {
	// ── Get Info ──
	server.registerTool('pdf_get_info', {
		title: 'Get PDF Info',
		description: 'Get page count and page dimensions from a PDF file.',
		inputSchema: {
			pdf_base64: BASE64_PDF
		},
		annotations: { readOnlyHint: true }
	}, async ({ pdf_base64 }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const doc = await PDFDocument.load(b64ToBuffer(pdf_base64), { ignoreEncryption: true });
			const pages = doc.getPages().map((p, i) => {
				const { width, height } = p.getSize();
				return { page: i + 1, width_pt: Math.round(width), height_pt: Math.round(height) };
			});
			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						page_count: doc.getPageCount(),
						title: doc.getTitle() || null,
						author: doc.getAuthor() || null,
						subject: doc.getSubject() || null,
						creator: doc.getCreator() || null,
						producer: doc.getProducer() || null,
						pages
					}, null, 2)
				}]
			};
		} catch (e) {
			console.error('[mcp/pdf] pdf_get_info error:', e);
			return error(`Failed to read PDF: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Merge ──
	server.registerTool('pdf_merge', {
		title: 'Merge PDFs',
		description: 'Merge multiple PDF files into a single PDF. Provide an array of base64-encoded PDFs.',
		inputSchema: {
			pdfs_base64: z
				.array(
					z.string().max(MAX_BASE64_BYTES, `Each PDF must be under ${MAX_BASE64_BYTES / 1_000_000} MB (base64)`)
				)
				.min(2)
				.max(MAX_MERGE_FILES, `Cannot merge more than ${MAX_MERGE_FILES} files at once`)
				.describe(`Array of base64-encoded PDF files to merge (2–${MAX_MERGE_FILES} files)`)
		}
	}, async ({ pdfs_base64 }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const merged = await PDFDocument.create();
			for (const b64 of pdfs_base64) {
				const source = await PDFDocument.load(b64ToBuffer(b64));
				const pages = await merged.copyPages(source, source.getPageIndices());
				for (const page of pages) merged.addPage(page);
			}
			const data = await merged.save();
			return pdfResult(data, { files_merged: pdfs_base64.length, page_count: merged.getPageCount() });
		} catch (e) {
			console.error('[mcp/pdf] pdf_merge error:', e);
			return error(`Failed to merge PDFs: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Split ──
	server.registerTool('pdf_split', {
		title: 'Split PDF',
		description:
			'Split a PDF into multiple documents by page ranges. Each range produces a separate PDF. Pages are 1-indexed.',
		inputSchema: {
			pdf_base64: BASE64_PDF,
			ranges: z
				.array(z.object({
					start: z.number().int().min(1).describe('Start page (1-indexed, inclusive)'),
					end: z.number().int().min(1).describe('End page (1-indexed, inclusive)')
				}))
				.min(1)
				.describe('Page ranges to extract')
		}
	}, async ({ pdf_base64, ranges }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const source = await PDFDocument.load(b64ToBuffer(pdf_base64));
			const pageCount = source.getPageCount();
			const results: string[] = [];
			for (const range of ranges) {
				// Reject ranges that start beyond the document — returning a 0-page PDF is misleading.
				if (range.start > pageCount) {
					return error(`Range start ${range.start} exceeds page count ${pageCount}`);
				}
				const newDoc = await PDFDocument.create();
				const indices = [];
				for (let i = range.start - 1; i < Math.min(range.end, pageCount); i++) {
					indices.push(i);
				}
				const pages = await newDoc.copyPages(source, indices);
				for (const page of pages) newDoc.addPage(page);
				results.push(bufferToB64(await newDoc.save()));
			}
			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						splits: results.map((b64, i) => ({
							range: `${ranges[i].start}-${ranges[i].end}`,
							pdf_base64: b64
						}))
					})
				}]
			};
		} catch (e) {
			console.error('[mcp/pdf] pdf_split error:', e);
			return error(`Failed to split PDF: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Rotate ──
	server.registerTool('pdf_rotate', {
		title: 'Rotate PDF Pages',
		description: 'Rotate specific pages in a PDF. Rotation is clockwise in degrees (90, 180, 270).',
		inputSchema: {
			pdf_base64: BASE64_PDF,
			rotations: z
				.array(z.object({
					page: z.number().int().min(1).describe('Page number (1-indexed)'),
					degrees: z.enum(['90', '180', '270']).describe('Clockwise rotation in degrees')
				}))
				.min(1)
				.describe('Pages to rotate and by how much')
		}
	}, async ({ pdf_base64, rotations }) => {
		try {
			const { PDFDocument, degrees } = await getPDFLib();
			const doc = await PDFDocument.load(b64ToBuffer(pdf_base64));
			const pages = doc.getPages();
			for (const rot of rotations) {
				if (rot.page > pages.length) return error(`Page ${rot.page} does not exist (PDF has ${pages.length} pages)`);
				const page = pages[rot.page - 1];
				const current = page.getRotation().angle;
				page.setRotation(degrees((current + Number(rot.degrees)) % 360));
			}
			return pdfResult(await doc.save(), { pages_rotated: rotations.length });
		} catch (e) {
			console.error('[mcp/pdf] pdf_rotate error:', e);
			return error(`Failed to rotate PDF: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Remove Pages ──
	server.registerTool('pdf_remove_pages', {
		title: 'Remove PDF Pages',
		description: 'Remove specific pages from a PDF. Pages are 1-indexed.',
		inputSchema: {
			pdf_base64: BASE64_PDF,
			pages: z.array(z.number().int().min(1)).min(1).describe('Page numbers to remove (1-indexed)')
		}
	}, async ({ pdf_base64, pages: pagesToRemove }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const source = await PDFDocument.load(b64ToBuffer(pdf_base64));
			const removeSet = new Set(pagesToRemove.map((p) => p - 1));
			const keepIndices = source.getPageIndices().filter((i) => !removeSet.has(i));
			if (keepIndices.length === 0) return error('Cannot remove all pages from a PDF');
			const newDoc = await PDFDocument.create();
			const copied = await newDoc.copyPages(source, keepIndices);
			for (const page of copied) newDoc.addPage(page);
			return pdfResult(await newDoc.save(), {
				original_pages: source.getPageCount(),
				remaining_pages: newDoc.getPageCount()
			});
		} catch (e) {
			console.error('[mcp/pdf] pdf_remove_pages error:', e);
			return error(`Failed to remove pages: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Reorder Pages ──
	server.registerTool('pdf_reorder', {
		title: 'Reorder PDF Pages',
		description:
			'Reorder pages in a PDF. Provide the new page order as an array of 1-indexed page numbers.',
		inputSchema: {
			pdf_base64: BASE64_PDF,
			new_order: z
				.array(z.number().int().min(1))
				.min(1)
				.describe('New page order as array of 1-indexed page numbers (e.g. [3,1,2] puts page 3 first)')
		}
	}, async ({ pdf_base64, new_order }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const source = await PDFDocument.load(b64ToBuffer(pdf_base64));
			const pageCount = source.getPageCount();

			// Validate all page indices before passing to pdf-lib.
			for (const p of new_order) {
				if (p > pageCount) {
					return error(`Page ${p} does not exist (PDF has ${pageCount} pages)`);
				}
			}

			const indices = new_order.map((p) => p - 1);
			const newDoc = await PDFDocument.create();
			const copied = await newDoc.copyPages(source, indices);
			for (const page of copied) newDoc.addPage(page);
			return pdfResult(await newDoc.save(), { page_count: newDoc.getPageCount() });
		} catch (e) {
			console.error('[mcp/pdf] pdf_reorder error:', e);
			return error(`Failed to reorder PDF: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Add Watermark ──
	server.registerTool('pdf_add_watermark', {
		title: 'Add PDF Watermark',
		description: 'Add a text watermark to all pages of a PDF.',
		inputSchema: {
			pdf_base64: BASE64_PDF,
			text: z.string().max(1000).describe('Watermark text'),
			font_size: z.number().optional().describe('Font size in points (default: 48)'),
			color: z.string().optional().describe('Hex color, with or without leading # (default: "#999999")'),
			opacity: z.number().min(0).max(1).optional().describe('Opacity 0-1 (default: 0.3)'),
			rotation: z.number().optional().describe('Rotation in degrees (default: -45)')
		}
	}, async ({ pdf_base64, text, font_size, color, opacity, rotation }) => {
		try {
			const { PDFDocument, rgb, StandardFonts, degrees } = await getPDFLib();

			// Validate hex color before parsing to catch NaN from short/invalid values.
			const rawColor = color ?? '#999999';
			if (!HEX_COLOR_RE.test(rawColor)) {
				return error(`Invalid color "${rawColor}". Use a 6-digit hex color like "#999999" or "999999".`);
			}
			const hex = rawColor.replace('#', '');
			const r = parseInt(hex.slice(0, 2), 16) / 255;
			const g = parseInt(hex.slice(2, 4), 16) / 255;
			const b = parseInt(hex.slice(4, 6), 16) / 255;

			const doc = await PDFDocument.load(b64ToBuffer(pdf_base64));
			const font = await doc.embedFont(StandardFonts.Helvetica);
			const fontSize = font_size ?? 48;

			for (const page of doc.getPages()) {
				const { width, height } = page.getSize();
				const textWidth = font.widthOfTextAtSize(text, fontSize);
				page.drawText(text, {
					x: (width - textWidth) / 2,
					y: height / 2,
					size: fontSize,
					font,
					color: rgb(r, g, b),
					opacity: opacity ?? 0.3,
					rotate: degrees(rotation ?? -45)
				});
			}
			return pdfResult(await doc.save(), { pages_watermarked: doc.getPageCount() });
		} catch (e) {
			console.error('[mcp/pdf] pdf_add_watermark error:', e);
			return error(`Failed to add watermark: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Add Page Numbers ──
	server.registerTool('pdf_add_page_numbers', {
		title: 'Add PDF Page Numbers',
		description: 'Add page numbers to all pages of a PDF.',
		inputSchema: {
			pdf_base64: BASE64_PDF,
			position: z
				.enum(['bottom-center', 'bottom-left', 'bottom-right', 'top-center', 'top-left', 'top-right'])
				.optional()
				.describe('Position of page numbers (default: bottom-center)'),
			format: z
				.string()
				.max(100)
				.optional()
				.describe('Format string — use {n} for page number and {total} for total pages (default: "{n}")'),
			font_size: z.number().optional().describe('Font size in points (default: 10)'),
			start_number: z.number().int().optional().describe('Starting page number (default: 1)')
		}
	}, async ({ pdf_base64, position, format, font_size, start_number }) => {
		try {
			const { PDFDocument, rgb, StandardFonts } = await getPDFLib();
			const doc = await PDFDocument.load(b64ToBuffer(pdf_base64));
			const font = await doc.embedFont(StandardFonts.Helvetica);
			const pages = doc.getPages();
			const total = pages.length;
			const fontSize = font_size ?? 10;
			const pos = position ?? 'bottom-center';
			const fmt = format ?? '{n}';
			const startNum = start_number ?? 1;
			const margin = 36; // 0.5 inch

			for (let i = 0; i < pages.length; i++) {
				const page = pages[i];
				const { width, height } = page.getSize();
				const pageNum = startNum + i;
				const text = fmt.replace('{n}', String(pageNum)).replace('{total}', String(total + startNum - 1));
				const textWidth = font.widthOfTextAtSize(text, fontSize);

				const isTop = pos.startsWith('top');
				const isLeft = pos.endsWith('left');
				const isRight = pos.endsWith('right');

				const y = isTop ? height - margin : margin;
				const x = isLeft ? margin : isRight ? width - margin - textWidth : (width - textWidth) / 2;

				page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
			}
			return pdfResult(await doc.save(), { pages_numbered: total });
		} catch (e) {
			console.error('[mcp/pdf] pdf_add_page_numbers error:', e);
			return error(`Failed to add page numbers: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Encrypt / Protect ──
	server.registerTool('pdf_protect', {
		title: 'Password-Protect PDF',
		description: 'Add password protection and permission restrictions to a PDF.',
		inputSchema: {
			pdf_base64: BASE64_PDF,
			user_password: z.string().describe('Password required to open the PDF'),
			owner_password: z.string().optional().describe('Owner password for full access (defaults to user_password)'),
			allow_printing: z.boolean().optional().describe('Allow printing (default: true)'),
			allow_copying: z.boolean().optional().describe('Allow copying text (default: true)'),
			allow_modifying: z.boolean().optional().describe('Allow modifications (default: false)'),
			allow_annotating: z.boolean().optional().describe('Allow annotations (default: false)')
		}
	}, async ({ pdf_base64, user_password, owner_password, allow_printing, allow_copying, allow_modifying, allow_annotating }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const doc = await PDFDocument.load(b64ToBuffer(pdf_base64));
			doc.encrypt({
				userPassword: user_password,
				ownerPassword: owner_password || user_password,
				permissions: {
					printing: (allow_printing ?? true) ? 'highResolution' : false,
					copying: allow_copying ?? true,
					modifying: allow_modifying ?? false,
					annotating: allow_annotating ?? false,
					fillingForms: (allow_annotating ?? false) || (allow_modifying ?? false),
					contentAccessibility: true
				}
			});
			return pdfResult(await doc.save());
		} catch (e) {
			console.error('[mcp/pdf] pdf_protect error:', e);
			return error(`Failed to protect PDF: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Unlock ──
	server.registerTool('pdf_unlock', {
		title: 'Unlock PDF',
		description: 'Remove password protection from a PDF by providing the password.',
		inputSchema: {
			pdf_base64: BASE64_PDF,
			password: z.string().describe('Password to unlock the PDF')
		}
	}, async ({ pdf_base64, password }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const doc = await PDFDocument.load(b64ToBuffer(pdf_base64), { password });
			const newDoc = await PDFDocument.create();
			const pages = await newDoc.copyPages(doc, doc.getPageIndices());
			for (const page of pages) newDoc.addPage(page);
			return pdfResult(await newDoc.save(), { page_count: newDoc.getPageCount() });
		} catch (e) {
			console.error('[mcp/pdf] pdf_unlock error:', e);
			return error(`Failed to unlock PDF: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Flatten ──
	server.registerTool('pdf_flatten', {
		title: 'Flatten PDF',
		description: 'Flatten form fields and annotations into static content, making them non-editable.',
		inputSchema: {
			pdf_base64: BASE64_PDF
		}
	}, async ({ pdf_base64 }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const doc = await PDFDocument.load(b64ToBuffer(pdf_base64), { ignoreEncryption: true });
			try {
				const form = doc.getForm();
				form.flatten();
			} catch {
				// No form fields — not an error.
			}
			return pdfResult(await doc.save());
		} catch (e) {
			console.error('[mcp/pdf] pdf_flatten error:', e);
			return error(`Failed to flatten PDF: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Crop ──
	server.registerTool('pdf_crop', {
		title: 'Crop PDF Pages',
		description: 'Crop margins from PDF pages. Margin values are in PDF points (72 points = 1 inch).',
		inputSchema: {
			pdf_base64: BASE64_PDF,
			top: z.number().min(0).describe('Points to trim from top'),
			right: z.number().min(0).describe('Points to trim from right'),
			bottom: z.number().min(0).describe('Points to trim from bottom'),
			left: z.number().min(0).describe('Points to trim from left'),
			pages: z.array(z.number().int().min(1)).optional().describe('Specific pages to crop (1-indexed). Omit to crop all pages.')
		}
	}, async ({ pdf_base64, top, right, bottom, left, pages: pageNums }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const doc = await PDFDocument.load(b64ToBuffer(pdf_base64));
			const allPages = doc.getPages();
			const pageCount = allPages.length;

			// Validate page numbers before proceeding.
			if (pageNums) {
				for (const p of pageNums) {
					if (p > pageCount) {
						return error(`Page ${p} does not exist (PDF has ${pageCount} pages)`);
					}
				}
			}

			const indices = pageNums ? pageNums.map((p) => p - 1) : allPages.map((_, i) => i);

			for (const i of indices) {
				const page = allPages[i];
				const box = page.getCropBox() ?? page.getMediaBox();
				const newWidth = box.width - left - right;
				const newHeight = box.height - top - bottom;
				if (newWidth <= 0 || newHeight <= 0) {
					return error(`Crop margins too large for page ${i + 1}`);
				}
				page.setMediaBox(box.x + left, box.y + bottom, newWidth, newHeight);
				page.setCropBox(box.x + left, box.y + bottom, newWidth, newHeight);
			}
			return pdfResult(await doc.save(), { pages_cropped: indices.length });
		} catch (e) {
			console.error('[mcp/pdf] pdf_crop error:', e);
			return error(`Failed to crop PDF: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Compress ──
	server.registerTool('pdf_compress', {
		title: 'Compress PDF',
		description: 'Reduce PDF file size by stripping metadata and using object streams.',
		inputSchema: {
			pdf_base64: BASE64_PDF
		}
	}, async ({ pdf_base64 }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const originalBuf = b64ToBuffer(pdf_base64);
			const doc = await PDFDocument.load(originalBuf);
			doc.setTitle('');
			doc.setAuthor('');
			doc.setSubject('');
			doc.setKeywords([]);
			doc.setProducer('');
			doc.setCreator('');
			const data = await doc.save({ useObjectStreams: true, addDefaultPage: false });
			return pdfResult(data, {
				original_size_bytes: originalBuf.byteLength,
				compressed_size_bytes: data.length,
				savings_percent: Math.round((1 - data.length / originalBuf.byteLength) * 100)
			});
		} catch (e) {
			console.error('[mcp/pdf] pdf_compress error:', e);
			return error(`Failed to compress PDF: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Set Metadata ──
	server.registerTool('pdf_set_metadata', {
		title: 'Set PDF Metadata',
		description: 'Set or update title, author, subject, and keywords of a PDF.',
		inputSchema: {
			pdf_base64: BASE64_PDF,
			title: z.string().optional().describe('Document title'),
			author: z.string().optional().describe('Author name'),
			subject: z.string().optional().describe('Subject'),
			keywords: z.array(z.string()).optional().describe('Keywords'),
			creator: z.string().optional().describe('Creator application name')
		}
	}, async ({ pdf_base64, title, author, subject, keywords, creator }) => {
		try {
			const { PDFDocument } = await getPDFLib();
			const doc = await PDFDocument.load(b64ToBuffer(pdf_base64));
			if (title !== undefined) doc.setTitle(title);
			if (author !== undefined) doc.setAuthor(author);
			if (subject !== undefined) doc.setSubject(subject);
			if (keywords !== undefined) doc.setKeywords(keywords);
			if (creator !== undefined) doc.setCreator(creator);
			return pdfResult(await doc.save());
		} catch (e) {
			console.error('[mcp/pdf] pdf_set_metadata error:', e);
			return error(`Failed to set metadata: ${e instanceof Error ? e.message : String(e)}`);
		}
	});
}
