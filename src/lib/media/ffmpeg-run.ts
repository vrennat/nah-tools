// Shared FFmpeg plumbing used by every processor function.
// Extracted to prevent duplication across the unified engine.

import { getFFmpeg } from './ffmpeg-loader';
import type { ProcessingProgress } from './types';

// Re-export so call sites that need the FFmpeg instance type don't have to
// import the loader directly just for typeof.
export type FFmpegInstance = Awaited<ReturnType<typeof getFFmpeg>>;

/**
 * Creates a progress event handler suitable for `ffmpeg.on('progress', ...)`.
 *
 * progressScale and progressOffset support the two-pass GIF path where pass 1
 * maps 0-100% of FFmpeg progress to 0-50% of reported progress and pass 2 maps
 * to 50-100%.  Single-pass callers can omit both (default: scale=1, offset=0).
 */
export function makeProgressHandler(
	startTime: number,
	onProgress: ((p: ProcessingProgress) => void) | undefined,
	progressScale = 1,
	progressOffset = 0
): (event: { progress: number }) => void {
	return ({ progress }: { progress: number }) => {
		const elapsed = (Date.now() - startTime) / 1000;
		onProgress?.({
			percent: progressOffset + Math.round(progress * 100 * progressScale),
			timeElapsed: elapsed,
			estimatedTotal: elapsed / (progress || 0.01)
		});
	};
}

/**
 * Best-effort VFS delete. A file that was never written (e.g. output on error)
 * will throw — swallow it so cleanup doesn't mask the real error.
 */
export async function tryDelete(ffmpeg: FFmpegInstance, name: string): Promise<void> {
	try {
		await ffmpeg.deleteFile(name);
	} catch {
		// intentionally swallowed
	}
}
