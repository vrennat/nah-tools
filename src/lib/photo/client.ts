import * as Comlink from 'comlink';
import { createWorkerClient } from '$utils/worker-client';
import type { WorkerApi } from './worker';
import type { BackendType, MaskOptions } from './types';

const client = createWorkerClient<WorkerApi>(
	() => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
);

export async function removeBackground(
	image: ImageBitmap,
	onProgress?: (loaded: number, total: number) => void,
	modelId?: string,
	maskOptions?: Partial<MaskOptions>
): Promise<{ mask: ImageBitmap; backend: BackendType; inferenceMs: number }> {
	const progressProxy = onProgress ? Comlink.proxy(onProgress) : undefined;
	// Spread maskOptions to a plain object — Svelte 5 $state proxies aren't structured-cloneable
	const plainOpts = maskOptions ? { ...maskOptions } : undefined;
	return client.call((api) =>
		api.removeBackground(Comlink.transfer(image, [image]), progressProxy, modelId, plainOpts)
	);
}

export async function isModelCached(modelId?: string): Promise<boolean> {
	return client.call((api) => api.isModelCached(modelId));
}

export async function getModelInfo(modelId?: string) {
	return client.call((api) => api.getModelInfo(modelId));
}

export async function getAvailableModels() {
	return client.call((api) => api.getAvailableModels());
}

export async function detectBackend(): Promise<BackendType> {
	return client.call((api) => api.detectBackend());
}

export const terminate = client.terminate;
