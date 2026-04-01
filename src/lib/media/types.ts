export type MediaToolType =
	| 'compress-video'
	| 'trim-video'
	| 'trim-audio'
	| 'compress-audio'
	| 'video-to-gif'
	| 'extract-audio';

export interface TrimConfig {
	startTime: number; // seconds
	endTime: number; // seconds
}

export interface VideoCompressConfig {
	preset: 'email' | 'social' | 'web' | 'custom';
	crf: number; // 0-51, higher = smaller file, lower quality. 23 = default, 32 = aggressive
	audioBitrate: string; // e.g. '128k'
	maxWidth: number;
	maxHeight: number;
	fps: number | null; // null = keep original
}

export interface AudioCompressConfig {
	bitrate: string; // e.g. '128k', '192k', '320k'
	format: 'mp3' | 'aac' | 'ogg';
}

export interface GifConfig {
	fps: number; // 10-30
	width: number; // max width, maintains aspect ratio
	startTime: number;
	endTime: number;
}

export type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export interface LoadProgress {
	state: LoadState;
	percent: number;
}

export interface ProcessingProgress {
	percent: number;
	timeElapsed: number;
	estimatedTotal: number;
}

export interface MediaResult {
	blob: Blob;
	filename: string;
	originalSize: number;
	resultSize: number;
	duration: number;
}
