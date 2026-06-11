/**
 * Shared types for the on-device transcription module.
 * All heavy imports live in worker.ts; these are plain data types safe to
 * import anywhere (main thread, worker, test code).
 */

export type TranscribeBackend = 'webgpu' | 'wasm';

/** A single timed chunk as returned by the Whisper pipeline. */
export interface TranscriptChunk {
	text: string;
	/** [start, end] in seconds; end may be null for the final chunk */
	timestamp: [number, number | null];
}

export interface TranscribeModelInfo {
	id: string;
	/** Short display name shown in the picker */
	name: string;
	/** HuggingFace repo ID */
	hfRepo: string;
	/**
	 * Sum of encoder + decoder_merged file sizes in bytes for the dtype the
	 * library selects by default on wasm (q8 = _quantized suffix).
	 * Source: HF API ?blobs=true on 2026-06-11.
	 */
	sizeBytes: number;
	/** Human-readable size label */
	sizeLabel: string;
	description: string;
	bestFor: string;
}

export interface ModelDownloadProgress {
	/** 0-100 */
	percent: number;
	loaded: number;
	total: number;
	status: 'downloading' | 'done' | 'cached';
}

export interface TranscribeProgress {
	/** 0-100, updated as chunks arrive */
	percent: number;
	chunksCompleted: number;
}

export interface TranscribeResult {
	chunks: TranscriptChunk[];
	backend: TranscribeBackend;
}
