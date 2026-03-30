import * as Comlink from 'comlink';
import type { WorkerApi } from './worker';
import type { CodecName, CompressionResult } from './types';

let worker: Worker | null = null;
let api: Comlink.Remote<WorkerApi> | null = null;

function getApi(): Comlink.Remote<WorkerApi> {
	if (api) return api;

	worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
	api = Comlink.wrap<WorkerApi>(worker);
	return api;
}

export async function compress(
	buffer: ArrayBuffer,
	mimeType: string,
	codec: CodecName,
	quality: number
): Promise<CompressionResult> {
	const remote = getApi();
	return remote.compress(Comlink.transfer(buffer, [buffer]), mimeType, codec, quality);
}

export async function compressFromImageData(
	imageData: ImageData,
	codec: CodecName,
	quality: number
): Promise<CompressionResult> {
	const remote = getApi();
	const buffer = imageData.data.buffer;
	return remote.compressFromImageData(
		Comlink.transfer(imageData, [buffer]),
		codec,
		quality
	);
}

export function terminate() {
	if (worker) {
		worker.terminate();
		worker = null;
		api = null;
	}
}
