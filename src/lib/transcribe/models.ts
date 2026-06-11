/**
 * Whisper model registry for on-device transcription via @huggingface/transformers.
 *
 * Model files are loaded from the HuggingFace Hub CDN on first use and cached
 * by the browser (via the transformers.js built-in cache_utils layer). The
 * library uses IndexedDB / Cache API internally.
 *
 * Self-hosting models on Cloudflare R2 is a planned follow-up; this file is
 * the single place that would need updating when that happens.
 *
 * Size verification method:
 *   GET https://huggingface.co/api/models/<repo>?blobs=true
 *   sum of onnx/encoder_model_quantized.onnx + onnx/decoder_model_merged_quantized.onnx
 *   (the _quantized suffix = q8 dtype, which is the library default on wasm)
 *   Fetched on 2026-06-11.
 */

import type { TranscribeModelInfo } from './types';

/**
 * whisper-tiny.en — English-only, fastest, smallest download.
 * Verified sizes (q8 dtype):
 *   encoder_model_quantized:        10,124,993 bytes
 *   decoder_model_merged_quantized: 30,718,858 bytes
 *   total:                          40,843,851 bytes (~39 MB)
 */
export const WHISPER_TINY_EN: TranscribeModelInfo = {
	id: 'whisper-tiny.en',
	name: 'English Fast',
	hfRepo: 'onnx-community/whisper-tiny.en',
	sizeBytes: 40_843_851,
	sizeLabel: '~39 MB',
	description: 'English-only, ~39 MB download',
	bestFor: 'English speech, fastest processing'
};

/**
 * whisper-base — multilingual, moderate size, good quality balance.
 * Verified sizes (q8 dtype):
 *   encoder_model_quantized:        23,201,314 bytes
 *   decoder_model_merged_quantized: 53,693,343 bytes
 *   total:                          76,894,657 bytes (~73 MB)
 */
export const WHISPER_BASE: TranscribeModelInfo = {
	id: 'whisper-base',
	name: 'Multilingual',
	hfRepo: 'onnx-community/whisper-base',
	sizeBytes: 76_894_657,
	sizeLabel: '~73 MB',
	description: 'Multilingual, ~73 MB download',
	bestFor: 'Non-English languages, accented speech'
};

/**
 * whisper-small — multilingual, higher accuracy, larger download.
 * Verified sizes (q8 dtype):
 *   encoder_model_quantized:        92,326,160 bytes
 *   decoder_model_merged_quantized: 156,750,906 bytes
 *   total:                          249,077,066 bytes (~237 MB)
 */
export const WHISPER_SMALL: TranscribeModelInfo = {
	id: 'whisper-small',
	name: 'High Accuracy',
	hfRepo: 'onnx-community/whisper-small',
	sizeBytes: 249_077_066,
	sizeLabel: '~237 MB',
	description: 'Best accuracy, ~237 MB download',
	bestFor: 'Complex audio, technical content, multiple speakers'
};

export const AVAILABLE_TRANSCRIBE_MODELS: TranscribeModelInfo[] = [
	WHISPER_TINY_EN,
	WHISPER_BASE,
	WHISPER_SMALL
];

export const DEFAULT_TRANSCRIBE_MODEL = WHISPER_TINY_EN;
