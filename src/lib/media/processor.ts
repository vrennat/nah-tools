import { getFFmpeg } from './ffmpeg-loader';
import { getMediaExtension } from './utils';
import { fetchFile } from '@ffmpeg/util';
import type {
	TrimConfig,
	VideoCompressConfig,
	AudioCompressConfig,
	GifConfig,
	MediaResult,
	ProcessingProgress
} from './types';

type AudioFormat = 'mp3' | 'aac' | 'ogg';

const AUDIO_CODEC: Record<AudioFormat, string> = {
	mp3: 'libmp3lame',
	aac: 'aac',
	ogg: 'libvorbis'
};

const AUDIO_EXT: Record<AudioFormat, string> = {
	mp3: '.mp3',
	aac: '.m4a',
	ogg: '.ogg'
};

// aac output uses .m4a (MP4 container), so the MIME must match the container.
const AUDIO_MIME: Record<AudioFormat, string> = {
	mp3: 'audio/mpeg',
	aac: 'audio/mp4',
	ogg: 'audio/ogg'
};


function makeProgressHandler(
	startTime: number,
	onProgress?: (p: ProcessingProgress) => void,
	progressScale = 1,
	progressOffset = 0
) {
	return ({ progress }: { progress: number }) => {
		const elapsed = (Date.now() - startTime) / 1000;
		onProgress?.({
			percent: progressOffset + Math.round(progress * 100 * progressScale),
			timeElapsed: elapsed,
			estimatedTotal: elapsed / (progress || 0.01)
		});
	};
}

// Best-effort VFS delete: a file that was never written (e.g. output on error)
// will throw — swallow it so cleanup doesn't mask the real error.
async function tryDelete(ffmpeg: Awaited<ReturnType<typeof getFFmpeg>>, name: string): Promise<void> {
	try {
		await ffmpeg.deleteFile(name);
	} catch {
		// intentionally swallowed
	}
}

export async function compressVideo(
	file: File,
	config: VideoCompressConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getMediaExtension(file);
	const outputName = 'output.mp4';

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		// -map 0:v:0 selects the first video stream; -map 0:a? maps audio only if
		// present so this doesn't error on silent/no-audio video inputs.
		const args = [
			'-i', inputName,
			'-map', '0:v:0',
			'-map', '0:a?',
			'-c:v', 'libx264',
			'-crf', String(config.crf),
			'-preset', 'medium',
			'-b:a', config.audioBitrate
		];

		if (config.maxWidth && config.maxHeight) {
			args.push(
				'-vf',
				`scale='min(${config.maxWidth},iw)':'min(${config.maxHeight},ih)':force_original_aspect_ratio=decrease`
			);
		}

		if (config.fps) {
			args.push('-r', String(config.fps));
		}

		args.push('-y', outputName);

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });

		return {
			blob,
			filename: file.name.replace(/\.[^.]+$/, '_compressed.mp4'),
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

export async function trimVideo(
	file: File,
	config: TrimConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getMediaExtension(file);
	const outputName = 'output.mp4';

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		const args = [
			'-ss', String(config.startTime),
			'-to', String(config.endTime),
			'-i', inputName,
			'-c', 'copy',
			'-y', outputName
		];

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });

		return {
			blob,
			filename: file.name.replace(/\.[^.]+$/, '_trimmed.mp4'),
			originalSize: file.size,
			resultSize: blob.size,
			duration: config.endTime - config.startTime
		};
	} finally {
		ffmpeg.off('progress', handler);
		await tryDelete(ffmpeg, inputName);
		await tryDelete(ffmpeg, outputName);
	}
}

export async function trimAudio(
	file: File,
	config: TrimConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputExt = getMediaExtension(file);
	const inputName = 'input' + inputExt;
	// Mirror trimVideo: keep the same container/codec so -c copy is always valid.
	const outputName = 'output' + inputExt;

	// Derive MIME from the input extension for the result blob.
	const mimeByExt: Record<string, string> = {
		'.mp3': 'audio/mpeg',
		'.m4a': 'audio/mp4',
		'.aac': 'audio/aac',
		'.ogg': 'audio/ogg',
		'.wav': 'audio/wav',
		'.flac': 'audio/flac',
		'.weba': 'audio/webm',
		'.webm': 'audio/webm'
	};
	const mime = mimeByExt[inputExt.toLowerCase()] ?? 'audio/mpeg';

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		const args = [
			'-ss', String(config.startTime),
			'-to', String(config.endTime),
			'-i', inputName,
			'-c', 'copy',
			'-y', outputName
		];

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: mime });

		return {
			blob,
			filename: file.name.replace(/\.[^.]+$/, '_trimmed' + inputExt),
			originalSize: file.size,
			resultSize: blob.size,
			duration: config.endTime - config.startTime
		};
	} finally {
		ffmpeg.off('progress', handler);
		await tryDelete(ffmpeg, inputName);
		await tryDelete(ffmpeg, outputName);
	}
}

export async function compressAudio(
	file: File,
	config: AudioCompressConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getMediaExtension(file);
	const ext = AUDIO_EXT[config.format];
	const outputName = 'output' + ext;

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		const args = [
			'-i', inputName,
			'-b:a', config.bitrate,
			'-c:a', AUDIO_CODEC[config.format],
			'-y', outputName
		];

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: AUDIO_MIME[config.format] });

		return {
			blob,
			filename: file.name.replace(/\.[^.]+$/, `_compressed${ext}`),
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

export async function videoToGif(
	file: File,
	config: GifConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getMediaExtension(file);
	const paletteFile = 'palette.png';
	const outputName = 'output.gif';

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();

	try {
		// Pass 1: generate palette (0–50% of progress)
		const paletteArgs = [
			'-ss', String(config.startTime),
			'-to', String(config.endTime),
			'-i', inputName,
			'-vf', `fps=${config.fps},scale=${config.width}:-1:flags=lanczos,palettegen`,
			'-y', paletteFile
		];

		const paletteHandler = makeProgressHandler(startTime, onProgress, 0.5, 0);
		ffmpeg.on('progress', paletteHandler);
		try {
			await ffmpeg.exec(paletteArgs);
		} finally {
			ffmpeg.off('progress', paletteHandler);
		}

		// Pass 2: render GIF (50–100% of progress)
		const gifArgs = [
			'-ss', String(config.startTime),
			'-to', String(config.endTime),
			'-i', inputName,
			'-i', paletteFile,
			'-lavfi', `fps=${config.fps},scale=${config.width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
			'-y', outputName
		];

		const gifHandler = makeProgressHandler(startTime, onProgress, 0.5, 50);
		ffmpeg.on('progress', gifHandler);
		try {
			await ffmpeg.exec(gifArgs);
		} finally {
			ffmpeg.off('progress', gifHandler);
		}

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'image/gif' });

		return {
			blob,
			filename: file.name.replace(/\.[^.]+$/, '.gif'),
			originalSize: file.size,
			resultSize: blob.size,
			duration: config.endTime - config.startTime
		};
	} finally {
		await tryDelete(ffmpeg, inputName);
		await tryDelete(ffmpeg, paletteFile);
		await tryDelete(ffmpeg, outputName);
	}
}

export async function extractAudio(
	file: File,
	format: AudioFormat,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getMediaExtension(file);
	const ext = AUDIO_EXT[format];
	const outputName = 'output' + ext;

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		const args = [
			'-i', inputName,
			'-vn',
			'-c:a', AUDIO_CODEC[format],
			'-b:a', '192k',
			'-y', outputName
		];

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: AUDIO_MIME[format] });

		return {
			blob,
			filename: file.name.replace(/\.[^.]+$/, `_audio${ext}`),
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
