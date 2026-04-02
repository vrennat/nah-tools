import type { ModelInfo } from './types';

/**
 * BRIA RMBG-1.4: High-quality background removal, great with people
 * Apache 2.0 license, quantized ONNX from HuggingFace
 * 1024x1024 input, normalize: pixel / 255, output: sigmoid [0,1]
 * Source: https://huggingface.co/briaai/RMBG-1.4
 */
export const RMBG14_MODEL: ModelInfo = {
	id: 'rmbg-1.4-quantized',
	name: 'People',
	url: 'https://pub-d3615a09694b4a43b34573c08523af31.r2.dev/rmbg-1.4-quantized.onnx',
	size: 44_403_226, // ~42 MB
	inputSize: 1024,
	description: 'Best for people & portraits (42 MB)',
	bestFor: 'People, portraits, hair detail'
};

/**
 * IS-Net: General-purpose background removal
 * Apache 2.0 license, ~43MB quantized ONNX (uint8)
 * 1024x1024 input, normalize: pixel / 255
 * Source: https://github.com/xuebinqin/DIS (converted from isnet-general-use.pth)
 */
export const ISNET_MODEL: ModelInfo = {
	id: 'isnet-general-use-q8',
	name: 'General',
	url: 'https://pub-d3615a09694b4a43b34573c08523af31.r2.dev/isnet-general-use-q8.onnx',
	size: 44_636_776, // ~43 MB
	inputSize: 1024,
	description: 'Good all-around model (43 MB)',
	bestFor: 'Objects, products, graphics'
};

/** All available models, ordered by recommendation */
export const AVAILABLE_MODELS: ModelInfo[] = [RMBG14_MODEL, ISNET_MODEL];

/** Cache name for storing downloaded models in the Cache API */
export const MODEL_CACHE_NAME = 'nah-tools-models-v1';

/** Default model for background removal */
export const DEFAULT_BG_MODEL = RMBG14_MODEL;
