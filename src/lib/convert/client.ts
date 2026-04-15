import * as Comlink from 'comlink';
import type { WorkerApi } from '$compress/worker';
import type { CodecName, CompressionResult } from '$compress/types';
import type { ConversionResult } from './types';

let worker: Worker | null = null;
let api: Comlink.Remote<WorkerApi> | null = null;

function getApi(): Comlink.Remote<WorkerApi> {
	if (api) return api;

	worker = new Worker(new URL('$compress/worker.ts', import.meta.url), { type: 'module' });
	api = Comlink.wrap<WorkerApi>(worker);
	return api;
}

export async function convertFile(
	file: File,
	targetCodec: CodecName,
	quality: number
): Promise<ConversionResult> {
	const remote = getApi();
	const buffer = await file.arrayBuffer();

	const result = await remote.convert(
		Comlink.transfer(buffer, [buffer]),
		file.type,
		targetCodec,
		quality
	);

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

export function terminate() {
	if (worker) {
		worker.terminate();
		worker = null;
		api = null;
	}
}
