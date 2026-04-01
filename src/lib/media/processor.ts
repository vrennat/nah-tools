import { getFFmpeg } from './ffmpeg-loader';
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

const AUDIO_MIME: Record<AudioFormat, string> = {
	mp3: 'audio/mpeg',
	aac: 'audio/aac',
	ogg: 'audio/ogg'
};

function getExtension(filename: string): string {
	const match = filename.match(/\.[^.]+$/);
	return match ? match[0] : '';
}

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

export async function compressVideo(
	file: File,
	config: VideoCompressConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getExtension(file.name);
	const outputName = 'output.mp4';

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const args = ['-i', inputName, '-c:v', 'libx264', '-crf', String(config.crf), '-preset', 'medium', '-b:a', config.audioBitrate];

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

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	await ffmpeg.exec(args);
	ffmpeg.off('progress', handler);

	const data = await ffmpeg.readFile(outputName);
	const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });

	await ffmpeg.deleteFile(inputName);
	await ffmpeg.deleteFile(outputName);

	return {
		blob,
		filename: file.name.replace(/\.[^.]+$/, '_compressed.mp4'),
		originalSize: file.size,
		resultSize: blob.size,
		duration: 0
	};
}

export async function trimVideo(
	file: File,
	config: TrimConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getExtension(file.name);
	const outputName = 'output.mp4';

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const args = [
		'-ss', String(config.startTime),
		'-to', String(config.endTime),
		'-i', inputName,
		'-c', 'copy',
		'-y', outputName
	];

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	await ffmpeg.exec(args);
	ffmpeg.off('progress', handler);

	const data = await ffmpeg.readFile(outputName);
	const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });

	await ffmpeg.deleteFile(inputName);
	await ffmpeg.deleteFile(outputName);

	return {
		blob,
		filename: file.name.replace(/\.[^.]+$/, '_trimmed.mp4'),
		originalSize: file.size,
		resultSize: blob.size,
		duration: config.endTime - config.startTime
	};
}

export async function trimAudio(
	file: File,
	config: TrimConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getExtension(file.name);
	const outputName = 'output.mp3';

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const args = [
		'-ss', String(config.startTime),
		'-to', String(config.endTime),
		'-i', inputName,
		'-c', 'copy',
		'-y', outputName
	];

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	await ffmpeg.exec(args);
	ffmpeg.off('progress', handler);

	const data = await ffmpeg.readFile(outputName);
	const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'audio/mpeg' });

	await ffmpeg.deleteFile(inputName);
	await ffmpeg.deleteFile(outputName);

	return {
		blob,
		filename: file.name.replace(/\.[^.]+$/, '_trimmed.mp3'),
		originalSize: file.size,
		resultSize: blob.size,
		duration: config.endTime - config.startTime
	};
}

export async function compressAudio(
	file: File,
	config: AudioCompressConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getExtension(file.name);
	const ext = AUDIO_EXT[config.format];
	const outputName = 'output' + ext;

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const args = [
		'-i', inputName,
		'-b:a', config.bitrate,
		'-c:a', AUDIO_CODEC[config.format],
		'-y', outputName
	];

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	await ffmpeg.exec(args);
	ffmpeg.off('progress', handler);

	const data = await ffmpeg.readFile(outputName);
	const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: AUDIO_MIME[config.format] });

	await ffmpeg.deleteFile(inputName);
	await ffmpeg.deleteFile(outputName);

	return {
		blob,
		filename: file.name.replace(/\.[^.]+$/, `_compressed${ext}`),
		originalSize: file.size,
		resultSize: blob.size,
		duration: 0
	};
}

export async function videoToGif(
	file: File,
	config: GifConfig,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getExtension(file.name);
	const paletteFile = 'palette.png';
	const outputName = 'output.gif';

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();

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
	await ffmpeg.exec(paletteArgs);
	ffmpeg.off('progress', paletteHandler);

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
	await ffmpeg.exec(gifArgs);
	ffmpeg.off('progress', gifHandler);

	const data = await ffmpeg.readFile(outputName);
	const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'image/gif' });

	await ffmpeg.deleteFile(inputName);
	await ffmpeg.deleteFile(paletteFile);
	await ffmpeg.deleteFile(outputName);

	return {
		blob,
		filename: file.name.replace(/\.[^.]+$/, '.gif'),
		originalSize: file.size,
		resultSize: blob.size,
		duration: config.endTime - config.startTime
	};
}

export async function extractAudio(
	file: File,
	format: AudioFormat,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getExtension(file.name);
	const ext = AUDIO_EXT[format];
	const outputName = 'output' + ext;

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const args = [
		'-i', inputName,
		'-vn',
		'-c:a', AUDIO_CODEC[format],
		'-b:a', '192k',
		'-y', outputName
	];

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	await ffmpeg.exec(args);
	ffmpeg.off('progress', handler);

	const data = await ffmpeg.readFile(outputName);
	const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: AUDIO_MIME[format] });

	await ffmpeg.deleteFile(inputName);
	await ffmpeg.deleteFile(outputName);

	return {
		blob,
		filename: file.name.replace(/\.[^.]+$/, `_audio${ext}`),
		originalSize: file.size,
		resultSize: blob.size,
		duration: 0
	};
}
