// Audio format definitions for the unified FFmpeg engine.
// Moved from src/lib/audio/types.ts as part of media/audio engine consolidation.

export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'm4a' | 'flac' | 'aac';

export interface AudioFormatInfo {
	id: AudioFormat;
	label: string;
	description: string;
	codec: string; // FFmpeg encoder name
	ext: string; // output extension including dot
	mime: string;
	lossless: boolean;
}

export const AUDIO_FORMATS: AudioFormatInfo[] = [
	{ id: 'mp3', label: 'MP3', description: 'Universal compatibility', codec: 'libmp3lame', ext: '.mp3', mime: 'audio/mpeg', lossless: false },
	{ id: 'wav', label: 'WAV', description: 'Uncompressed, lossless', codec: 'pcm_s16le', ext: '.wav', mime: 'audio/wav', lossless: true },
	{ id: 'ogg', label: 'OGG', description: 'Open format, efficient', codec: 'libvorbis', ext: '.ogg', mime: 'audio/ogg', lossless: false },
	{ id: 'm4a', label: 'M4A', description: 'AAC in an MP4 container', codec: 'aac', ext: '.m4a', mime: 'audio/mp4', lossless: false },
	{ id: 'flac', label: 'FLAC', description: 'Compressed, lossless', codec: 'flac', ext: '.flac', mime: 'audio/flac', lossless: true },
	{ id: 'aac', label: 'AAC', description: 'Raw AAC stream', codec: 'aac', ext: '.aac', mime: 'audio/aac', lossless: false }
];

export function getAudioFormat(id: AudioFormat): AudioFormatInfo {
	const found = AUDIO_FORMATS.find((f) => f.id === id);
	if (!found) throw new Error(`Unknown audio format: ${id}`);
	return found;
}

export interface NormalizeConfig {
	// EBU R128 integrated loudness target in LUFS. -16 is a good streaming default.
	targetLufs: number;
	format: AudioFormat;
}
