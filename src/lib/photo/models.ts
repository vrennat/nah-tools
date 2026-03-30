import type { ModelInfo } from './types';

/**
 * IS-Net: General-purpose background removal
 * Apache 2.0 license, ~43MB quantized ONNX (uint8)
 * 1024x1024 input, normalize: pixel / 255
 * Source: https://github.com/xuebinqin/DIS (converted from isnet-general-use.pth)
 */
export const ISNET_MODEL: ModelInfo = {
	id: 'isnet-general-use-q8',
	name: 'IS-Net',
	url: 'https://pub-d3615a09694b4a43b34573c08523af31.r2.dev/isnet-general-use-q8.onnx',
	size: 44_636_776, // ~43 MB
	inputSize: 1024,
	description: 'Background removal (43 MB)'
};

/** Cache name for storing downloaded models in the Cache API */
export const MODEL_CACHE_NAME = 'nah-tools-models-v1';

/** Default model for background removal */
export const DEFAULT_BG_MODEL = ISNET_MODEL;
