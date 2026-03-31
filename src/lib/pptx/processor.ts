/**
 * PPTX Processing — client-side PPTX manipulation via JSZip + DOMParser.
 * All functions are async and lazily load JSZip on first use.
 *
 * PPTX files are ZIP archives containing XML files (ECMA-376 Open XML).
 * Key paths inside a PPTX:
 *   ppt/presentation.xml       — slide list and deck properties
 *   ppt/slides/slideN.xml      — individual slide content
 *   ppt/slides/_rels/slideN.xml.rels — per-slide relationships
 *   ppt/slideMasters/           — slide master templates
 *   ppt/slideLayouts/           — slide layout templates
 *   ppt/theme/                  — theme definitions
 *   ppt/media/                  — embedded images/audio/video
 *   ppt/notesSlides/            — speaker notes
 *   docProps/core.xml           — document metadata
 *   docProps/app.xml            — application metadata
 *   [Content_Types].xml         — MIME type mappings
 */

import type {
	CompressResult,
	ExtractedImage,
	ExtractedText,
	PptxMetadata,
	ProgressCallback,
	SlideNumberConfig,
	SlideRange,
	WatermarkConfig
} from './types';

type JSZipType = typeof import('jszip');
let JSZipModule: JSZipType;

async function getJSZip() {
	if (!JSZipModule) {
		JSZipModule = (await import('jszip')) as unknown as JSZipType;
	}
	return (JSZipModule as unknown as { default: new () => import('jszip') }).default;
}

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

/** Read an XML file from a ZIP archive */
async function readXML(zip: import('jszip'), path: string): Promise<Document | null> {
	const file = zip.file(path);
	if (!file) return null;
	const text = await file.async('text');
	return parseXML(text);
}

/** Write an XML document back to a ZIP archive */
function writeXML(zip: import('jszip'), path: string, doc: Document) {
	zip.file(path, serializeXML(doc));
}

/** Get slide file paths sorted by slide number */
function getSlideEntries(zip: import('jszip')): string[] {
	return Object.keys(zip.files)
		.filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
		.sort((a, b) => {
			const numA = parseInt(a.match(/slide(\d+)/)![1]);
			const numB = parseInt(b.match(/slide(\d+)/)![1]);
			return numA - numB;
		});
}

// ── Slide Count ──────────────────────────────────────────────

/** Get slide count from a PPTX */
export async function getSlideCount(source: ArrayBuffer): Promise<number> {
	const JSZip = await getJSZip();
	const zip = await new JSZip().loadAsync(source);
	return getSlideEntries(zip).length;
}

// ── Merge ────────────────────────────────────────────────────

/** Merge multiple PPTX files into one */
export async function mergePPTX(
	files: ArrayBuffer[],
	onProgress?: ProgressCallback
): Promise<Uint8Array> {
	if (files.length === 0) throw new Error('No files to merge');
	if (files.length === 1) {
		const JSZip = await getJSZip();
		const zip = await new JSZip().loadAsync(files[0]);
		return zip.generateAsync({ type: 'uint8array' });
	}

	const JSZip = await getJSZip();
	const baseZip = await new JSZip().loadAsync(files[0]);
	onProgress?.(1, files.length);

	let nextSlideId = getSlideEntries(baseZip).length + 1;
	let nextMediaId = Object.keys(baseZip.files)
		.filter((p) => p.startsWith('ppt/media/'))
		.length + 1;

	const basePres = await readXML(baseZip, 'ppt/presentation.xml');
	if (!basePres) throw new Error('Invalid PPTX: missing presentation.xml');

	const baseContentTypes = await readXML(baseZip, '[Content_Types].xml');
	if (!baseContentTypes) throw new Error('Invalid PPTX: missing [Content_Types].xml');

	const basePresRels = await readXML(baseZip, 'ppt/_rels/presentation.xml.rels');
	if (!basePresRels) throw new Error('Invalid PPTX: missing presentation.xml.rels');

	// Find the default slide layout relationship from the first slide
	const firstSlideRels = await readXML(baseZip, 'ppt/slides/_rels/slide1.xml.rels');
	let defaultLayoutPath = 'ppt/slideLayouts/slideLayout1.xml';
	if (firstSlideRels) {
		const rels = firstSlideRels.getElementsByTagName('Relationship');
		for (let i = 0; i < rels.length; i++) {
			const target = rels[i].getAttribute('Target') || '';
			if (target.includes('slideLayout')) {
				defaultLayoutPath = 'ppt/' + target.replace(/^\.\.\//, '');
				break;
			}
		}
	}
	const defaultLayoutRelTarget = defaultLayoutPath.replace('ppt/', '../');

	// Get the highest existing rId in presentation.xml.rels
	let nextRId = 1;
	const existingRels = basePresRels.getElementsByTagName('Relationship');
	for (let i = 0; i < existingRels.length; i++) {
		const id = existingRels[i].getAttribute('Id') || '';
		const num = parseInt(id.replace('rId', ''));
		if (num >= nextRId) nextRId = num + 1;
	}

	for (let fileIdx = 1; fileIdx < files.length; fileIdx++) {
		const srcZip = await new JSZip().loadAsync(files[fileIdx]);
		const srcSlides = getSlideEntries(srcZip);

		// Build a map of source media files to new names
		const mediaMap = new Map<string, string>();
		const srcMediaFiles = Object.keys(srcZip.files).filter((p) => p.startsWith('ppt/media/'));
		for (const mediaPath of srcMediaFiles) {
			const ext = mediaPath.split('.').pop() || 'bin';
			const newName = `image${nextMediaId}.${ext}`;
			const newPath = `ppt/media/${newName}`;
			mediaMap.set(mediaPath, newPath);

			const data = await srcZip.file(mediaPath)!.async('uint8array');
			baseZip.file(newPath, data);

			// Add content type override if needed
			const mimeTypes: Record<string, string> = {
				png: 'image/png',
				jpg: 'image/jpeg',
				jpeg: 'image/jpeg',
				gif: 'image/gif',
				svg: 'image/svg+xml',
				emf: 'image/x-emf',
				wmf: 'image/x-wmf',
				tiff: 'image/tiff',
				tif: 'image/tiff'
			};
			if (mimeTypes[ext]) {
				// Default extensions are usually already declared; skip if present
			}
			nextMediaId++;
		}

		for (const srcSlidePath of srcSlides) {
			const slideNum = nextSlideId;
			const newSlidePath = `ppt/slides/slide${slideNum}.xml`;
			const newSlideRelsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;

			// Copy slide XML
			const slideContent = await srcZip.file(srcSlidePath)!.async('text');
			baseZip.file(newSlidePath, slideContent);

			// Copy/create slide relationships, remapping layout and media
			const srcSlideNum = srcSlidePath.match(/slide(\d+)/)![1];
			const srcRelsPath = `ppt/slides/_rels/slide${srcSlideNum}.xml.rels`;
			const srcRelsFile = srcZip.file(srcRelsPath);

			if (srcRelsFile) {
				let relsContent = await srcRelsFile.async('text');
				const relsDoc = parseXML(relsContent);
				const rels = relsDoc.getElementsByTagName('Relationship');

				for (let r = 0; r < rels.length; r++) {
					const target = rels[r].getAttribute('Target') || '';
					const type = rels[r].getAttribute('Type') || '';

					if (type.includes('/slideLayout')) {
						// Remap to base file's default layout
						rels[r].setAttribute('Target', defaultLayoutRelTarget);
					} else if (target.includes('../media/')) {
						// Remap media references
						const oldMediaPath = 'ppt/' + target.replace('../', '');
						const newMediaPath = mediaMap.get(oldMediaPath);
						if (newMediaPath) {
							rels[r].setAttribute('Target', '../' + newMediaPath.replace('ppt/', ''));
						}
					} else if (type.includes('/notesSlide')) {
						// Remove notes slide reference for simplicity
						rels[r].parentNode?.removeChild(rels[r]);
					}
				}
				writeXML(baseZip, newSlideRelsPath, relsDoc);
			} else {
				// Create minimal rels pointing to default layout
				const minRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="${defaultLayoutRelTarget}"/>
</Relationships>`;
				baseZip.file(newSlideRelsPath, minRels);
			}

			// Add slide relationship to presentation.xml.rels
			const newRelId = `rId${nextRId}`;
			const relEl = basePresRels.createElement('Relationship');
			relEl.setAttribute('Id', newRelId);
			relEl.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide');
			relEl.setAttribute('Target', `slides/slide${slideNum}.xml`);
			basePresRels.documentElement.appendChild(relEl);

			// Add slide to presentation.xml's slide list
			const sldIdLst = basePres.getElementsByTagName('p:sldIdLst')[0];
			if (sldIdLst) {
				const existingSldIds = sldIdLst.getElementsByTagName('p:sldId');
				let maxId = 255;
				for (let s = 0; s < existingSldIds.length; s++) {
					const id = parseInt(existingSldIds[s].getAttribute('id') || '0');
					if (id > maxId) maxId = id;
				}
				const sldId = basePres.createElementNS(
					'http://schemas.openxmlformats.org/presentationml/2006/main',
					'p:sldId'
				);
				sldId.setAttribute('id', String(maxId + 1));
				sldId.setAttributeNS(
					'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
					'r:id',
					newRelId
				);
				sldIdLst.appendChild(sldId);
			}

			// Add content type override
			const override = baseContentTypes.createElement('Override');
			override.setAttribute('PartName', `/ppt/slides/slide${slideNum}.xml`);
			override.setAttribute(
				'ContentType',
				'application/vnd.openxmlformats-officedocument.presentationml.slide+xml'
			);
			baseContentTypes.documentElement.appendChild(override);

			nextRId++;
			nextSlideId++;
		}

		onProgress?.(fileIdx + 1, files.length);
	}

	writeXML(baseZip, 'ppt/presentation.xml', basePres);
	writeXML(baseZip, 'ppt/_rels/presentation.xml.rels', basePresRels);
	writeXML(baseZip, '[Content_Types].xml', baseContentTypes);

	return baseZip.generateAsync({ type: 'uint8array' });
}

// ── Split ────────────────────────────────────────────────────

/** Split a PPTX into separate files by slide ranges */
export async function splitPPTX(
	source: ArrayBuffer,
	ranges: SlideRange[]
): Promise<Uint8Array[]> {
	const JSZip = await getJSZip();
	const srcZip = await new JSZip().loadAsync(source);
	const srcSlides = getSlideEntries(srcZip);
	const results: Uint8Array[] = [];

	for (const range of ranges) {
		const newZip = await new JSZip().loadAsync(await srcZip.generateAsync({ type: 'uint8array' }));

		// Remove all slides outside the range, then renumber
		const slidesToKeep = new Set<number>();
		for (let i = range.start; i <= range.end; i++) {
			slidesToKeep.add(i);
		}

		// Remove slides not in range
		const allSlides = getSlideEntries(newZip);
		const slidesToRemove: number[] = [];
		for (const slidePath of allSlides) {
			const num = parseInt(slidePath.match(/slide(\d+)/)![1]);
			if (!slidesToKeep.has(num)) {
				slidesToRemove.push(num);
			}
		}

		for (const num of slidesToRemove) {
			newZip.remove(`ppt/slides/slide${num}.xml`);
			newZip.remove(`ppt/slides/_rels/slide${num}.xml.rels`);
		}

		// Renumber remaining slides to be sequential from 1
		const keptSlides = getSlideEntries(newZip);
		const renameMap = new Map<number, number>();
		for (let i = 0; i < keptSlides.length; i++) {
			const oldNum = parseInt(keptSlides[i].match(/slide(\d+)/)![1]);
			const newNum = i + 1;
			renameMap.set(oldNum, newNum);
		}

		for (const [oldNum, newNum] of renameMap) {
			if (oldNum === newNum) continue;
			const slideData = await newZip.file(`ppt/slides/slide${oldNum}.xml`)!.async('text');
			newZip.remove(`ppt/slides/slide${oldNum}.xml`);
			newZip.file(`ppt/slides/slide${newNum}.xml`, slideData);

			const relsFile = newZip.file(`ppt/slides/_rels/slide${oldNum}.xml.rels`);
			if (relsFile) {
				const relsData = await relsFile.async('text');
				newZip.remove(`ppt/slides/_rels/slide${oldNum}.xml.rels`);
				newZip.file(`ppt/slides/_rels/slide${newNum}.xml.rels`, relsData);
			}
		}

		// Update presentation.xml to only reference kept slides
		const pres = await readXML(newZip, 'ppt/presentation.xml');
		const presRels = await readXML(newZip, 'ppt/_rels/presentation.xml.rels');
		if (pres && presRels) {
			// Find which rIds correspond to removed slides
			const relsToRemove = new Set<string>();
			const allRels = presRels.getElementsByTagName('Relationship');
			for (let i = allRels.length - 1; i >= 0; i--) {
				const target = allRels[i].getAttribute('Target') || '';
				const type = allRels[i].getAttribute('Type') || '';
				if (type.includes('/slide') && !type.includes('slideMaster') && !type.includes('slideLayout')) {
					const slideMatch = target.match(/slide(\d+)\.xml/);
					if (slideMatch) {
						const slideNum = parseInt(slideMatch[1]);
						if (!slidesToKeep.has(slideNum)) {
							relsToRemove.add(allRels[i].getAttribute('Id') || '');
							allRels[i].parentNode?.removeChild(allRels[i]);
						} else {
							// Update target to new number
							const newNum = renameMap.get(slideNum) || slideNum;
							allRels[i].setAttribute('Target', `slides/slide${newNum}.xml`);
						}
					}
				}
			}

			// Remove sldId entries for removed slides
			const sldIdLst = pres.getElementsByTagName('p:sldIdLst')[0];
			if (sldIdLst) {
				const sldIds = sldIdLst.getElementsByTagName('p:sldId');
				for (let i = sldIds.length - 1; i >= 0; i--) {
					const rId = sldIds[i].getAttributeNS(
						'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
						'id'
					) || sldIds[i].getAttribute('r:id') || '';
					if (relsToRemove.has(rId)) {
						sldIds[i].parentNode?.removeChild(sldIds[i]);
					}
				}
			}

			writeXML(newZip, 'ppt/presentation.xml', pres);
			writeXML(newZip, 'ppt/_rels/presentation.xml.rels', presRels);
		}

		// Update [Content_Types].xml
		const contentTypes = await readXML(newZip, '[Content_Types].xml');
		if (contentTypes) {
			const overrides = contentTypes.getElementsByTagName('Override');
			for (let i = overrides.length - 1; i >= 0; i--) {
				const partName = overrides[i].getAttribute('PartName') || '';
				const slideMatch = partName.match(/\/ppt\/slides\/slide(\d+)\.xml/);
				if (slideMatch) {
					const num = parseInt(slideMatch[1]);
					if (!slidesToKeep.has(num)) {
						overrides[i].parentNode?.removeChild(overrides[i]);
					} else {
						const newNum = renameMap.get(num) || num;
						overrides[i].setAttribute('PartName', `/ppt/slides/slide${newNum}.xml`);
					}
				}
			}
			writeXML(newZip, '[Content_Types].xml', contentTypes);
		}

		results.push(await newZip.generateAsync({ type: 'uint8array' }));
	}

	return results;
}

// ── Compress ─────────────────────────────────────────────────

/** Compress a PPTX by re-compressing images and stripping unnecessary data */
export async function compressPPTX(
	source: ArrayBuffer,
	imageQuality = 0.7
): Promise<CompressResult> {
	const JSZip = await getJSZip();
	const zip = await new JSZip().loadAsync(source);
	const originalSize = source.byteLength;
	let imagesCompressed = 0;

	// Remove thumbnail
	zip.remove('docProps/thumbnail.jpeg');
	zip.remove('docProps/thumbnail.png');

	// Remove printer settings
	for (const path of Object.keys(zip.files)) {
		if (path.includes('printerSettings')) {
			zip.remove(path);
		}
	}

	// Compress images
	const mediaFiles = Object.keys(zip.files).filter((p) => p.startsWith('ppt/media/'));
	for (const mediaPath of mediaFiles) {
		const ext = mediaPath.split('.').pop()?.toLowerCase();
		if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
			try {
				const imgData = await zip.file(mediaPath)!.async('blob');
				const compressed = await compressImage(imgData, imageQuality, ext === 'png' ? 'png' : 'jpeg');
				if (compressed.size < imgData.size) {
					zip.file(mediaPath, compressed);
					imagesCompressed++;
				}
			} catch {
				// Skip images that fail to process
			}
		}
	}

	const data = await zip.generateAsync({
		type: 'uint8array',
		compression: 'DEFLATE',
		compressionOptions: { level: 9 }
	});

	return {
		data,
		originalSize,
		newSize: data.byteLength,
		imagesCompressed
	};
}

/** Compress an image using Canvas API */
async function compressImage(
	blob: Blob,
	quality: number,
	format: 'jpeg' | 'png'
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(blob);

		img.onload = () => {
			// Scale down large images
			let { width, height } = img;
			const maxDim = 1920;
			if (width > maxDim || height > maxDim) {
				const scale = maxDim / Math.max(width, height);
				width = Math.round(width * scale);
				height = Math.round(height * scale);
			}

			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0, width, height);

			canvas.toBlob(
				(result) => {
					URL.revokeObjectURL(url);
					if (result) resolve(result);
					else reject(new Error('Canvas toBlob failed'));
				},
				format === 'jpeg' ? 'image/jpeg' : 'image/png',
				quality
			);
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to load image'));
		};

		img.src = url;
	});
}

// ── Extract Images ───────────────────────────────────────────

/** Extract all embedded images from a PPTX */
export async function extractImages(source: ArrayBuffer): Promise<ExtractedImage[]> {
	const JSZip = await getJSZip();
	const zip = await new JSZip().loadAsync(source);
	const images: ExtractedImage[] = [];

	const mimeTypes: Record<string, string> = {
		png: 'image/png',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		gif: 'image/gif',
		svg: 'image/svg+xml',
		emf: 'image/x-emf',
		wmf: 'image/x-wmf',
		tiff: 'image/tiff',
		tif: 'image/tiff',
		bmp: 'image/bmp'
	};

	const mediaFiles = Object.keys(zip.files)
		.filter((p) => p.startsWith('ppt/media/'))
		.sort();

	for (const path of mediaFiles) {
		const name = path.split('/').pop() || 'unknown';
		const ext = name.split('.').pop()?.toLowerCase() || '';
		const type = mimeTypes[ext] || 'application/octet-stream';

		const data = await zip.file(path)!.async('blob');
		images.push({ name, data: new Blob([data], { type }), type });
	}

	return images;
}

// ── Extract Text ─────────────────────────────────────────────

/** Extract text from all slides in a PPTX */
export async function extractText(source: ArrayBuffer): Promise<ExtractedText[]> {
	const JSZip = await getJSZip();
	const zip = await new JSZip().loadAsync(source);
	const slides = getSlideEntries(zip);
	const results: ExtractedText[] = [];

	for (let i = 0; i < slides.length; i++) {
		const doc = await readXML(zip, slides[i]);
		if (!doc) continue;

		const textElements = doc.getElementsByTagNameNS(
			'http://schemas.openxmlformats.org/drawingml/2006/main',
			't'
		);

		const paragraphs: string[] = [];
		let currentParagraph = '';

		// Walk through text runs, grouping by paragraph
		const allElements = doc.getElementsByTagNameNS(
			'http://schemas.openxmlformats.org/drawingml/2006/main',
			'*'
		);

		for (let j = 0; j < allElements.length; j++) {
			const el = allElements[j];
			if (el.localName === 'p') {
				if (currentParagraph) {
					paragraphs.push(currentParagraph);
					currentParagraph = '';
				}
			} else if (el.localName === 't') {
				currentParagraph += el.textContent || '';
			}
		}
		if (currentParagraph) paragraphs.push(currentParagraph);

		results.push({
			slideNumber: i + 1,
			text: paragraphs.join('\n')
		});
	}

	return results;
}

// ── Remove Speaker Notes ─────────────────────────────────────

/** Remove all speaker notes from a PPTX */
export async function removeNotes(source: ArrayBuffer): Promise<Uint8Array> {
	const JSZip = await getJSZip();
	const zip = await new JSZip().loadAsync(source);

	// Remove all notesSlides
	for (const path of Object.keys(zip.files)) {
		if (path.startsWith('ppt/notesSlides/')) {
			zip.remove(path);
		}
	}

	// Remove notes references from slide relationships
	const slides = getSlideEntries(zip);
	for (const slidePath of slides) {
		const slideNum = slidePath.match(/slide(\d+)/)![1];
		const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
		const relsDoc = await readXML(zip, relsPath);
		if (!relsDoc) continue;

		const rels = relsDoc.getElementsByTagName('Relationship');
		for (let i = rels.length - 1; i >= 0; i--) {
			const type = rels[i].getAttribute('Type') || '';
			if (type.includes('/notesSlide')) {
				rels[i].parentNode?.removeChild(rels[i]);
			}
		}
		writeXML(zip, relsPath, relsDoc);
	}

	// Remove content type overrides for notes
	const contentTypes = await readXML(zip, '[Content_Types].xml');
	if (contentTypes) {
		const overrides = contentTypes.getElementsByTagName('Override');
		for (let i = overrides.length - 1; i >= 0; i--) {
			const partName = overrides[i].getAttribute('PartName') || '';
			if (partName.includes('notesSlide')) {
				overrides[i].parentNode?.removeChild(overrides[i]);
			}
		}
		writeXML(zip, '[Content_Types].xml', contentTypes);
	}

	// Also remove the notesMasters
	for (const path of Object.keys(zip.files)) {
		if (path.startsWith('ppt/notesMasters/')) {
			zip.remove(path);
		}
	}

	return zip.generateAsync({ type: 'uint8array' });
}

// ── Add Watermark ────────────────────────────────────────────

/** Add a text watermark to all slides */
export async function addWatermark(
	source: ArrayBuffer,
	config: WatermarkConfig
): Promise<Uint8Array> {
	const JSZip = await getJSZip();
	const zip = await new JSZip().loadAsync(source);
	const slides = getSlideEntries(zip);

	// Convert hex color to OOXML color (RRGGBB without #)
	const hexColor = config.color.replace('#', '');

	// Convert opacity to OOXML alpha (0-100000, where 100000 = fully opaque)
	const alpha = Math.round(config.opacity * 100000);

	// EMU conversion: 1 inch = 914400 EMU
	// Standard slide size: 10 x 7.5 inches = 9144000 x 6858000 EMU
	const slideW = 9144000;
	const slideH = 6858000;

	// Font size in hundredths of a point
	const fontSize = config.fontSize * 100;

	// Rotation in 60,000ths of a degree
	const rotation = config.rotation * 60000;

	const watermarkShape = `<p:sp xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:nvSpPr>
    <p:cNvPr id="99999" name="Watermark"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm rot="${rotation}">
      <a:off x="0" y="0"/>
      <a:ext cx="${slideW}" cy="${slideH}"/>
    </a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    <a:noFill/>
  </p:spPr>
  <p:txBody>
    <a:bodyPr wrap="none" anchor="ctr" anchorCtr="1"/>
    <a:lstStyle/>
    <a:p>
      <a:pPr algn="ctr"/>
      <a:r>
        <a:rPr lang="en-US" sz="${fontSize}" dirty="0">
          <a:solidFill>
            <a:srgbClr val="${hexColor}">
              <a:alpha val="${alpha}"/>
            </a:srgbClr>
          </a:solidFill>
        </a:rPr>
        <a:t>${escapeXml(config.text)}</a:t>
      </a:r>
    </a:p>
  </p:txBody>
</p:sp>`;

	for (const slidePath of slides) {
		const doc = await readXML(zip, slidePath);
		if (!doc) continue;

		const spTree = doc.getElementsByTagNameNS(
			'http://schemas.openxmlformats.org/presentationml/2006/main',
			'spTree'
		)[0];

		if (!spTree) continue;

		// Parse the watermark shape and import it
		const wmDoc = parseXML(`<root xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${watermarkShape}</root>`);
		const wmShape = wmDoc.documentElement.firstElementChild;
		if (wmShape) {
			const imported = doc.importNode(wmShape, true);
			spTree.appendChild(imported);
		}

		writeXML(zip, slidePath, doc);
	}

	return zip.generateAsync({ type: 'uint8array' });
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

// ── Remove Animations ────────────────────────────────────────

/** Remove all animations and transitions from a PPTX */
export async function removeAnimations(source: ArrayBuffer): Promise<Uint8Array> {
	const JSZip = await getJSZip();
	const zip = await new JSZip().loadAsync(source);
	const slides = getSlideEntries(zip);

	for (const slidePath of slides) {
		const doc = await readXML(zip, slidePath);
		if (!doc) continue;

		// Remove <p:timing> elements (all animations)
		const timingElements = doc.getElementsByTagNameNS(
			'http://schemas.openxmlformats.org/presentationml/2006/main',
			'timing'
		);
		for (let i = timingElements.length - 1; i >= 0; i--) {
			timingElements[i].parentNode?.removeChild(timingElements[i]);
		}

		// Remove <p:transition> elements (slide transitions)
		const transitionElements = doc.getElementsByTagNameNS(
			'http://schemas.openxmlformats.org/presentationml/2006/main',
			'transition'
		);
		for (let i = transitionElements.length - 1; i >= 0; i--) {
			transitionElements[i].parentNode?.removeChild(transitionElements[i]);
		}

		writeXML(zip, slidePath, doc);
	}

	return zip.generateAsync({ type: 'uint8array' });
}

// ── Add Slide Numbers ────────────────────────────────────────

/** Add slide numbers to all slides */
export async function addSlideNumbers(
	source: ArrayBuffer,
	config: SlideNumberConfig
): Promise<Uint8Array> {
	const JSZip = await getJSZip();
	const zip = await new JSZip().loadAsync(source);
	const slides = getSlideEntries(zip);

	const fontSize = config.fontSize * 100;

	// Position calculations (EMU)
	const margin = 457200; // 0.5 inch
	const boxW = 914400; // 1 inch
	const boxH = 365760; // 0.4 inch
	const slideW = 9144000;
	const slideH = 6858000;

	let offX: number;
	const offY = slideH - margin - boxH;

	let align: string;
	switch (config.position) {
		case 'bottom-left':
			offX = margin;
			align = 'l';
			break;
		case 'bottom-center':
			offX = (slideW - boxW) / 2;
			align = 'ctr';
			break;
		case 'bottom-right':
			offX = slideW - margin - boxW;
			align = 'r';
			break;
	}

	for (let idx = 0; idx < slides.length; idx++) {
		const doc = await readXML(zip, slides[idx]);
		if (!doc) continue;

		const spTree = doc.getElementsByTagNameNS(
			'http://schemas.openxmlformats.org/presentationml/2006/main',
			'spTree'
		)[0];
		if (!spTree) continue;

		const slideNumber = config.startFrom + idx;

		const numberShape = `<p:sp xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:nvSpPr>
    <p:cNvPr id="99998" name="SlideNumber"/>
    <p:cNvSpPr txBox="1"/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm>
      <a:off x="${offX}" y="${offY}"/>
      <a:ext cx="${boxW}" cy="${boxH}"/>
    </a:xfrm>
    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
    <a:noFill/>
  </p:spPr>
  <p:txBody>
    <a:bodyPr anchor="b"/>
    <a:lstStyle/>
    <a:p>
      <a:pPr algn="${align}"/>
      <a:r>
        <a:rPr lang="en-US" sz="${fontSize}" dirty="0">
          <a:solidFill>
            <a:srgbClr val="666666"/>
          </a:solidFill>
        </a:rPr>
        <a:t>${slideNumber}</a:t>
      </a:r>
    </a:p>
  </p:txBody>
</p:sp>`;

		const numDoc = parseXML(`<root xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${numberShape}</root>`);
		const numShape = numDoc.documentElement.firstElementChild;
		if (numShape) {
			const imported = doc.importNode(numShape, true);
			spTree.appendChild(imported);
		}

		writeXML(zip, slides[idx], doc);
	}

	return zip.generateAsync({ type: 'uint8array' });
}

// ── Metadata ─────────────────────────────────────────────────

/** Read metadata from a PPTX */
export async function getMetadata(source: ArrayBuffer): Promise<PptxMetadata> {
	const JSZip = await getJSZip();
	const zip = await new JSZip().loadAsync(source);

	const coreDoc = await readXML(zip, 'docProps/core.xml');

	function getText(doc: Document | null, tagName: string, ns?: string): string {
		if (!doc) return '';
		const elements = ns
			? doc.getElementsByTagNameNS(ns, tagName)
			: doc.getElementsByTagName(tagName);
		return elements.length > 0 ? (elements[0].textContent || '') : '';
	}

	const dcNS = 'http://purl.org/dc/elements/1.1/';
	const dctermsNS = 'http://purl.org/dc/terms/';
	const cpNS = 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties';

	return {
		title: getText(coreDoc, 'title', dcNS),
		subject: getText(coreDoc, 'subject', dcNS),
		creator: getText(coreDoc, 'creator', dcNS),
		description: getText(coreDoc, 'description', dcNS),
		lastModifiedBy: getText(coreDoc, 'lastModifiedBy', cpNS),
		created: getText(coreDoc, 'created', dctermsNS),
		modified: getText(coreDoc, 'modified', dctermsNS),
		revision: getText(coreDoc, 'revision', cpNS),
		category: getText(coreDoc, 'category', cpNS),
		keywords: getText(coreDoc, 'keywords', cpNS)
	};
}

/** Update metadata in a PPTX */
export async function updateMetadata(
	source: ArrayBuffer,
	metadata: Partial<PptxMetadata>
): Promise<Uint8Array> {
	const JSZip = await getJSZip();
	const zip = await new JSZip().loadAsync(source);

	let coreDoc = await readXML(zip, 'docProps/core.xml');
	if (!coreDoc) {
		// Create a minimal core.xml
		const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</cp:coreProperties>`;
		coreDoc = parseXML(xml);
	}

	const dcNS = 'http://purl.org/dc/elements/1.1/';
	const dctermsNS = 'http://purl.org/dc/terms/';
	const cpNS = 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties';

	function setElement(ns: string, prefix: string, tagName: string, value: string) {
		if (!coreDoc) return;
		let elements = coreDoc.getElementsByTagNameNS(ns, tagName);
		if (elements.length > 0) {
			elements[0].textContent = value;
		} else {
			const el = coreDoc.createElementNS(ns, `${prefix}:${tagName}`);
			el.textContent = value;
			coreDoc.documentElement.appendChild(el);
		}
	}

	if (metadata.title !== undefined) setElement(dcNS, 'dc', 'title', metadata.title);
	if (metadata.subject !== undefined) setElement(dcNS, 'dc', 'subject', metadata.subject);
	if (metadata.creator !== undefined) setElement(dcNS, 'dc', 'creator', metadata.creator);
	if (metadata.description !== undefined) setElement(dcNS, 'dc', 'description', metadata.description);
	if (metadata.lastModifiedBy !== undefined) setElement(cpNS, 'cp', 'lastModifiedBy', metadata.lastModifiedBy);
	if (metadata.category !== undefined) setElement(cpNS, 'cp', 'category', metadata.category);
	if (metadata.keywords !== undefined) setElement(cpNS, 'cp', 'keywords', metadata.keywords);

	// Update modification date
	setElement(dctermsNS, 'dcterms', 'modified', new Date().toISOString());

	writeXML(zip, 'docProps/core.xml', coreDoc);

	return zip.generateAsync({ type: 'uint8array' });
}
