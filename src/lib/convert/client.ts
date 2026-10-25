import * as Comlink from 'comlink';
import { createWorkerClient } from '$utils/worker-client';
import type { WorkerApi } from '$compress/worker';
import type { CodecName, CompressionResult } from '$compress/types';
import { isSvg, rasterizeSvg } from '$compress/svg-raster';
import type { ConversionResult } from './types';

const client = createWorkerClient<WorkerApi>(
	() => new Worker(new URL('$compress/worker.ts', import.meta.url), { type: 'module' })
);

export async function convertFile(
	file: File,
	targetCodec: CodecName,
	quality: number,
	// Browsers report an empty File.type for formats the OS doesn't register
	// (HEIC on Chrome/Windows, TIFF on some platforms). Callers should pass a
	// registry-resolved MIME via resolveSourceMime() — file.type is a fallback.
	sourceMimeType: string = file.type
): Promise<ConversionResult> {
	const buffer = await file.arrayBuffer();

	let result: CompressionResult;
	if (isSvg(sourceMimeType)) {
		const imageData = await rasterizeSvg(buffer);
		result = await client.call((api) =>
			api.compressFromImageData(
				Comlink.transfer(imageData, [imageData.data.buffer]),
				targetCodec,
				quality
			)
		);
	} else {
		result = await client.call((api) =>
			api.convert(Comlink.transfer(buffer, [buffer]), sourceMimeType, targetCodec, quality)
		);
	}

	const blob = new Blob([result.buffer], { type: result.mimeType });

	return {
		blob,
		filename: getConvertedFilename(file.name, result.extension),
		originalSize: file.size,
		convertedSize: result.size
	};
}

function getConvertedFilename(originalName: string, newExtension: string): string {
	const nameParts = originalName.split('.');
	nameParts.pop();
	return nameParts.join('.') + '.' + newExtension;
}

export const terminate = client.terminate;
