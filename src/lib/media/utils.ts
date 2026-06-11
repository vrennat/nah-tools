// MIME -> extension fallback for files with no extension in their name.
// Shared between media/processor.ts and audio/processor.ts.
const MIME_TO_EXT: Record<string, string> = {
	'video/mp4': '.mp4',
	'video/webm': '.webm',
	'video/ogg': '.ogv',
	'video/quicktime': '.mov',
	'video/x-msvideo': '.avi',
	'video/x-matroska': '.mkv',
	'video/3gpp': '.3gp',
	'audio/mpeg': '.mp3',
	'audio/mp4': '.m4a',
	'audio/ogg': '.ogg',
	'audio/wav': '.wav',
	'audio/flac': '.flac',
	'audio/aac': '.aac',
	'audio/webm': '.weba'
};

/**
 * Returns the file extension (including leading dot) for use as an FFmpeg VFS
 * filename suffix. Falls back to the MIME type when the filename has no
 * extension so FFmpeg can still probe the format correctly.
 */
export function getMediaExtension(file: { name: string; type: string }): string {
	const match = file.name.match(/\.[^.]+$/);
	if (match) return match[0];
	return MIME_TO_EXT[file.type] ?? '.bin';
}
