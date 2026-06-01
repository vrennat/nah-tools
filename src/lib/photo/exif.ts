// Minimal EXIF reader and stripper for JPEG/TIFF. No dependencies — we parse
// the TIFF/EXIF structure directly so nothing about the user's photo (including
// GPS coordinates) ever leaves the browser.

export interface ExifField {
	label: string;
	value: string;
}

export interface ExifResult {
	fields: ExifField[];
	hasGps: boolean;
	// Raw lat/long if present, for a "view on map" style hint.
	gps?: { lat: number; lng: number };
}

// TIFF tag types -> byte size of one component.
const TYPE_SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

const IFD0_TAGS: Record<number, string> = {
	0x010f: 'Make',
	0x0110: 'Camera Model',
	0x0112: 'Orientation',
	0x011a: 'X Resolution',
	0x011b: 'Y Resolution',
	0x0131: 'Software',
	0x0132: 'Date/Time',
	0x013b: 'Artist',
	0x8298: 'Copyright'
};

const EXIF_TAGS: Record<number, string> = {
	0x829a: 'Exposure Time',
	0x829d: 'F-Number',
	0x8827: 'ISO',
	0x9003: 'Date Taken',
	0x9004: 'Date Digitized',
	0x920a: 'Focal Length',
	0xa002: 'Image Width',
	0xa003: 'Image Height',
	0xa403: 'White Balance',
	0xa434: 'Lens Model',
	0x8825: 'GPS'
};

const ORIENTATION: Record<number, string> = {
	1: 'Normal',
	2: 'Mirrored',
	3: 'Rotated 180°',
	4: 'Mirrored, rotated 180°',
	5: 'Mirrored, rotated 90° CCW',
	6: 'Rotated 90° CW',
	7: 'Mirrored, rotated 90° CW',
	8: 'Rotated 90° CCW'
};

function readValue(view: DataView, entryOffset: number, tiffStart: number, le: boolean): number[] | string {
	const type = view.getUint16(entryOffset + 2, le);
	const count = view.getUint32(entryOffset + 4, le);
	const size = (TYPE_SIZE[type] ?? 1) * count;
	let valueOffset = entryOffset + 8;
	if (size > 4) valueOffset = tiffStart + view.getUint32(entryOffset + 8, le);

	if (type === 2) {
		// ASCII string
		let s = '';
		for (let i = 0; i < count; i++) {
			const c = view.getUint8(valueOffset + i);
			if (c === 0) break;
			s += String.fromCharCode(c);
		}
		return s.trim();
	}

	const out: number[] = [];
	for (let i = 0; i < count; i++) {
		const o = valueOffset + i * (TYPE_SIZE[type] ?? 1);
		switch (type) {
			case 1:
			case 7:
				out.push(view.getUint8(o));
				break;
			case 3:
				out.push(view.getUint16(o, le));
				break;
			case 4:
				out.push(view.getUint32(o, le));
				break;
			case 9:
				out.push(view.getInt32(o, le));
				break;
			case 5:
				out.push(view.getUint32(o, le) / (view.getUint32(o + 4, le) || 1));
				break;
			case 10:
				out.push(view.getInt32(o, le) / (view.getInt32(o + 4, le) || 1));
				break;
			default:
				out.push(0);
		}
	}
	return out;
}

function readIfd(view: DataView, ifdOffset: number, tiffStart: number, le: boolean) {
	const entries: { tag: number; value: number[] | string }[] = [];
	const count = view.getUint16(ifdOffset, le);
	for (let i = 0; i < count; i++) {
		const entryOffset = ifdOffset + 2 + i * 12;
		const tag = view.getUint16(entryOffset, le);
		entries.push({ tag, value: readValue(view, entryOffset, tiffStart, le) });
	}
	return entries;
}

function dms(parts: number[], ref: string): number {
	const [d = 0, m = 0, s = 0] = parts;
	let dec = d + m / 60 + s / 3600;
	if (ref === 'S' || ref === 'W') dec = -dec;
	return dec;
}

function fmt(label: string, raw: number[] | string): string {
	if (typeof raw === 'string') return raw;
	const v = raw[0] ?? 0;
	switch (label) {
		case 'Orientation':
			return ORIENTATION[v] ?? String(v);
		case 'Exposure Time':
			return v >= 1 ? `${v}s` : `1/${Math.round(1 / v)}s`;
		case 'F-Number':
			return `f/${v}`;
		case 'Focal Length':
			return `${v}mm`;
		case 'X Resolution':
		case 'Y Resolution':
			return String(Math.round(v));
		default:
			return raw.join(', ');
	}
}

/** Locate the EXIF APP1 segment in a JPEG and return its TIFF start offset, or -1. */
function findTiffStart(view: DataView): number {
	if (view.getUint16(0, false) !== 0xffd8) return -1; // not a JPEG
	let offset = 2;
	const len = view.byteLength;
	while (offset < len - 1) {
		if (view.getUint8(offset) !== 0xff) break;
		const marker = view.getUint8(offset + 1);
		if (marker === 0xe1) {
			// APP1 — check for "Exif\0\0"
			const exifStart = offset + 4;
			if (
				view.getUint32(exifStart, false) === 0x45786966 &&
				view.getUint16(exifStart + 4, false) === 0x0000
			) {
				return exifStart + 6;
			}
		}
		if (marker === 0xda) break; // start of scan
		offset += 2 + view.getUint16(offset + 2, false);
	}
	return -1;
}

export function readExif(buffer: ArrayBuffer): ExifResult {
	const view = new DataView(buffer);
	const tiffStart = findTiffStart(view);
	if (tiffStart < 0) return { fields: [], hasGps: false };

	const byteOrder = view.getUint16(tiffStart, false);
	const le = byteOrder === 0x4949; // 'II' = little-endian, 'MM' = big-endian
	const ifd0Offset = tiffStart + view.getUint32(tiffStart + 4, le);

	const fields: ExifField[] = [];
	let exifPointer = 0;
	let gpsPointer = 0;

	for (const { tag, value } of readIfd(view, ifd0Offset, tiffStart, le)) {
		if (tag === 0x8769) exifPointer = (value as number[])[0];
		else if (tag === 0x8825) gpsPointer = (value as number[])[0];
		else if (IFD0_TAGS[tag]) fields.push({ label: IFD0_TAGS[tag], value: fmt(IFD0_TAGS[tag], value) });
	}

	if (exifPointer) {
		for (const { tag, value } of readIfd(view, tiffStart + exifPointer, tiffStart, le)) {
			if (EXIF_TAGS[tag] && tag !== 0x8825) {
				fields.push({ label: EXIF_TAGS[tag], value: fmt(EXIF_TAGS[tag], value) });
			}
		}
	}

	let hasGps = false;
	let gps: { lat: number; lng: number } | undefined;
	if (gpsPointer) {
		const gpsEntries = readIfd(view, tiffStart + gpsPointer, tiffStart, le);
		let latRef = '', lngRef = '';
		let lat: number[] = [], lng: number[] = [];
		for (const { tag, value } of gpsEntries) {
			if (tag === 0x0001) latRef = value as string;
			else if (tag === 0x0002) lat = value as number[];
			else if (tag === 0x0003) lngRef = value as string;
			else if (tag === 0x0004) lng = value as number[];
		}
		if (lat.length === 3 && lng.length === 3) {
			hasGps = true;
			gps = { lat: dms(lat, latRef), lng: dms(lng, lngRef) };
			fields.push({ label: 'GPS Latitude', value: gps.lat.toFixed(6) });
			fields.push({ label: 'GPS Longitude', value: gps.lng.toFixed(6) });
		}
	}

	return { fields, hasGps, gps };
}

/**
 * Strip all metadata segments (EXIF, XMP, IPTC/Photoshop, comments) from a JPEG
 * losslessly by copying only the segments we want to keep. Falls back to a
 * canvas re-encode for non-JPEG images (which also drops metadata).
 */
export function stripJpegMetadata(buffer: ArrayBuffer): ArrayBuffer | null {
	const view = new DataView(buffer);
	if (view.getUint16(0, false) !== 0xffd8) return null; // not a JPEG

	const kept: { start: number; end: number }[] = [];
	kept.push({ start: 0, end: 2 }); // SOI

	let offset = 2;
	const len = view.byteLength;
	while (offset < len - 1) {
		if (view.getUint8(offset) !== 0xff) break;
		const marker = view.getUint8(offset + 1);

		// Start of scan: keep everything from here to the end (compressed data).
		if (marker === 0xda) {
			kept.push({ start: offset, end: len });
			break;
		}

		const segLen = view.getUint16(offset + 2, false);
		const segEnd = offset + 2 + segLen;

		// Drop metadata-bearing markers: APP1 (EXIF/XMP), APP13 (IPTC), COM.
		const isMetadata = marker === 0xe1 || marker === 0xed || marker === 0xfe;
		if (!isMetadata) kept.push({ start: offset, end: segEnd });

		offset = segEnd;
	}

	const total = kept.reduce((sum, s) => sum + (s.end - s.start), 0);
	const result = new Uint8Array(total);
	const src = new Uint8Array(buffer);
	let pos = 0;
	for (const { start, end } of kept) {
		result.set(src.subarray(start, end), pos);
		pos += end - start;
	}
	return result.buffer;
}
