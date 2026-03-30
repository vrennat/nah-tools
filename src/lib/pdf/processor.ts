/**
 * PDF Processing — wraps @cantoo/pdf-lib for client-side PDF manipulation.
 * All functions are async and lazily load the library on first use.
 */

import type {
	CropConfig,
	EditAnnotation,
	PageNumberConfig,
	PageRange,
	PdfAPreparationConfig,
	PdfAPreparationResult,
	PDFPermissions,
	ProgressCallback,
	SignatureField,
	TextFieldFill,
	WatermarkConfig
} from './types';

let PDFLib: typeof import('@cantoo/pdf-lib');

async function getPDFLib() {
	if (!PDFLib) {
		PDFLib = await import('@cantoo/pdf-lib');
	}
	return PDFLib;
}

/** Get page count from a PDF without full parsing */
export async function getPageCount(source: ArrayBuffer): Promise<number> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source, { ignoreEncryption: true });
	return doc.getPageCount();
}

/** Merge multiple PDFs into one */
export async function mergePDFs(
	files: ArrayBuffer[],
	onProgress?: ProgressCallback
): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const merged = await PDFDocument.create();

	for (let i = 0; i < files.length; i++) {
		const source = await PDFDocument.load(files[i]);
		const pages = await merged.copyPages(source, source.getPageIndices());
		for (const page of pages) {
			merged.addPage(page);
		}
		onProgress?.(i + 1, files.length);
	}

	return merged.save();
}

/** Split a PDF into separate documents by page ranges */
export async function splitPDF(
	source: ArrayBuffer,
	ranges: PageRange[]
): Promise<Uint8Array[]> {
	const { PDFDocument } = await getPDFLib();
	const srcDoc = await PDFDocument.load(source);
	const results: Uint8Array[] = [];

	for (const range of ranges) {
		const newDoc = await PDFDocument.create();
		const indices = [];
		for (let i = range.start - 1; i < range.end; i++) {
			indices.push(i);
		}
		const pages = await newDoc.copyPages(srcDoc, indices);
		for (const page of pages) {
			newDoc.addPage(page);
		}
		results.push(await newDoc.save());
	}

	return results;
}

/** Rotate specific pages (rotations is a map of 0-based page index to degrees: 90, 180, 270) */
export async function rotatePages(
	source: ArrayBuffer,
	rotations: Map<number, number>
): Promise<Uint8Array> {
	const { PDFDocument, degrees } = await getPDFLib();
	const doc = await PDFDocument.load(source);

	for (const [pageIndex, rotation] of rotations) {
		const page = doc.getPage(pageIndex);
		const current = page.getRotation().angle;
		page.setRotation(degrees((current + rotation) % 360));
	}

	return doc.save();
}

/** Remove pages by their 0-based indices */
export async function removePages(
	source: ArrayBuffer,
	pageIndicesToRemove: number[]
): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source);

	// Remove from end to avoid index shifting
	const sorted = [...pageIndicesToRemove].sort((a, b) => b - a);
	for (const index of sorted) {
		doc.removePage(index);
	}

	return doc.save();
}

/** Reorder pages according to a new index order */
export async function reorderPages(
	source: ArrayBuffer,
	newOrder: number[]
): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const srcDoc = await PDFDocument.load(source);
	const newDoc = await PDFDocument.create();

	const pages = await newDoc.copyPages(srcDoc, newOrder);
	for (const page of pages) {
		newDoc.addPage(page);
	}

	return newDoc.save();
}

/** Convert images to a PDF document */
export async function imagesToPDF(
	images: { data: ArrayBuffer; type: 'png' | 'jpg' }[],
	pageSize: 'a4' | 'letter' | 'fit' = 'fit',
	onProgress?: ProgressCallback
): Promise<Uint8Array> {
	const { PDFDocument, PageSizes } = await getPDFLib();
	const doc = await PDFDocument.create();

	for (let i = 0; i < images.length; i++) {
		const img = images[i];
		const embedded =
			img.type === 'png'
				? await doc.embedPng(img.data)
				: await doc.embedJpg(img.data);

		const imgWidth = embedded.width;
		const imgHeight = embedded.height;

		let pageWidth: number;
		let pageHeight: number;

		if (pageSize === 'fit') {
			pageWidth = imgWidth;
			pageHeight = imgHeight;
		} else {
			const [w, h] = pageSize === 'a4' ? PageSizes.A4 : PageSizes.Letter;
			pageWidth = w;
			pageHeight = h;
		}

		const page = doc.addPage([pageWidth, pageHeight]);

		if (pageSize === 'fit') {
			page.drawImage(embedded, { x: 0, y: 0, width: imgWidth, height: imgHeight });
		} else {
			// Scale to fit within page with margins
			const margin = 36; // 0.5 inch
			const availW = pageWidth - margin * 2;
			const availH = pageHeight - margin * 2;
			const scale = Math.min(availW / imgWidth, availH / imgHeight, 1);
			const w = imgWidth * scale;
			const h = imgHeight * scale;
			const x = (pageWidth - w) / 2;
			const y = (pageHeight - h) / 2;
			page.drawImage(embedded, { x, y, width: w, height: h });
		}

		onProgress?.(i + 1, images.length);
	}

	return doc.save();
}

/** Basic PDF compression — strips metadata and removes duplicate objects */
export async function compressPDF(source: ArrayBuffer): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source);

	// Strip metadata
	doc.setTitle('');
	doc.setAuthor('');
	doc.setSubject('');
	doc.setKeywords([]);
	doc.setProducer('');
	doc.setCreator('');

	return doc.save({
		useObjectStreams: true,
		addDefaultPage: false
	});
}

/** Flatten form fields and annotations into static content */
export async function flattenPDF(source: ArrayBuffer): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source, { ignoreEncryption: true });
	try {
		const form = doc.getForm();
		form.flatten();
	} catch {
		// No form fields — re-save for optimization
	}
	return doc.save();
}

/** Add page numbers to a PDF */
export async function addPageNumbers(
	source: ArrayBuffer,
	config: PageNumberConfig
): Promise<Uint8Array> {
	const { PDFDocument, rgb, StandardFonts } = await getPDFLib();
	const doc = await PDFDocument.load(source);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();
	const total = pages.length;

	const colorValue = 0.3; // dark gray

	for (let i = 0; i < pages.length; i++) {
		const page = pages[i];
		const { width, height } = page.getSize();
		const pageNum = config.startNumber + i;
		const text = config.format
			.replace('{n}', String(pageNum))
			.replace('{total}', String(total + config.startNumber - 1));

		const textWidth = font.widthOfTextAtSize(text, config.fontSize);

		let x: number;
		let y: number;

		const isTop = config.position.startsWith('top');
		const isLeft = config.position.endsWith('left');
		const isRight = config.position.endsWith('right');

		y = isTop ? height - config.margin : config.margin;

		if (isLeft) {
			x = config.margin;
		} else if (isRight) {
			x = width - config.margin - textWidth;
		} else {
			x = (width - textWidth) / 2;
		}

		page.drawText(text, {
			x,
			y,
			size: config.fontSize,
			font,
			color: rgb(colorValue, colorValue, colorValue)
		});
	}

	return doc.save();
}

/** Get page dimensions (width, height in points) for all pages */
export async function getPageSizes(source: ArrayBuffer): Promise<{ width: number; height: number }[]> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source, { ignoreEncryption: true });
	return doc.getPages().map((p) => p.getSize());
}

/** Crop pages by trimming margins. Margins are in PDF points (1/72 inch). */
export async function cropPages(
	source: ArrayBuffer,
	config: CropConfig,
	pageIndices?: number[]
): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source);
	const pages = doc.getPages();
	const indices = pageIndices ?? pages.map((_, i) => i);

	for (const i of indices) {
		const page = pages[i];
		const box = page.getCropBox() ?? page.getMediaBox();

		const newX = box.x + config.left;
		const newY = box.y + config.bottom;
		const newWidth = box.width - config.left - config.right;
		const newHeight = box.height - config.top - config.bottom;

		if (newWidth <= 0 || newHeight <= 0) {
			throw new Error(
				`Crop margins too large for page ${i + 1} (${Math.round(box.width)} × ${Math.round(box.height)} pt)`
			);
		}

		page.setMediaBox(newX, newY, newWidth, newHeight);
		page.setCropBox(newX, newY, newWidth, newHeight);
	}

	return doc.save();
}

/** Add password protection and encryption to a PDF */
export async function protectPDF(
	source: ArrayBuffer,
	userPassword: string,
	ownerPassword: string,
	permissions: PDFPermissions
): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source);

	doc.encrypt({
		userPassword,
		ownerPassword: ownerPassword || userPassword,
		permissions: {
			printing: permissions.printing ? 'highResolution' : false,
			copying: permissions.copying,
			modifying: permissions.modifying,
			annotating: permissions.annotating,
			fillingForms: permissions.annotating || permissions.modifying,
			contentAccessibility: true
		}
	});

	return doc.save();
}

/** Remove password protection from a PDF by loading with the password and re-saving */
export async function unlockPDF(
	source: ArrayBuffer,
	password: string
): Promise<Uint8Array> {
	const { PDFDocument } = await getPDFLib();
	const doc = await PDFDocument.load(source, { password });

	// Copy all pages to a fresh (unencrypted) document
	const newDoc = await PDFDocument.create();
	const pages = await newDoc.copyPages(doc, doc.getPageIndices());
	for (const page of pages) {
		newDoc.addPage(page);
	}

	return newDoc.save();
}

/** Add a text watermark to all pages */
export async function addWatermark(
	source: ArrayBuffer,
	config: WatermarkConfig
): Promise<Uint8Array> {
	const { PDFDocument, rgb, StandardFonts, degrees } = await getPDFLib();
	const doc = await PDFDocument.load(source);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();

	// Parse hex color
	const hex = config.color.replace('#', '');
	if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
		throw new Error(`Invalid hex color: ${config.color}`);
	}
	const r = parseInt(hex.slice(0, 2), 16) / 255;
	const g = parseInt(hex.slice(2, 4), 16) / 255;
	const b = parseInt(hex.slice(4, 6), 16) / 255;

	for (const page of pages) {
		const { width, height } = page.getSize();
		const textWidth = font.widthOfTextAtSize(config.text, config.fontSize);

		page.drawText(config.text, {
			x: (width - textWidth) / 2,
			y: height / 2,
			size: config.fontSize,
			font,
			color: rgb(r, g, b),
			opacity: config.opacity,
			rotate: degrees(config.rotation)
		});
	}

	return doc.save();
}

function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Best-effort PDF/A preparation — adds metadata, strips JS, embeds sRGB profile */
export async function preparePdfA(
	source: ArrayBuffer,
	config: PdfAPreparationConfig
): Promise<PdfAPreparationResult> {
	const { PDFDocument, PDFName, PDFString, PDFDict } = await getPDFLib();
	const doc = await PDFDocument.load(source, { ignoreEncryption: true });
	const warnings: string[] = [];

	// 1. Set document metadata
	const title = config.title || doc.getTitle() || 'Untitled';
	doc.setTitle(title);
	doc.setProducer('nah.tools PDF/A Preparation');
	doc.setModificationDate(new Date());
	if (!doc.getCreationDate()) doc.setCreationDate(new Date());

	// 2. Strip JavaScript from catalog
	const catalog = doc.catalog;
	if (catalog.has(PDFName.of('Names'))) {
		const names = catalog.lookup(PDFName.of('Names'));
		if (names instanceof PDFDict && names.has(PDFName.of('JavaScript'))) {
			names.delete(PDFName.of('JavaScript'));
			warnings.push('JavaScript actions were removed from the document.');
		}
	}
	if (catalog.has(PDFName.of('AA'))) {
		catalog.delete(PDFName.of('AA'));
		warnings.push('Additional actions (AA) were removed from the catalog.');
	}

	// 3. Add XMP metadata stream
	const part = config.conformanceLevel === 'PDF/A-1b' ? '1' : '2';
	const conformance = 'B';
	const now = new Date().toISOString();
	const xmp = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about=""
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:xmp="http://ns.adobe.com/xap/1.0/"
  xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
  xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
  <pdfaid:part>${part}</pdfaid:part>
  <pdfaid:conformance>${conformance}</pdfaid:conformance>
  <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(title)}</rdf:li></rdf:Alt></dc:title>
  <xmp:CreateDate>${now}</xmp:CreateDate>
  <xmp:ModifyDate>${now}</xmp:ModifyDate>
  <pdf:Producer>nah.tools PDF/A Preparation</pdf:Producer>
</rdf:Description>
</rdf:RDF>
</x:xmpmeta>
${' '.repeat(2048)}
<?xpacket end="w"?>`;

	const xmpBytes = new TextEncoder().encode(xmp);
	const metadataStream = doc.context.stream(xmpBytes, {
		Type: 'Metadata',
		Subtype: 'XML',
		Length: xmpBytes.length
	});
	const metadataRef = doc.context.register(metadataStream);
	catalog.set(PDFName.of('Metadata'), metadataRef);

	// 4. Add sRGB ICC output intent
	const { SRGB_ICC_PROFILE } = await import('./srgb-icc');
	const iccStream = doc.context.stream(SRGB_ICC_PROFILE, {
		N: 3,
		Length: SRGB_ICC_PROFILE.length
	});
	const iccRef = doc.context.register(iccStream);

	const outputIntentDict = doc.context.obj({
		Type: 'OutputIntent',
		S: 'GTS_PDFA1',
		OutputConditionIdentifier: PDFString.of('sRGB IEC61966-2.1'),
		DestOutputProfile: iccRef
	});
	const outputIntentRef = doc.context.register(outputIntentDict);
	catalog.set(PDFName.of('OutputIntents'), doc.context.obj([outputIntentRef]));

	// 5. Warnings about limitations
	warnings.push(
		'Font embedding was not verified. If fonts are missing from the source PDF, the output may not pass strict PDF/A validation.'
	);
	if (config.conformanceLevel === 'PDF/A-1b') {
		warnings.push(
			'Transparency (if present) was not flattened. PDF/A-1b prohibits transparency.'
		);
	}

	return { data: await doc.save(), warnings };
}

/** Parse a hex color string to r, g, b values (0-1 range) */
function parseHex(hex: string): { r: number; g: number; b: number } {
	const clean = hex.replace('#', '');
	return {
		r: parseInt(clean.slice(0, 2), 16) / 255,
		g: parseInt(clean.slice(2, 4), 16) / 255,
		b: parseInt(clean.slice(4, 6), 16) / 255
	};
}

/** Burn annotations (text, image, draw) into a PDF */
export async function editPDF(
	source: ArrayBuffer,
	annotations: EditAnnotation[]
): Promise<Uint8Array> {
	const { PDFDocument, rgb, StandardFonts } = await getPDFLib();
	const doc = await PDFDocument.load(source);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();

	for (const ann of annotations) {
		const page = pages[ann.pageIndex];
		if (!page) continue;

		if (ann.type === 'text') {
			const { r, g, b } = parseHex(ann.color);
			page.drawText(ann.text, {
				x: ann.x,
				y: ann.y,
				size: ann.fontSize,
				font,
				color: rgb(r, g, b)
			});
		} else if (ann.type === 'image') {
			const embedded =
				ann.imageType === 'png'
					? await doc.embedPng(ann.data)
					: await doc.embedJpg(ann.data);
			page.drawImage(embedded, {
				x: ann.x,
				y: ann.y,
				width: ann.width,
				height: ann.height
			});
		} else if (ann.type === 'draw') {
			const { r, g, b } = parseHex(ann.strokeColor);
			for (const path of ann.paths) {
				if (path.length < 2) continue;
				for (let i = 0; i < path.length - 1; i++) {
					page.drawLine({
						start: { x: path[i].x, y: path[i].y },
						end: { x: path[i + 1].x, y: path[i + 1].y },
						thickness: ann.strokeWidth,
						color: rgb(r, g, b)
					});
				}
			}
		}
	}

	return doc.save();
}

/** Convert a data URL to a Uint8Array of raw image bytes */
function dataUrlToBytes(dataUrl: string): Uint8Array {
	const base64 = dataUrl.split(',')[1];
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

/** Fill text fields and place signatures on a PDF */
export async function fillAndSignPDF(
	source: ArrayBuffer,
	textFields: TextFieldFill[],
	signatures: SignatureField[]
): Promise<Uint8Array> {
	const { PDFDocument, rgb, StandardFonts } = await getPDFLib();
	const doc = await PDFDocument.load(source);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();

	// Draw text fields
	for (const tf of textFields) {
		if (tf.pageIndex < 0 || tf.pageIndex >= pages.length) continue;
		const page = pages[tf.pageIndex];

		const hex = tf.color.replace('#', '');
		const r = parseInt(hex.slice(0, 2), 16) / 255;
		const g = parseInt(hex.slice(2, 4), 16) / 255;
		const b = parseInt(hex.slice(4, 6), 16) / 255;

		page.drawText(tf.text, {
			x: tf.x,
			y: tf.y,
			size: tf.fontSize,
			font,
			color: rgb(r, g, b)
		});
	}

	// Draw signatures
	for (const sig of signatures) {
		if (sig.pageIndex < 0 || sig.pageIndex >= pages.length) continue;
		const page = pages[sig.pageIndex];
		const imgBytes = dataUrlToBytes(sig.data);

		const isPng = sig.data.startsWith('data:image/png');
		const embedded = isPng
			? await doc.embedPng(imgBytes)
			: await doc.embedJpg(imgBytes);

		page.drawImage(embedded, {
			x: sig.x,
			y: sig.y,
			width: sig.width,
			height: sig.height
		});
	}

	return doc.save();
}
