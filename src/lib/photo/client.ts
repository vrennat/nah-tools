import * as Comlink from 'comlink';
import type { WorkerApi } from './worker';
import type { BackendType, MaskOptions } from './types';

let worker: Worker | null = null;
let api: Comlink.Remote<WorkerApi> | null = null;

function getApi(): Comlink.Remote<WorkerApi> {
	if (api) return api;

	worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
	api = Comlink.wrap<WorkerApi>(worker);
	return api;
}

export async function removeBackground(
	image: ImageBitmap,
	onProgress?: (loaded: number, total: number) => void,
	modelId?: string,
	maskOptions?: Partial<MaskOptions>
): Promise<{ mask: ImageBitmap; backend: BackendType; inferenceMs: number }> {
	const remote = getApi();
	const progressProxy = onProgress ? Comlink.proxy(onProgress) : undefined;
	// Spread maskOptions to a plain object — Svelte 5 $state proxies aren't structured-cloneable
	const plainOpts = maskOptions ? { ...maskOptions } : undefined;
	return remote.removeBackground(Comlink.transfer(image, [image]), progressProxy, modelId, plainOpts);
}

export async function isModelCached(modelId?: string): Promise<boolean> {
	return getApi().isModelCached(modelId);
}

export async function getModelInfo(modelId?: string) {
	return getApi().getModelInfo(modelId);
}

export async function getAvailableModels() {
	return getApi().getAvailableModels();
}

export async function detectBackend(): Promise<BackendType> {
	return getApi().detectBackend();
}

export function terminate() {
	if (worker) {
		worker.terminate();
		worker = null;
		api = null;
	}
}
