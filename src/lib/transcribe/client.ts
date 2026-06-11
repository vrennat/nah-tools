/**
 * Main-thread client for the transcription worker.
 * Wraps Comlink so callers never import from the worker directly.
 *
 * Mirrors the pattern in src/lib/photo/client.ts:
 *   - Lazy worker creation on first call
 *   - Comlink.proxy() for callback functions (not structured-cloneable)
 *   - terminate() to clean up between routes
 */
import * as Comlink from 'comlink';
import type { TranscribeWorkerApi } from './worker';
import type {
	TranscribeResult,
	TranscribeBackend,
	ModelDownloadProgress,
	TranscribeProgress,
	TranscribeModelInfo
} from './types';

let worker: Worker | null = null;
let api: Comlink.Remote<TranscribeWorkerApi> | null = null;

function getApi(): Comlink.Remote<TranscribeWorkerApi> {
	if (api) return api;
	worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
	api = Comlink.wrap<TranscribeWorkerApi>(worker);
	return api;
}

export async function transcribe(
	pcm: Float32Array,
	opts: { modelId?: string; language?: string },
	onModelProgress?: (p: ModelDownloadProgress) => void,
	onChunkProgress?: (p: TranscribeProgress) => void
): Promise<TranscribeResult> {
	const remote = getApi();
	const modelProgressProxy = onModelProgress ? Comlink.proxy(onModelProgress) : undefined;
	const chunkProgressProxy = onChunkProgress ? Comlink.proxy(onChunkProgress) : undefined;
	// Transfer the PCM buffer to avoid a copy — the worker owns it after this call.
	return remote.transcribe(
		Comlink.transfer(pcm, [pcm.buffer]),
		opts,
		modelProgressProxy,
		chunkProgressProxy
	);
}

export async function loadPipeline(
	modelId: string,
	onModelProgress?: (p: ModelDownloadProgress) => void
): Promise<TranscribeBackend> {
	const remote = getApi();
	const progressProxy = onModelProgress ? Comlink.proxy(onModelProgress) : undefined;
	return remote.loadPipeline(modelId, progressProxy);
}

export async function isModelLoaded(modelId?: string): Promise<boolean> {
	return getApi().isModelLoaded(modelId);
}

export async function getAvailableModels(): Promise<TranscribeModelInfo[]> {
	return getApi().getAvailableModels();
}

export async function detectBackend(): Promise<TranscribeBackend> {
	return getApi().detectBackend();
}

export function terminate(): void {
	if (worker) {
		worker.terminate();
		worker = null;
		api = null;
	}
}
