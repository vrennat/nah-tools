import * as Comlink from 'comlink';
import type { WorkerApi } from './worker';
import type { BackendType } from './types';

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
	onProgress?: (loaded: number, total: number) => void
): Promise<{ mask: ImageBitmap; backend: BackendType; inferenceMs: number }> {
	const remote = getApi();
	const progressProxy = onProgress ? Comlink.proxy(onProgress) : undefined;
	return remote.removeBackground(Comlink.transfer(image, [image]), progressProxy);
}

export async function isModelCached(): Promise<boolean> {
	return getApi().isModelCached();
}

export async function getModelInfo() {
	return getApi().getModelInfo();
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
