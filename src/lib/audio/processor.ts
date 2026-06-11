import { getFFmpeg } from '$media/ffmpeg-loader';
import { getMediaExtension } from '$media/utils';
import { fetchFile } from '@ffmpeg/util';
import type { ProcessingProgress, MediaResult } from '$media/types';
import { getAudioFormat, type AudioFormat, type NormalizeConfig } from './types';

function stripExtension(filename: string): string {
	return filename.replace(/\.[^.]+$/, '');
}

function makeProgressHandler(startTime: number, onProgress?: (p: ProcessingProgress) => void) {
	return ({ progress }: { progress: number }) => {
		const elapsed = (Date.now() - startTime) / 1000;
		onProgress?.({
			percent: Math.min(100, Math.round(progress * 100)),
			timeElapsed: elapsed,
			estimatedTotal: elapsed / (progress || 0.01)
		});
	};
}

// Best-effort VFS delete — a file that was never written (e.g. output on error)
// throws; swallow so cleanup doesn't mask the real error.
async function tryDelete(ffmpeg: Awaited<ReturnType<typeof getFFmpeg>>, name: string): Promise<void> {
	try {
		await ffmpeg.deleteFile(name);
	} catch {
		// intentionally swallowed
	}
}

// Bitrate to apply for lossy encoders. WAV/FLAC ignore it.
const DEFAULT_BITRATE = '192k';

export async function convertAudio(
	file: File,
	format: AudioFormat,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const info = getAudioFormat(format);
	const inputName = 'input' + getMediaExtension(file);
	const outputName = 'output' + info.ext;

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		const args = ['-i', inputName, '-vn', '-c:a', info.codec];
		if (!info.lossless) args.push('-b:a', DEFAULT_BITRATE);
		args.push('-y', outputName);

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: info.mime });

		return {
			blob,
			filename: stripExtension(file.name) + info.ext,
			originalSize: file.size,
			resultSize: blob.size,
			duration: 0
		};
	} finally {
		ffmpeg.off('progress', handler);
		await tryDelete(ffmpeg, inputName);
		await tryDelete(ffmpeg, outputName);
	}
}

export async function mergeAudio(
	files: File[],
	format: AudioFormat,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	if (files.length < 2) throw new Error('Select at least two files to merge.');

	const ffmpeg = await getFFmpeg();
	const info = getAudioFormat(format);
	const outputName = 'output' + info.ext;

	const inputNames: string[] = [];
	for (let i = 0; i < files.length; i++) {
		const name = `input${i}${getMediaExtension(files[i])}`;
		await ffmpeg.writeFile(name, await fetchFile(files[i]));
		inputNames.push(name);
	}

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		// Re-sample every input to a common rate/layout so concat never fails on
		// mismatched streams, then concatenate.
		const filterParts: string[] = [];
		const labels: string[] = [];
		for (let i = 0; i < files.length; i++) {
			filterParts.push(`[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`);
			labels.push(`[a${i}]`);
		}
		const filter = `${filterParts.join(';')};${labels.join('')}concat=n=${files.length}:v=0:a=1[out]`;

		const args: string[] = [];
		for (const name of inputNames) args.push('-i', name);
		args.push('-filter_complex', filter, '-map', '[out]', '-c:a', info.codec);
		if (!info.lossless) args.push('-b:a', DEFAULT_BITRATE);
		args.push('-y', outputName);

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: info.mime });

		const originalSize = files.reduce((sum, f) => sum + f.size, 0);

		return {
			blob,
			filename: `merged${info.ext}`,
			originalSize,
			resultSize: blob.size,
			duration: 0
		};
	} finally {
		ffmpeg.off('progress', handler);
		for (const name of inputNames) await tryDelete(ffmpeg, name);
		await tryDelete(ffmpeg, outputName);
	}
}

export async function normalizeAudio(
	file: File,
	config: NormalizeConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const info = getAudioFormat(config.format);
	const inputName = 'input' + getMediaExtension(file);
	const outputName = 'output' + info.ext;

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		// EBU R128 loudness normalization. Single-pass — fast, good enough for most uses.
		const args = [
			'-i', inputName,
			'-vn',
			'-af', `loudnorm=I=${config.targetLufs}:TP=-1.5:LRA=11`,
			'-c:a', info.codec
		];
		if (!info.lossless) args.push('-b:a', DEFAULT_BITRATE);
		args.push('-y', outputName);

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: info.mime });

		return {
			blob,
			filename: stripExtension(file.name) + '_normalized' + info.ext,
			originalSize: file.size,
			resultSize: blob.size,
			duration: 0
		};
	} finally {
		ffmpeg.off('progress', handler);
		await tryDelete(ffmpeg, inputName);
		await tryDelete(ffmpeg, outputName);
	}
}
