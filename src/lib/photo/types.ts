export type BackendType = 'webgpu' | 'wasm';

export interface ModelInfo {
	id: string;
	name: string;
	url: string;
	size: number; // bytes
	inputSize: number; // square dimension (e.g. 1024)
	description: string;
}

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
