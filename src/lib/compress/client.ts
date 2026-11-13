import * as Comlink from 'comlink';
import { createWorkerClient } from '$utils/worker-client';
import type { WorkerApi } from './worker';
import type { CodecName, CompressionResult } from './types';
import { isSvg, rasterizeSvg } from './svg-raster';

const client = createWorkerClient<WorkerApi>(
	() => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
);

export async function compress(
	buffer: ArrayBuffer,
	mimeType: string,
	codec: CodecName,
	quality: number
): Promise<CompressionResult> {
	if (isSvg(mimeType)) return compressFromImageData(await rasterizeSvg(buffer), codec, quality);
	return client.call((api) =>
		api.compress(Comlink.transfer(buffer, [buffer]), mimeType, codec, quality)
	);
}

export async function compressFromImageData(
	imageData: ImageData,
	codec: CodecName,
	quality: number
): Promise<CompressionResult> {
	const buffer = imageData.data.buffer;
	return client.call((api) =>
		api.compressFromImageData(Comlink.transfer(imageData, [buffer]), codec, quality)
	);
}

export const terminate = client.terminate;
