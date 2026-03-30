/// <reference lib="webworker" />
import * as Comlink from 'comlink';
import type { BackendType } from './types';
import { DEFAULT_BG_MODEL, MODEL_CACHE_NAME } from './models';
import type { ModelInfo } from './types';

let session: Awaited<ReturnType<typeof import('onnxruntime-web').InferenceSession.create>> | null =
	null;
let currentBackend: BackendType = 'wasm';

type ProgressCallback = (loaded: number, total: number) => void;

async function detectBackend(): Promise<BackendType> {
	try {
		if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
			const adapter = await (navigator as any).gpu.requestAdapter();
			if (adapter) return 'webgpu';
		}
	} catch {
		// WebGPU not available
	}
	return 'wasm';
}

async function fetchModelWithCache(
	model: ModelInfo,
	onProgress?: ProgressCallback
): Promise<ArrayBuffer> {
	let cache: Cache | null = null;
	try {
		cache = await caches.open(MODEL_CACHE_NAME);
		const cached = await cache.match(model.url);

		if (cached) {
			const buffer = await cached.arrayBuffer();
			onProgress?.(buffer.byteLength, buffer.byteLength);
			return buffer;
		}
	} catch {
		// Cache API unavailable (e.g. private browsing) — proceed without caching
	}

	const response = await fetch(model.url);
	if (!response.ok) throw new Error(`Failed to download model: ${response.status}`);

	const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
	const total = contentLength || model.size;

	if (!response.body) {
		const buffer = await response.arrayBuffer();
		onProgress?.(buffer.byteLength, buffer.byteLength);
		try {
			await cache?.put(model.url, new Response(buffer.slice(0)));
		} catch { /* caching is best-effort */ }
		return buffer;
	}

	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let loaded = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		loaded += value.byteLength;
		onProgress?.(loaded, total);
	}

	const buffer = new Uint8Array(loaded);
	let offset = 0;
	for (const chunk of chunks) {
		buffer.set(chunk, offset);
		offset += chunk.byteLength;
	}

	// Cache for next time (best-effort)
	try {
		await cache?.put(
			model.url,
			new Response(buffer.buffer.slice(0), {
				headers: { 'Content-Type': 'application/octet-stream' }
			})
		);
	} catch { /* caching is best-effort */ }

	return buffer.buffer;
}

async function loadModel(onProgress?: ProgressCallback): Promise<BackendType> {
	if (session) return currentBackend;

	const ort = await import('onnxruntime-web');

	currentBackend = await detectBackend();

	const modelBuffer = await fetchModelWithCache(DEFAULT_BG_MODEL, onProgress);

	try {
		session = await ort.InferenceSession.create(modelBuffer, {
			executionProviders: [currentBackend]
		});
	} catch (e) {
		// If WebGPU fails, fall back to WASM
		if (currentBackend === 'webgpu') {
			console.warn('WebGPU session creation failed, falling back to WASM:', e);
			currentBackend = 'wasm';
			session = await ort.InferenceSession.create(modelBuffer, {
				executionProviders: ['wasm']
			});
		} else {
			throw e;
		}
	}

	return currentBackend;
}

async function removeBackground(
	imageBitmap: ImageBitmap,
	onProgress?: ProgressCallback
): Promise<{ mask: ImageBitmap; backend: BackendType; inferenceMs: number }> {
	const backend = await loadModel(onProgress);
	if (!session) throw new Error('Model not loaded');

	const ort = await import('onnxruntime-web');
	const modelSize = DEFAULT_BG_MODEL.inputSize;

	// Draw image to OffscreenCanvas and resize to model input
	const canvas = new OffscreenCanvas(modelSize, modelSize);
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(imageBitmap, 0, 0, modelSize, modelSize);
	const imageData = ctx.getImageData(0, 0, modelSize, modelSize);

	// Normalize pixels to [0, 1] and arrange as NCHW tensor
	const { data } = imageData;
	const float32 = new Float32Array(3 * modelSize * modelSize);
	const pixelCount = modelSize * modelSize;

	for (let i = 0; i < pixelCount; i++) {
		const ri = i * 4;
		float32[i] = data[ri] / 255; // R
		float32[pixelCount + i] = data[ri + 1] / 255; // G
		float32[2 * pixelCount + i] = data[ri + 2] / 255; // B
	}

	const inputTensor = new ort.Tensor('float32', float32, [1, 3, modelSize, modelSize]);

	const startTime = performance.now();
	const outputName = session.outputNames[0];
	const results = await session.run(
		{ [session.inputNames[0]]: inputTensor },
		[outputName] // only compute the primary mask output
	);
	const inferenceMs = Math.round(performance.now() - startTime);

	const outputTensor = results[outputName];
	const outputData = outputTensor.data as Float32Array;

	// The output shape is [1, 1, H, W] — extract the spatial dimensions
	const outputH = outputTensor.dims[2] || modelSize;
	const outputW = outputTensor.dims[3] || modelSize;
	const outputPixels = outputH * outputW;

	// Apply sigmoid and convert to grayscale ImageData
	const maskCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
	const maskCtx = maskCanvas.getContext('2d')!;
	const maskImageData = maskCtx.createImageData(outputW, outputH);

	// Output is already sigmoid-activated [0, 1] — min-max normalize to [0, 255]
	let minVal = Infinity;
	let maxVal = -Infinity;
	for (let i = 0; i < outputPixels; i++) {
		const v = outputData[i];
		if (v < minVal) minVal = v;
		if (v > maxVal) maxVal = v;
	}
	const range = maxVal - minVal || 1;

	for (let i = 0; i < outputPixels; i++) {
		const normalized = (outputData[i] - minVal) / range;
		const byte = Math.round(normalized * 255);
		const mi = i * 4;
		maskImageData.data[mi] = byte;
		maskImageData.data[mi + 1] = byte;
		maskImageData.data[mi + 2] = byte;
		maskImageData.data[mi + 3] = 255;
	}

	// Draw mask at output size, then scale to original image size
	const tempCanvas = new OffscreenCanvas(outputW, outputH);
	const tempCtx = tempCanvas.getContext('2d')!;
	tempCtx.putImageData(maskImageData, 0, 0);

	// Scale mask to original image dimensions
	maskCtx.drawImage(tempCanvas, 0, 0, imageBitmap.width, imageBitmap.height);

	const mask = await createImageBitmap(maskCanvas);

	// Clean up
	inputTensor.dispose();
	outputTensor.dispose();

	return { mask, backend, inferenceMs };
}

async function isModelCached(): Promise<boolean> {
	try {
		const cache = await caches.open(MODEL_CACHE_NAME);
		const cached = await cache.match(DEFAULT_BG_MODEL.url);
		return !!cached;
	} catch {
		return false;
	}
}

function getModelInfo() {
	return { ...DEFAULT_BG_MODEL };
}

const workerApi = {
	removeBackground,
	isModelCached,
	getModelInfo,
	detectBackend
};

export type WorkerApi = typeof workerApi;

Comlink.expose(workerApi);
