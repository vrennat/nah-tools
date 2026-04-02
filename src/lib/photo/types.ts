export type BackendType = 'webgpu' | 'wasm';

export interface ModelInfo {
	id: string;
	name: string;
	url: string;
	size: number; // bytes
	inputSize: number; // square dimension (e.g. 1024)
	description: string;
	/** What the model is best at (shown in UI) */
	bestFor: string;
}

/** Options for controlling mask post-processing */
export interface MaskOptions {
	/** Lower threshold — values below this become fully transparent (0-1, default 0.3) */
	threshold: number;
	/** Upper threshold — values above this become fully opaque (0-1, default 0.7) */
	softness: number;
	/** Feather radius in pixels for edge smoothing (0 = sharp edges, default 0) */
	feather: number;
}

export const DEFAULT_MASK_OPTIONS: MaskOptions = {
	threshold: 0.3,
	softness: 0.7,
	feather: 0
};

export interface ProcessingResult {
	/** The mask as an ImageBitmap (grayscale, same size as original) */
	mask: ImageBitmap;
	/** Which backend was used */
	backend: BackendType;
	/** Inference time in ms */
	inferenceMs: number;
}

export interface ModelLoadProgress {
	loaded: number;
	total: number;
}

/** Messages sent from the worker to the main thread */
export type WorkerMessage =
	| { type: 'model-progress'; loaded: number; total: number }
	| { type: 'model-ready'; backend: BackendType }
	| { type: 'result'; mask: ImageBitmap; backend: BackendType; inferenceMs: number }
	| { type: 'error'; message: string };
