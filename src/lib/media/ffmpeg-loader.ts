import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import type { LoadProgress } from './types';

let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export async function getFFmpeg(onProgress?: (progress: LoadProgress) => void): Promise<FFmpeg> {
	if (instance) return instance;
	if (loadPromise) return loadPromise;

	loadPromise = (async () => {
		const ffmpeg = new FFmpeg();

		onProgress?.({ state: 'loading', percent: 0 });

		const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

		try {
			await ffmpeg.load({
				coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
				wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
			});

			onProgress?.({ state: 'ready', percent: 100 });
			instance = ffmpeg;
			return ffmpeg;
		} catch (error) {
			onProgress?.({ state: 'error', percent: 0 });
			loadPromise = null;
			throw error;
		}
	})();

	return loadPromise;
}

export function isFFmpegReady(): boolean {
	return instance !== null;
}
