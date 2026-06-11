/**
 * MCP Tools — PPTX Processing
 *
 * Server-side PowerPoint operations via JSZip + XML parsing.
 * All files are passed as base64-encoded strings.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { bufferToB64, MAX_BASE64_BYTES, MAX_MERGE_FILES } from './utils';

// Zip-bomb backstop: reject archives with unreasonably many entries.
const MAX_ZIP_ENTRIES = 10_000;

type JSZipType = typeof import('jszip');
let JSZipModule: JSZipType;

async function getJSZip() {
	if (!JSZipModule) {
		JSZipModule = (await import('jszip')) as unknown as JSZipType;
	}
	return (JSZipModule as unknown as { default: new () => import('jszip') }).default;
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

/**
 * Load a zip and reject it if the entry count looks like a zip bomb.
 */
async function safeLoadZip(JSZip: new () => import('jszip'), data: ArrayBuffer): Promise<import('jszip') | null> {
	const zip = await new JSZip().loadAsync(data);
	if (Object.keys(zip.files).length > MAX_ZIP_ENTRIES) return null;
	return zip;
}

const BASE64_PPTX = z
	.string()
	.max(MAX_BASE64_BYTES, `PPTX must be under ${MAX_BASE64_BYTES / 1_000_000} MB (base64)`)
	.describe('Base64-encoded PPTX file data');

// ── XML helpers ──

const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;
const serializer = typeof XMLSerializer !== 'undefined' ? new XMLSerializer() : null;

function parseXML(xmlString: string): Document {
	if (!parser) throw new Error('DOMParser not available');
	return parser.parseFromString(xmlString, 'application/xml');
}

function serializeXML(doc: Document): string {
	if (!serializer) throw new Error('XMLSerializer not available');
	return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
		serializer.serializeToString(doc.documentElement);
}

async function readXML(zip: import('jszip'), path: string): Promise<Document | null> {
	const file = zip.file(path);
	if (!file) return null;
	return parseXML(await file.async('text'));
}

function writeXML(zip: import('jszip'), path: string, doc: Document) {
	zip.file(path, serializeXML(doc));
}

function getSlideEntries(zip: import('jszip')): string[] {
	return Object.keys(zip.files)
		.filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
		.sort((a, b) => {
			const na = parseInt(a.match(/slide(\d+)/)?.[1] ?? '0');
			const nb = parseInt(b.match(/slide(\d+)/)?.[1] ?? '0');
			return na - nb;
		});
}

/**
 * Find the highest existing cNvPr id in the slide document so we can use max+1
 * for new shapes, avoiding id collisions.
 */
function nextShapeId(doc: Document): number {
	const nvPrs = doc.getElementsByTagName('p:cNvPr');
	let max = 0;
	for (let i = 0; i < nvPrs.length; i++) {
		const id = parseInt(nvPrs[i].getAttribute('id') ?? '0', 10);
		if (id > max) max = id;
	}
	return max + 1;
}

export function registerPPTXTools(server: McpServer) {
	// ── Get Info ──
	server.registerTool('pptx_get_info', {
		title: 'Get PPTX Info',
		description: 'Get slide count and document metadata from a PowerPoint file.',
		inputSchema: { pptx_base64: BASE64_PPTX },
		annotations: { readOnlyHint: true }
	}, async ({ pptx_base64 }) => {
		try {
			const JSZip = await getJSZip();
			const zip = await safeLoadZip(JSZip, b64ToBuffer(pptx_base64));
			if (!zip) return error('PPTX rejected: archive contains too many entries (possible zip bomb)');
			const slideCount = getSlideEntries(zip).length;

			// Parse metadata from docProps/core.xml
			const metadata: Record<string, string | null> = {};
			const core = await readXML(zip, 'docProps/core.xml');
			if (core) {
				for (const tag of ['dc:title', 'dc:subject', 'dc:creator', 'dc:description',
					'cp:lastModifiedBy', 'dcterms:created', 'dcterms:modified',
					'cp:revision', 'cp:category', 'cp:keywords']) {
					const el = core.getElementsByTagName(tag)[0];
					metadata[tag.split(':')[1]] = el?.textContent || null;
				}
			}

			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({ slide_count: slideCount, metadata }, null, 2)
				}]
			};
		} catch (e) {
			console.error('[mcp/pptx] pptx_get_info error:', e);
			return error(`Failed to read PPTX: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Extract Text ──
	server.registerTool('pptx_extract_text', {
		title: 'Extract Text from PPTX',
		description: 'Extract all text content from a PowerPoint file, organized by slide.',
		inputSchema: { pptx_base64: BASE64_PPTX },
		annotations: { readOnlyHint: true }
	}, async ({ pptx_base64 }) => {
		try {
			const JSZip = await getJSZip();
			const zip = await safeLoadZip(JSZip, b64ToBuffer(pptx_base64));
			if (!zip) return error('PPTX rejected: archive contains too many entries (possible zip bomb)');
			const slides = getSlideEntries(zip);
			const results: { slide: number; text: string }[] = [];

			for (let i = 0; i < slides.length; i++) {
				const doc = await readXML(zip, slides[i]);
				if (!doc) continue;
				const textParts: string[] = [];
				const paragraphs = doc.getElementsByTagName('a:p');
				for (let p = 0; p < paragraphs.length; p++) {
					const runs = paragraphs[p].getElementsByTagName('a:t');
					const parts: string[] = [];
					for (let r = 0; r < runs.length; r++) {
						if (runs[r].textContent) parts.push(runs[r].textContent!);
					}
					if (parts.length) textParts.push(parts.join(''));
				}
				results.push({ slide: i + 1, text: textParts.join('\n') });
			}

			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({ slide_count: slides.length, slides: results }, null, 2)
				}]
			};
		} catch (e) {
			console.error('[mcp/pptx] pptx_extract_text error:', e);
			return error(`Failed to extract text: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Remove Notes ──
	server.registerTool('pptx_remove_notes', {
		title: 'Remove Speaker Notes from PPTX',
		description: 'Strip all speaker notes from a PowerPoint file.',
		inputSchema: { pptx_base64: BASE64_PPTX }
	}, async ({ pptx_base64 }) => {
		try {
			const JSZip = await getJSZip();
			const zip = await safeLoadZip(JSZip, b64ToBuffer(pptx_base64));
			if (!zip) return error('PPTX rejected: archive contains too many entries (possible zip bomb)');
			let removed = 0;

			// Remove notesSlide files and their references
			const noteFiles = Object.keys(zip.files).filter((p) => p.startsWith('ppt/notesSlides/'));
			for (const f of noteFiles) {
				zip.remove(f);
				removed++;
			}

			// Remove relationships to notes slides
			const relFiles = Object.keys(zip.files).filter((p) =>
				p.match(/^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/)
			);
			for (const relPath of relFiles) {
				const doc = await readXML(zip, relPath);
				if (!doc) continue;
				const rels = doc.getElementsByTagName('Relationship');
				let modified = false;
				for (let i = rels.length - 1; i >= 0; i--) {
					const target = rels[i].getAttribute('Target') || '';
					if (target.includes('notesSlides/')) {
						rels[i].parentNode?.removeChild(rels[i]);
						modified = true;
					}
				}
				if (modified) writeXML(zip, relPath, doc);
			}

			const data = await zip.generateAsync({ type: 'uint8array' });
			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						pptx_base64: bufferToB64(data),
						size_bytes: data.length,
						notes_removed: removed
					})
				}]
			};
		} catch (e) {
			console.error('[mcp/pptx] pptx_remove_notes error:', e);
			return error(`Failed to remove notes: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Remove Animations ──
	server.registerTool('pptx_remove_animations', {
		title: 'Remove Animations from PPTX',
		description: 'Strip all animations and transitions from a PowerPoint file.',
		inputSchema: { pptx_base64: BASE64_PPTX }
	}, async ({ pptx_base64 }) => {
		try {
			const JSZip = await getJSZip();
			const zip = await safeLoadZip(JSZip, b64ToBuffer(pptx_base64));
			if (!zip) return error('PPTX rejected: archive contains too many entries (possible zip bomb)');
			const slides = getSlideEntries(zip);

			for (const slidePath of slides) {
				const doc = await readXML(zip, slidePath);
				if (!doc) continue;
				let modified = false;

				// Remove animation elements
				for (const tag of ['p:timing', 'mc:AlternateContent']) {
					const elements = doc.getElementsByTagName(tag);
					for (let i = elements.length - 1; i >= 0; i--) {
						elements[i].parentNode?.removeChild(elements[i]);
						modified = true;
					}
				}

				// Remove transition elements
				const transitions = doc.getElementsByTagName('p:transition');
				for (let i = transitions.length - 1; i >= 0; i--) {
					transitions[i].parentNode?.removeChild(transitions[i]);
					modified = true;
				}

				if (modified) writeXML(zip, slidePath, doc);
			}

			const data = await zip.generateAsync({ type: 'uint8array' });
			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						pptx_base64: bufferToB64(data),
						size_bytes: data.length,
						slides_processed: slides.length
					})
				}]
			};
		} catch (e) {
			console.error('[mcp/pptx] pptx_remove_animations error:', e);
			return error(`Failed to remove animations: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Add Watermark ──
	server.registerTool('pptx_add_watermark', {
		title: 'Add Watermark to PPTX',
		description: 'Add a text watermark to all slides in a PowerPoint file.',
		inputSchema: {
			pptx_base64: BASE64_PPTX,
			text: z.string().max(1000).describe('Watermark text'),
			font_size: z.number().optional().describe('Font size in points (default: 48)'),
			color: z.string().optional().describe('Hex color without # (default: "999999")'),
			opacity: z.number().min(0).max(100).optional().describe('Opacity 0-100 (default: 30)'),
			rotation: z.number().optional().describe('Rotation in degrees (default: -45)')
		}
	}, async ({ pptx_base64, text, font_size, color, opacity, rotation }) => {
		try {
			const JSZip = await getJSZip();
			const zip = await safeLoadZip(JSZip, b64ToBuffer(pptx_base64));
			if (!zip) return error('PPTX rejected: archive contains too many entries (possible zip bomb)');
			const slides = getSlideEntries(zip);
			const fontSize = font_size ?? 48;
			const hexColor = (color ?? '999999').replace('#', '');
			const opacityPct = opacity ?? 30;
			const rot = rotation ?? -45;

			// <a:rPr sz> expects hundredths of a point (e.g. 48pt → 4800).
			// EMUs (914400/inch) are used for xfrm/off/ext, not for font size.
			const fontSizeHdp = Math.round(fontSize * 100);
			// Rotation in 60,000ths of a degree
			const rotEMU = rot * 60000;
			// Opacity in 1000ths of a percent (100% = 100000)
			const opacityVal = Math.round(opacityPct * 1000);

			for (const slidePath of slides) {
				const doc = await readXML(zip, slidePath);
				if (!doc) continue;

				const spTree = doc.getElementsByTagName('p:spTree')[0];
				if (!spTree) continue;

				// Use max existing shape id + 1 to avoid id collisions.
				const shapeId = nextShapeId(doc);

				// Create a watermark shape
				const watermarkXml = `<p:sp xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
					<p:nvSpPr>
						<p:cNvPr id="${shapeId}" name="Watermark"/>
						<p:cNvSpPr/>
						<p:nvPr/>
					</p:nvSpPr>
					<p:spPr>
						<a:xfrm rot="${rotEMU}">
							<a:off x="1524000" y="3048000"/>
							<a:ext cx="6096000" cy="914400"/>
						</a:xfrm>
						<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
						<a:noFill/>
					</p:spPr>
					<p:txBody>
						<a:bodyPr wrap="none" anchor="ctr"/>
						<a:lstStyle/>
						<a:p>
							<a:r>
								<a:rPr lang="en-US" sz="${fontSizeHdp}" dirty="0">
									<a:solidFill>
										<a:srgbClr val="${hexColor}">
											<a:alpha val="${opacityVal}"/>
										</a:srgbClr>
									</a:solidFill>
								</a:rPr>
								<a:t>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a:t>
							</a:r>
						</a:p>
					</p:txBody>
				</p:sp>`;

				const wmDoc = parseXML(watermarkXml);
				const imported = doc.importNode(wmDoc.documentElement, true);
				spTree.appendChild(imported);
				writeXML(zip, slidePath, doc);
			}

			const data = await zip.generateAsync({ type: 'uint8array' });
			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						pptx_base64: bufferToB64(data),
						size_bytes: data.length,
						slides_watermarked: slides.length
					})
				}]
			};
		} catch (e) {
			console.error('[mcp/pptx] pptx_add_watermark error:', e);
			return error(`Failed to add watermark: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Merge ──
	server.registerTool('pptx_merge', {
		title: 'Merge PPTX Files',
		description: 'Merge multiple PowerPoint files into one. Slides from subsequent files are appended after the first.',
		inputSchema: {
			pptxs_base64: z
				.array(
					z.string().max(MAX_BASE64_BYTES, `Each PPTX must be under ${MAX_BASE64_BYTES / 1_000_000} MB (base64)`)
				)
				.min(2)
				.max(MAX_MERGE_FILES, `Cannot merge more than ${MAX_MERGE_FILES} files at once`)
				.describe(`Array of base64-encoded PPTX files to merge (2–${MAX_MERGE_FILES} files)`)
		}
	}, async ({ pptxs_base64 }) => {
		try {
			// Import from the existing processor which handles the complex merge logic
			const { mergePPTX } = await import('$pptx/processor');
			const buffers = pptxs_base64.map((b64) => b64ToBuffer(b64));
			const result = await mergePPTX(buffers);
			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						pptx_base64: bufferToB64(result),
						size_bytes: result.length,
						files_merged: pptxs_base64.length
					})
				}]
			};
		} catch (e) {
			console.error('[mcp/pptx] pptx_merge error:', e);
			return error(`Failed to merge PPTX files: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Split ──
	server.registerTool('pptx_split', {
		title: 'Split PPTX',
		description: 'Split a PowerPoint file into multiple files by slide ranges. Slides are 1-indexed.',
		inputSchema: {
			pptx_base64: BASE64_PPTX,
			ranges: z
				.array(z.object({
					start: z.number().int().min(1).describe('Start slide (1-indexed, inclusive)'),
					end: z.number().int().min(1).describe('End slide (1-indexed, inclusive)')
				}))
				.min(1)
				.describe('Slide ranges to extract')
		}
	}, async ({ pptx_base64, ranges }) => {
		try {
			const { splitPPTX } = await import('$pptx/processor');
			const results = await splitPPTX(b64ToBuffer(pptx_base64), ranges);
			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						splits: results.map((data, i) => ({
							range: `${ranges[i].start}-${ranges[i].end}`,
							pptx_base64: bufferToB64(data)
						}))
					})
				}]
			};
		} catch (e) {
			console.error('[mcp/pptx] pptx_split error:', e);
			return error(`Failed to split PPTX: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Compress ──
	server.registerTool('pptx_compress', {
		title: 'Compress PPTX',
		// Server-side compression is ZIP re-compression only; image downsampling
		// requires canvas APIs that are not available in Cloudflare Workers.
		description: 'Reduce PowerPoint file size by re-compressing the ZIP container. Note: image downsampling is not available server-side — only ZIP-level compression is applied.',
		inputSchema: {
			pptx_base64: BASE64_PPTX,
			image_quality: z.number().min(0.1).max(1).optional().describe('Image quality 0.1-1.0 (has no effect server-side; included for API compatibility)')
		}
	}, async ({ pptx_base64 }) => {
		try {
			const { compressPPTX } = await import('$pptx/processor');
			const inputBuf = b64ToBuffer(pptx_base64);
			// image_quality is accepted but not used — canvas is unavailable in Workers.
			const result = await compressPPTX(inputBuf, 0.7);
			const savings = result.originalSize > 0
				? Math.round((1 - result.newSize / result.originalSize) * 100)
				: 0;
			const message = savings > 0
				? `ZIP re-compression saved ${savings}% (${result.originalSize} → ${result.newSize} bytes). Image downsampling was skipped (not available server-side).`
				: 'File was already optimally compressed; no size reduction achieved.';
			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						pptx_base64: bufferToB64(result.data),
						original_size_bytes: result.originalSize,
						compressed_size_bytes: result.newSize,
						savings_percent: savings,
						images_compressed: 0,
						note: message
					})
				}]
			};
		} catch (e) {
			console.error('[mcp/pptx] pptx_compress error:', e);
			return error(`Failed to compress PPTX: ${e instanceof Error ? e.message : String(e)}`);
		}
	});

	// ── Set Metadata ──
	server.registerTool('pptx_set_metadata', {
		title: 'Set PPTX Metadata',
		description: 'Set or update metadata (title, author, subject, etc.) on a PowerPoint file.',
		inputSchema: {
			pptx_base64: BASE64_PPTX,
			title: z.string().optional().describe('Document title'),
			author: z.string().optional().describe('Author name'),
			subject: z.string().optional().describe('Subject'),
			description: z.string().optional().describe('Description'),
			keywords: z.string().optional().describe('Keywords'),
			category: z.string().optional().describe('Category')
		}
	}, async ({ pptx_base64, title, author, subject, description, keywords, category }) => {
		try {
			const JSZip = await getJSZip();
			const zip = await safeLoadZip(JSZip, b64ToBuffer(pptx_base64));
			if (!zip) return error('PPTX rejected: archive contains too many entries (possible zip bomb)');
			const core = await readXML(zip, 'docProps/core.xml');
			if (!core) return error('No metadata file found in PPTX');

			const updates: Record<string, string | undefined> = {
				'dc:title': title,
				'dc:subject': subject,
				'dc:creator': author,
				'dc:description': description,
				'cp:keywords': keywords,
				'cp:category': category
			};

			for (const [tag, value] of Object.entries(updates)) {
				if (value === undefined) continue;
				const el = core.getElementsByTagName(tag)[0];
				if (el) {
					el.textContent = value;
				}
			}

			// Update modified date
			const modified = core.getElementsByTagName('dcterms:modified')[0];
			if (modified) modified.textContent = new Date().toISOString();

			writeXML(zip, 'docProps/core.xml', core);
			const data = await zip.generateAsync({ type: 'uint8array' });
			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						pptx_base64: bufferToB64(data),
						size_bytes: data.length
					})
				}]
			};
		} catch (e) {
			console.error('[mcp/pptx] pptx_set_metadata error:', e);
			return error(`Failed to set metadata: ${e instanceof Error ? e.message : String(e)}`);
		}
	});
}
