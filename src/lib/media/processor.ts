import { getFFmpeg } from './ffmpeg-loader';
import { getMediaExtension } from './utils';
import { makeProgressHandler, tryDelete } from './ffmpeg-run';
import { fetchFile } from '@ffmpeg/util';
import type {
	TrimConfig,
	VideoCompressConfig,
	AudioCompressConfig,
	GifConfig,
	SpeedConfig,
	PitchConfig,
	VolumeConfig,
	FadeConfig,
	SilenceRemoveConfig,
	MediaResult,
	ProcessingProgress
} from './types';
import { getAudioFormat, type AudioFormat, type NormalizeConfig } from './audio-types';

// Legacy codec/ext/MIME tables kept for the compress-audio and extract-audio
// functions that predated the richer AudioFormatInfo registry.  The compress-audio
// tool only supports mp3/aac/ogg; extract-audio uses the same three.
type CompressAudioFormat = 'mp3' | 'aac' | 'ogg';

const COMPRESS_AUDIO_CODEC: Record<CompressAudioFormat, string> = {
	mp3: 'libmp3lame',
	aac: 'aac',
	ogg: 'libvorbis'
};

const COMPRESS_AUDIO_EXT: Record<CompressAudioFormat, string> = {
	mp3: '.mp3',
	aac: '.m4a',
	ogg: '.ogg'
};

// aac output uses .m4a (MP4 container), so the MIME must match the container.
const COMPRESS_AUDIO_MIME: Record<CompressAudioFormat, string> = {
	mp3: 'audio/mpeg',
	aac: 'audio/mp4',
	ogg: 'audio/ogg'
};

// Bitrate used when the encoder is lossy and the caller doesn't specify one.
const DEFAULT_BITRATE = '192k';

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
	const ext = COMPRESS_AUDIO_EXT[config.format];
	const outputName = 'output' + ext;

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		const args = [
			'-i', inputName,
			'-b:a', config.bitrate,
			'-c:a', COMPRESS_AUDIO_CODEC[config.format],
			'-y', outputName
		];

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: COMPRESS_AUDIO_MIME[config.format] });

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
	format: CompressAudioFormat,
	onProgress?: (p: ProcessingProgress) => void
): Promise<MediaResult> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getMediaExtension(file);
	const ext = COMPRESS_AUDIO_EXT[format];
	const outputName = 'output' + ext;

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		const args = [
			'-i', inputName,
			'-vn',
			'-c:a', COMPRESS_AUDIO_CODEC[format],
			'-b:a', '192k',
			'-y', outputName
		];

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: COMPRESS_AUDIO_MIME[format] });

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

// ---------------------------------------------------------------------------
// Audio tools: convert, merge, normalize
// Previously in src/lib/audio/processor.ts — unified here so all FFmpeg work
// lives in one engine directory.
// ---------------------------------------------------------------------------

function stripExtension(filename: string): string {
	return filename.replace(/\.[^.]+$/, '');
}

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

// ---------------------------------------------------------------------------
// Speed, pitch, volume, fade, reverse, silence-remove
// ---------------------------------------------------------------------------

/**
 * Builds an atempo filter chain for the given speed multiplier.
 * atempo only accepts values in [0.5, 2.0], so we chain filters for anything
 * outside that range. Examples:
 *   0.25x -> atempo=0.5,atempo=0.5
 *   3.0x  -> atempo=2.0,atempo=1.5
 *   1.5x  -> atempo=1.5  (single filter, within range)
 */
function atempoChain(speed: number): string {
	const filters: string[] = [];
	let remaining = speed;
	while (remaining > 2.0) {
		filters.push('atempo=2.0');
		remaining /= 2.0;
	}
	while (remaining < 0.5) {
		filters.push('atempo=0.5');
		remaining /= 0.5;
	}
	// Final segment — clamp to atempo valid range due to floating-point drift.
	const clamped = Math.min(2.0, Math.max(0.5, remaining));
	filters.push(`atempo=${clamped.toFixed(6)}`);
	return filters.join(',');
}

export async function changeAudioSpeed(
	file: File,
	config: SpeedConfig,
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
		const af = atempoChain(config.speed);
		const args = ['-i', inputName, '-vn', '-af', af, '-c:a', info.codec];
		if (!info.lossless) args.push('-b:a', DEFAULT_BITRATE);
		args.push('-y', outputName);

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: info.mime });

		return {
			blob,
			filename: stripExtension(file.name) + `_${config.speed}x` + info.ext,
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

/**
 * Pitch-shifts audio by `semitones` without changing playback speed.
 *
 * Math: shifting by n semitones means multiplying frequency by 2^(n/12).
 * asetrate changes the sample rate (making FFmpeg play it back faster or slower),
 * aresample restores the original sample rate (resampling the pitch-shifted audio),
 * and atempo compensates the resulting speed change so duration is preserved.
 *
 * atempo factor = 2^(-n/12), which is the inverse of the pitch shift.
 * atempo range [0.5, 2.0] covers n in roughly [-12, +12], so a single filter
 * is sufficient for the supported semitone range.
 *
 * The input sample rate is normalised to 44100 Hz before pitch-shifting so we
 * don't need to probe the file — this avoids an extra FFmpeg pass or AudioContext
 * decode while still producing correct results for all common audio.
 */
export async function shiftAudioPitch(
	file: File,
	config: PitchConfig,
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
		const n = config.semitones;
		const pitchRatio = Math.pow(2, n / 12);
		// Clamp the atempo compensator to its valid range.
		// For n = ±12 the ratio is exactly 2.0 / 0.5, which is the boundary.
		const atempoFactor = Math.min(2.0, Math.max(0.5, 1 / pitchRatio));
		const newRate = Math.round(44100 * pitchRatio);

		// aresample=44100 first ensures a known input rate regardless of source.
		const af = `aresample=44100,asetrate=${newRate},aresample=44100,atempo=${atempoFactor.toFixed(6)}`;

		const args = ['-i', inputName, '-vn', '-af', af, '-c:a', info.codec];
		if (!info.lossless) args.push('-b:a', DEFAULT_BITRATE);
		args.push('-y', outputName);

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: info.mime });

		const sign = n >= 0 ? '+' : '';
		return {
			blob,
			filename: stripExtension(file.name) + `_pitch${sign}${n}st` + info.ext,
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

export async function adjustAudioVolume(
	file: File,
	config: VolumeConfig,
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
		const sign = config.decibels >= 0 ? '+' : '';
		const af = `volume=${config.decibels}dB`;
		const args = ['-i', inputName, '-vn', '-af', af, '-c:a', info.codec];
		if (!info.lossless) args.push('-b:a', DEFAULT_BITRATE);
		args.push('-y', outputName);

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: info.mime });

		return {
			blob,
			filename: stripExtension(file.name) + `_volume${sign}${config.decibels}dB` + info.ext,
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

export async function fadeAudio(
	file: File,
	config: FadeConfig,
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
		const filters: string[] = [];

		if (config.fadeInDuration > 0) {
			filters.push(`afade=t=in:st=0:d=${config.fadeInDuration}`);
		}

		if (config.fadeOutDuration > 0) {
			// Fade out starts at (total duration - fade out duration).
			const fadeOutStart = Math.max(0, config.totalDuration - config.fadeOutDuration);
			filters.push(`afade=t=out:st=${fadeOutStart.toFixed(3)}:d=${config.fadeOutDuration}`);
		}

		const af = filters.join(',');
		const args = ['-i', inputName, '-vn', '-af', af, '-c:a', info.codec];
		if (!info.lossless) args.push('-b:a', DEFAULT_BITRATE);
		args.push('-y', outputName);

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: info.mime });

		return {
			blob,
			filename: stripExtension(file.name) + '_faded' + info.ext,
			originalSize: file.size,
			resultSize: blob.size,
			duration: config.totalDuration
		};
	} finally {
		ffmpeg.off('progress', handler);
		await tryDelete(ffmpeg, inputName);
		await tryDelete(ffmpeg, outputName);
	}
}

export async function reverseAudio(
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
		// areverse buffers the entire stream in memory before reversing it.
		// Very long files may fail on low-RAM devices — documented in the FAQ.
		const args = ['-i', inputName, '-vn', '-af', 'areverse', '-c:a', info.codec];
		if (!info.lossless) args.push('-b:a', DEFAULT_BITRATE);
		args.push('-y', outputName);

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: info.mime });

		return {
			blob,
			filename: stripExtension(file.name) + '_reversed' + info.ext,
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

// ---------------------------------------------------------------------------
// PCM extraction for Whisper transcription
// ---------------------------------------------------------------------------

/**
 * Decodes any audio or video file to 16 kHz mono float32 PCM — the exact
 * format Whisper expects as input. Uses the shared FFmpeg engine so the WASM
 * binary is already cached when the user has used any other audio tool first.
 *
 * The output is a Float32Array of raw PCM samples (little-endian IEEE 754
 * float). Length = duration_seconds * 16000.
 *
 * VFS files are cleaned up in the finally block regardless of success/failure.
 */
export async function extractPcmForTranscription(
	file: File,
	onProgress?: (p: ProcessingProgress) => void
): Promise<Float32Array> {
	const ffmpeg = await getFFmpeg();
	const inputName = 'input' + getMediaExtension(file);
	const outputName = 'output.pcm';

	await ffmpeg.writeFile(inputName, await fetchFile(file));

	const startTime = Date.now();
	const handler = makeProgressHandler(startTime, onProgress);
	ffmpeg.on('progress', handler);

	try {
		// -ar 16000: resample to 16 kHz (Whisper's expected sample rate)
		// -ac 1: mix down to mono
		// -f f32le: raw 32-bit float little-endian
		// -acodec pcm_f32le: PCM float codec
		// -vn: discard any video stream
		await ffmpeg.exec([
			'-i', inputName,
			'-vn',
			'-ar', '16000',
			'-ac', '1',
			'-f', 'f32le',
			'-acodec', 'pcm_f32le',
			'-y', outputName
		]);

		const data = await ffmpeg.readFile(outputName);
		const bytes = data as Uint8Array;

		// Reinterpret the raw bytes as Float32. The Uint8Array buffer may not be
		// aligned on a 4-byte boundary, so we copy into a fresh ArrayBuffer first.
		const aligned = new ArrayBuffer(bytes.byteLength);
		new Uint8Array(aligned).set(bytes);
		return new Float32Array(aligned);
	} finally {
		ffmpeg.off('progress', handler);
		await tryDelete(ffmpeg, inputName);
		await tryDelete(ffmpeg, outputName);
	}
}

export async function removeSilence(
	file: File,
	config: SilenceRemoveConfig,
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
		// silenceremove: remove leading silence (start_periods=1), trailing silence
		// (stop_periods=1), and optionally mid-file silence (stop_periods=-1 would
		// do mid-file but is not exposed in UI to keep things simple and safe).
		// threshold uses dB notation; min duration is in seconds.
		const af = [
			'silenceremove=',
			`start_periods=1:start_silence=${config.minSilenceDuration}:start_threshold=${config.thresholdDb}dB`,
			`:stop_periods=1:stop_silence=${config.minSilenceDuration}:stop_threshold=${config.thresholdDb}dB`
		].join('');

		const args = ['-i', inputName, '-vn', '-af', af, '-c:a', info.codec];
		if (!info.lossless) args.push('-b:a', DEFAULT_BITRATE);
		args.push('-y', outputName);

		await ffmpeg.exec(args);

		const data = await ffmpeg.readFile(outputName);
		const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: info.mime });

		return {
			blob,
			filename: stripExtension(file.name) + '_trimmed' + info.ext,
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
