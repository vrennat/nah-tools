/// <reference lib="webworker" />
/**
 * Transcription worker — runs @huggingface/transformers in an isolated thread
 * so the Whisper encoder-decoder loop never blocks the main thread.
 *
 * Design notes:
 * - @huggingface/transformers is dynamically imported here, ONLY here.
 *   No other file in the bundle touches it — zero bundle impact for non-users.
 * - We do NOT enable SharedArrayBuffer / multi-threaded WASM. The site is not
 *   cross-origin isolated and must stay that way. transformers.js runs fine in
 *   single-threaded mode on both wasm and webgpu.
 * - Device selection: try WebGPU first, fall back to wasm. We report which
 *   backend was actually used so the UI can show the badge.
 * - Progress: two separate Comlink proxy callbacks:
 *     onModelProgress — fired during model download/init
 *     onChunkProgress — fired as each transcription chunk completes
 */

import * as Comlink from 'comlink';
import type { TranscribeBackend, TranscriptChunk, TranscribeResult, ModelDownloadProgress, TranscribeProgress } from './types';
import { AVAILABLE_TRANSCRIBE_MODELS, DEFAULT_TRANSCRIBE_MODEL } from './models';

// Cached pipeline so the model is only loaded once per worker lifetime.
let pipelineInstance: unknown = null;
let loadedModelId: string | null = null;
let currentBackend: TranscribeBackend = 'wasm';

async function detectBackend(): Promise<TranscribeBackend> {
	try {
		if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
			const adapter = await (navigator as unknown as { gpu: { requestAdapter(): Promise<unknown> } }).gpu.requestAdapter();
			if (adapter) return 'webgpu';
		}
	} catch {
		// WebGPU not available — intentionally swallowed
	}
	return 'wasm';
}

async function loadPipeline(
	modelId: string,
	onModelProgress?: (p: ModelDownloadProgress) => void
): Promise<TranscribeBackend> {
	const model = AVAILABLE_TRANSCRIBE_MODELS.find((m) => m.id === modelId) ?? DEFAULT_TRANSCRIBE_MODEL;

	// Discard the cached pipeline if a different model is requested.
	if (pipelineInstance && loadedModelId !== model.id) {
		pipelineInstance = null;
		loadedModelId = null;
	}

	if (pipelineInstance) return currentBackend;

	// Dynamic import — this is the ONLY place @huggingface/transformers is
	// imported. All other files remain free of this dependency.
	const { pipeline, env } = await import('@huggingface/transformers');

	// Single-threaded WASM: the site is not cross-origin isolated so
	// SharedArrayBuffer is unavailable. Disable multi-threading explicitly.
	// env.backends.onnx.wasm is typed as potentially undefined; guard before write.
	if (env.backends?.onnx?.wasm) {
		env.backends.onnx.wasm.numThreads = 1;
	}

	currentBackend = await detectBackend();

	const device = currentBackend === 'webgpu' ? 'webgpu' : 'wasm';

	// progress_callback fires for each file being downloaded/loaded.
	// We translate it into our simpler ModelDownloadProgress shape.
	const progressCallback = (event: Record<string, unknown>) => {
		if (!onModelProgress) return;
		const status = event.status as string;
		const loaded = (event.loaded as number | undefined) ?? 0;
		const total = (event.total as number | undefined) ?? 0;

		if (status === 'progress') {
			onModelProgress({
				percent: total > 0 ? Math.round((loaded / total) * 100) : 0,
				loaded,
				total,
				status: 'downloading'
			});
		} else if (status === 'done' || status === 'ready') {
			onModelProgress({ percent: 100, loaded: total, total, status: 'done' });
		} else if (status === 'cached') {
			onModelProgress({ percent: 100, loaded: 0, total: 0, status: 'cached' });
		}
	};

	try {
		pipelineInstance = await pipeline('automatic-speech-recognition', model.hfRepo, {
			device,
			progress_callback: progressCallback
		});
	} catch (err) {
		// WebGPU pipeline creation failed — fall back to wasm and retry.
		if (currentBackend === 'webgpu') {
			currentBackend = 'wasm';
			pipelineInstance = await pipeline('automatic-speech-recognition', model.hfRepo, {
				device: 'wasm',
				progress_callback: progressCallback
			});
		} else {
			throw err;
		}
	}

	loadedModelId = model.id;
	return currentBackend;
}

async function transcribe(
	pcm: Float32Array,
	opts: {
		modelId?: string;
		language?: string;
	},
	onModelProgress?: (p: ModelDownloadProgress) => void,
	onChunkProgress?: (p: TranscribeProgress) => void
): Promise<TranscribeResult> {
	const modelId = opts.modelId ?? DEFAULT_TRANSCRIBE_MODEL.id;
	const backend = await loadPipeline(modelId, onModelProgress);

	// The pipeline is typed as `unknown` to avoid importing the full
	// @huggingface/transformers types at the module level.
	const asr = pipelineInstance as (
		input: Float32Array,
		options: Record<string, unknown>
	) => Promise<{ chunks: Array<{ text: string; timestamp: [number, number | null] }> }>;

	// chunk_length_s: 30 is the standard Whisper window.
	// stride_length_s: 5 gives a 5-second overlap to reduce boundary errors.
	// return_timestamps: true is required to get the timestamp arrays.
	let chunksCompleted = 0;

	const result = await asr(pcm, {
		chunk_length_s: 30,
		stride_length_s: 5,
		return_timestamps: true,
		...(opts.language ? { language: opts.language } : {}),
		// callback_function fires after each generated token. We use it as a
		// rough progress signal since we cannot predict total chunk count.
		callback_function: (_: unknown) => {
			chunksCompleted++;
			onChunkProgress?.({
				// Clamp at 95% — set to 100 only when we have the full result.
				percent: Math.min(95, chunksCompleted),
				chunksCompleted
			});
		}
	});

	onChunkProgress?.({ percent: 100, chunksCompleted });

	const chunks: TranscriptChunk[] = (result.chunks ?? []).map((c) => ({
		text: c.text,
		timestamp: c.timestamp
	}));

	return { chunks, backend };
}

async function isModelLoaded(modelId?: string): Promise<boolean> {
	const id = modelId ?? DEFAULT_TRANSCRIBE_MODEL.id;
	return loadedModelId === id && pipelineInstance !== null;
}

function getAvailableModels() {
	return AVAILABLE_TRANSCRIBE_MODELS.map((m) => ({ ...m }));
}

const workerApi = {
	transcribe,
	loadPipeline,
	isModelLoaded,
	getAvailableModels,
	detectBackend
};

export type TranscribeWorkerApi = typeof workerApi;

Comlink.expose(workerApi);
