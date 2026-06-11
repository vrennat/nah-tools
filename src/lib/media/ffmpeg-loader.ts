import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import type { LoadProgress } from './types';

let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

// Callbacks waiting for the in-flight load to complete so they all get notified.
const pendingProgressCallbacks: Array<(progress: LoadProgress) => void> = [];

export async function getFFmpeg(onProgress?: (progress: LoadProgress) => void): Promise<FFmpeg> {
	if (instance) {
		// Already loaded — notify the caller immediately so pages don't stay at idle.
		onProgress?.({ state: 'ready', percent: 100 });
		return instance;
	}

	if (loadPromise) {
		// Another caller is already loading; fan out progress to this one too.
		if (onProgress) pendingProgressCallbacks.push(onProgress);
		return loadPromise;
	}

	if (onProgress) pendingProgressCallbacks.push(onProgress);

	loadPromise = (async () => {
		const ffmpeg = new FFmpeg();

		const broadcast = (p: LoadProgress) => {
			for (const cb of pendingProgressCallbacks) cb(p);
		};

		broadcast({ state: 'loading', percent: 0 });

		const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

		try {
			await ffmpeg.load({
				coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
				wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
			});

			broadcast({ state: 'ready', percent: 100 });
			instance = ffmpeg;
			pendingProgressCallbacks.length = 0;
			return ffmpeg;
		} catch (error) {
			broadcast({ state: 'error', percent: 0 });
			loadPromise = null;
			pendingProgressCallbacks.length = 0;
			throw error;
		}
	})();

	return loadPromise;
}

export function isFFmpegReady(): boolean {
	return instance !== null;
}

/**
 * Terminate the running FFmpeg instance and reset the singleton so the next
 * call to getFFmpeg() reloads cleanly. Called by the cancel UI so in-flight
 * exec() is actually stopped, not just hidden.
 */
export function cancelFFmpeg(): void {
	if (instance) {
		try {
			instance.terminate();
		} catch {
			// terminate() may throw if the worker is already gone; safe to ignore.
		}
		instance = null;
	}
	loadPromise = null;
	pendingProgressCallbacks.length = 0;
}
