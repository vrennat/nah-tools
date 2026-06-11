export type MediaToolType =
	| 'compress-video'
	| 'trim-video'
	| 'trim-audio'
	| 'compress-audio'
	| 'video-to-gif'
	| 'extract-audio'
	| 'speed-audio'
	| 'pitch-audio'
	| 'volume-audio'
	| 'fade-audio'
	| 'reverse-audio'
	| 'silence-remove-audio';

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

export interface SpeedConfig {
	// Playback speed multiplier. Valid range: 0.25–3.0.
	// The atempo filter only accepts 0.5–2.0, so extreme values are chained:
	// e.g. 0.25 = atempo=0.5,atempo=0.5; 3.0 = atempo=2.0,atempo=1.5
	speed: number;
	format: import('./audio-types').AudioFormat;
}

export interface PitchConfig {
	// Shift in semitones, -12 to +12.
	// Implemented via asetrate + aresample + atempo so speed stays constant.
	semitones: number;
	format: import('./audio-types').AudioFormat;
}

export interface VolumeConfig {
	// Gain in dB, -20 to +20.
	decibels: number;
	format: import('./audio-types').AudioFormat;
}

export interface FadeConfig {
	// Fade-in duration in seconds; 0 = no fade in.
	fadeInDuration: number;
	// Fade-out duration in seconds; 0 = no fade out.
	fadeOutDuration: number;
	// Total duration of the audio (seconds), required to compute fade-out start time.
	totalDuration: number;
	format: import('./audio-types').AudioFormat;
}

export interface SilenceRemoveConfig {
	// Silence threshold in dB (negative, e.g. -45). Below this is considered silence.
	thresholdDb: number;
	// Minimum silence duration (seconds) to remove.
	minSilenceDuration: number;
	format: import('./audio-types').AudioFormat;
}

export interface MediaResult {
	blob: Blob;
	filename: string;
	originalSize: number;
	resultSize: number;
	duration: number;
}
