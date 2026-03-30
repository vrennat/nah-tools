/**
 * HEIC/HEIF detection and conversion.
 * Converts Apple's HEIC format to JPEG so all browser APIs can handle it.
 */

const HEIC_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
const HEIC_EXTENSIONS = ['.heic', '.heif'];

export function isHeic(file: File): boolean {
	if (HEIC_TYPES.includes(file.type)) return true;
	// Some browsers don't set the MIME type for HEIC files
	const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
	return HEIC_EXTENSIONS.includes(ext);
}

/**
 * Convert a HEIC file to a JPEG File object.
 * Lazy-loads heic2any to keep the main bundle small.
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
	const heic2any = (await import('heic2any')).default;
	const blob = await heic2any({
		blob: file,
		toType: 'image/jpeg',
		quality: 0.92
	});
	const result = Array.isArray(blob) ? blob[0] : blob;
	const name = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
	return new File([result], name, { type: 'image/jpeg' });
}
