/**
 * Minimal sRGB IEC61966-2.1 ICC profile for PDF/A output intent.
 * Constructed programmatically from known sRGB colorimetry values.
 */

function writeU32(view: DataView, offset: number, value: number) {
	view.setUint32(offset, value, false); // big-endian
}

function writeU16(view: DataView, offset: number, value: number) {
	view.setUint16(offset, value, false);
}

/** Write an s15Fixed16Number (signed 15.16 fixed-point) */
function writeS15F16(view: DataView, offset: number, value: number) {
	const fixed = Math.round(value * 65536);
	view.setInt32(offset, fixed, false);
}

/** Write a 4-character tag/signature */
function writeTag(view: DataView, offset: number, tag: string) {
	for (let i = 0; i < 4; i++) {
		view.setUint8(offset + i, tag.charCodeAt(i));
	}
}

/** Write a text string (with null terminator) */
function writeString(buf: Uint8Array, offset: number, str: string) {
	for (let i = 0; i < str.length; i++) {
		buf[offset + i] = str.charCodeAt(i);
	}
	buf[offset + str.length] = 0;
}

/** Build a 'desc' (textDescription) tag data block */
function buildDescTag(description: string): Uint8Array {
	// textDescription type: 'desc' + 4 reserved + ASCII count + ASCII string + null
	// + Unicode count (0) + script code count (0)
	const asciiLen = description.length + 1; // include null terminator
	const size = 12 + asciiLen + 12; // type(4) + reserved(4) + count(4) + string + unicode(8) + scriptcode(4)
	// Pad to 4-byte boundary
	const padded = Math.ceil(size / 4) * 4;
	const buf = new Uint8Array(padded);
	const view = new DataView(buf.buffer);

	writeTag(view, 0, 'desc');
	// 4 bytes reserved (zeros)
	writeU32(view, 8, asciiLen);
	writeString(buf, 12, description);
	// Unicode and ScriptCode sections left as zeros (minimal profile)

	return buf;
}

/** Build an 'XYZ ' tag data block */
function buildXYZTag(x: number, y: number, z: number): Uint8Array {
	const buf = new Uint8Array(20);
	const view = new DataView(buf.buffer);

	writeTag(view, 0, 'XYZ ');
	// 4 bytes reserved (zeros)
	writeS15F16(view, 8, x);
	writeS15F16(view, 12, y);
	writeS15F16(view, 16, z);

	return buf;
}

/** Build a 'curv' tag for a gamma value */
function buildCurveTag(gamma: number): Uint8Array {
	// curv type: 'curv' + 4 reserved + count(4) + values
	// count=1 means a single gamma value stored as u8Fixed8Number
	const buf = new Uint8Array(14); // 4+4+4+2, padded below
	const padded = new Uint8Array(16); // pad to 4-byte boundary
	const view = new DataView(padded.buffer);

	writeTag(view, 0, 'curv');
	// 4 bytes reserved (zeros)
	writeU32(view, 8, 1); // one entry = gamma
	// u8Fixed8Number: gamma * 256
	writeU16(view, 12, Math.round(gamma * 256));

	return padded;
}

/** Build a minimal valid sRGB ICC profile */
function buildSRGBProfile(): Uint8Array {
	// sRGB colorimetry values (D65 illuminant)
	const desc = buildDescTag('sRGB IEC61966-2.1');
	const wtpt = buildXYZTag(0.9505, 1.0, 1.089);
	const rXYZ = buildXYZTag(0.4124, 0.2126, 0.0193);
	const gXYZ = buildXYZTag(0.3576, 0.7152, 0.1192);
	const bXYZ = buildXYZTag(0.1805, 0.0722, 0.9505);
	// sRGB uses ~2.2 gamma (simplified; true sRGB has a piecewise curve but 2.2 is the standard ICC approximation)
	const rTRC = buildCurveTag(2.2);
	const gTRC = buildCurveTag(2.2);
	const bTRC = buildCurveTag(2.2);

	const tags = [
		{ sig: 'desc', data: desc },
		{ sig: 'wtpt', data: wtpt },
		{ sig: 'rXYZ', data: rXYZ },
		{ sig: 'gXYZ', data: gXYZ },
		{ sig: 'bXYZ', data: bXYZ },
		{ sig: 'rTRC', data: rTRC },
		{ sig: 'gTRC', data: gTRC },
		{ sig: 'bTRC', data: bTRC }
	];

	const tagCount = tags.length;
	const headerSize = 128;
	const tagTableSize = 4 + tagCount * 12; // count(4) + entries(12 each)
	let dataOffset = headerSize + tagTableSize;
	// Align data offset to 4 bytes
	dataOffset = Math.ceil(dataOffset / 4) * 4;

	// Calculate total size
	let totalSize = dataOffset;
	for (const tag of tags) {
		totalSize += tag.data.length;
	}
	// Pad total to 4-byte boundary
	totalSize = Math.ceil(totalSize / 4) * 4;

	const buf = new Uint8Array(totalSize);
	const view = new DataView(buf.buffer);

	// === Header (128 bytes) ===
	writeU32(view, 0, totalSize); // Profile size
	writeTag(view, 4, 'nah '); // Preferred CMM (arbitrary)
	// Version 2.1.0
	view.setUint8(8, 2); // major
	view.setUint8(9, 0x10); // minor.bugfix (2.1.0)
	writeTag(view, 12, 'mntr'); // Device class: monitor
	writeTag(view, 16, 'RGB '); // Color space
	writeTag(view, 20, 'XYZ '); // PCS (Profile Connection Space)
	// Date/time (12 bytes at offset 24): 2024-01-01 00:00:00
	writeU16(view, 24, 2024); // year
	writeU16(view, 26, 1); // month
	writeU16(view, 28, 1); // day
	// hours, minutes, seconds = 0 (already zero)
	writeTag(view, 36, 'acsp'); // Profile file signature (required)
	writeTag(view, 40, 'APPL'); // Primary platform: Apple
	// Flags, device manufacturer, device model = 0
	// Rendering intent = 0 (perceptual)
	// PCS illuminant (D50): X=0.9642, Y=1.0, Z=0.8249
	writeS15F16(view, 68, 0.9642);
	writeS15F16(view, 72, 1.0);
	writeS15F16(view, 76, 0.8249);
	writeTag(view, 80, 'nah '); // Profile creator

	// === Tag table ===
	let offset = headerSize;
	writeU32(view, offset, tagCount);
	offset += 4;

	let currentDataOffset = dataOffset;
	for (const tag of tags) {
		writeTag(view, offset, tag.sig);
		writeU32(view, offset + 4, currentDataOffset);
		writeU32(view, offset + 8, tag.data.length);
		offset += 12;

		// Write tag data
		buf.set(tag.data, currentDataOffset);
		currentDataOffset += tag.data.length;
	}

	return buf;
}

export const SRGB_ICC_PROFILE = buildSRGBProfile();
