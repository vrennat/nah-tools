/// <reference lib="webworker" />
import * as Comlink from 'comlink';
import type { CodecName, CompressionResult } from './types';
import { getCodec } from './codecs';

const codecModules = new Map<string, any>();

async function loadCodec(name: CodecName) {
	if (codecModules.has(name)) return codecModules.get(name);

	let mod: any;
	switch (name) {
		case 'jpeg':
			mod = await import('@jsquash/jpeg');
			break;
		case 'webp':
			mod = await import('@jsquash/webp');
			break;
		case 'avif':
			mod = await import('@jsquash/avif');
			break;
		case 'png':
			mod = await import('@jsquash/png');
			break;
		case 'oxipng':
			mod = await import('@jsquash/oxipng');
			break;
		case 'jxl':
			mod = await import('@jsquash/jxl');
			break;
		default:
			throw new Error(`Unknown codec: ${name}`);
	}

	codecModules.set(name, mod);
	return mod;
}

async function decodeImage(buffer: ArrayBuffer, mimeType: string): Promise<ImageData> {
	if (mimeType.includes('svg') || needsBitmapFallback(mimeType)) {
		// jsquash codecs don't support these formats — fall back to browser's native decoder
		const blob = new Blob([buffer], { type: mimeType });
		const bitmap = await createImageBitmap(blob);
		const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
		const ctx = canvas.getContext('2d')!;
		ctx.drawImage(bitmap, 0, 0);
		bitmap.close();
		return ctx.getImageData(0, 0, canvas.width, canvas.height);
	}

	let codecName: CodecName;
	if (mimeType.includes('jpeg') || mimeType.includes('jpg')) codecName = 'jpeg';
	else if (mimeType.includes('webp')) codecName = 'webp';
	else if (mimeType.includes('avif')) codecName = 'avif';
	else if (mimeType.includes('png')) codecName = 'png';
	else if (mimeType.includes('jxl')) codecName = 'jxl';
	else throw new Error(`Unsupported image type: ${mimeType}`);

	const mod = await loadCodec(codecName);
	return mod.decode(buffer);
}

function needsBitmapFallback(mimeType: string): boolean {
	return (
		mimeType.includes('gif') ||
		mimeType.includes('bmp') ||
		mimeType.includes('tiff') ||
		mimeType.includes('heic') ||
		mimeType.includes('heif')
	);
}

async function encode(
	imageData: ImageData,
	codec: CodecName,
	quality: number
): Promise<CompressionResult> {
	const codecInfo = getCodec(codec);
	const mod = await loadCodec(codec);
	const start = performance.now();

	let encoded: ArrayBuffer;

	if (codec === 'png') {
		encoded = await mod.encode(imageData);
	} else if (codec === 'oxipng') {
		encoded = await mod.optimise(imageData, { level: quality });
	} else if (codec === 'avif') {
		// AVIF quality: cqLevel where lower = better quality
		// Map 0-100 quality to 63-0 cqLevel
		const cqLevel = Math.round(63 - (quality / 100) * 63);
		encoded = await mod.encode(imageData, { cqLevel });
	} else {
		encoded = await mod.encode(imageData, { quality });
	}

	const encodeTimeMs = Math.round(performance.now() - start);

	return {
		buffer: encoded,
		size: encoded.byteLength,
		codec,
		quality,
		encodeTimeMs,
		mimeType: codecInfo.mimeType,
		extension: codecInfo.extension
	};
}

async function compress(
	buffer: ArrayBuffer,
	mimeType: string,
	codec: CodecName,
	quality: number
): Promise<CompressionResult> {
	const imageData = await decodeImage(buffer, mimeType);
	return encode(imageData, codec, quality);
}

async function compressFromImageData(
	imageData: ImageData,
	codec: CodecName,
	quality: number
): Promise<CompressionResult> {
	return encode(imageData, codec, quality);
}

async function convert(
	buffer: ArrayBuffer,
	sourceMimeType: string,
	targetCodec: CodecName,
	quality: number
): Promise<CompressionResult> {
	// Special case: HEIC needs heic2any first
	if (sourceMimeType.includes('heic') || sourceMimeType.includes('heif')) {
		const heicBlob = new Blob([buffer], { type: sourceMimeType });
		const { default: heic2any } = await import('heic2any');
		const result = await heic2any({ blob: heicBlob, toType: 'image/jpeg', quality: 0.95 });
		const jpegBlob = Array.isArray(result) ? result[0] : result;
		buffer = await jpegBlob.arrayBuffer();
		sourceMimeType = 'image/jpeg';
	}
	return compress(buffer, sourceMimeType, targetCodec, quality);
}

const workerApi = {
	compress,
	compressFromImageData,
	decodeImage,
	convert
};

export type WorkerApi = typeof workerApi;

Comlink.expose(workerApi);
