import type { CodecInfo, CodecName } from './types';

export const CODECS: CodecInfo[] = [
	{
		name: 'webp',
		label: 'WebP',
		mimeType: 'image/webp',
		extension: 'webp',
		supportsQuality: true,
		qualityRange: [0, 100],
		defaultQuality: 80,
		description: 'Best balance of speed and compression. Widely supported.'
	},
	{
		name: 'jpeg',
		label: 'JPEG',
		mimeType: 'image/jpeg',
		extension: 'jpg',
		supportsQuality: true,
		qualityRange: [0, 100],
		defaultQuality: 75,
		description: 'Universal compatibility. Good compression for photos.'
	},
	{
		name: 'avif',
		label: 'AVIF',
		mimeType: 'image/avif',
		extension: 'avif',
		supportsQuality: true,
		qualityRange: [0, 100],
		defaultQuality: 50,
		description: '40-50% smaller than JPEG. Slower to encode.'
	},
	{
		name: 'png',
		label: 'PNG',
		mimeType: 'image/png',
		extension: 'png',
		supportsQuality: false,
		qualityRange: [0, 6],
		defaultQuality: 2,
		description: 'Lossless. Best for graphics, screenshots, transparency.'
	},
	{
		name: 'oxipng',
		label: 'OxiPNG',
		mimeType: 'image/png',
		extension: 'png',
		supportsQuality: false,
		qualityRange: [0, 6],
		defaultQuality: 2,
		description: 'Optimized PNG. Smaller lossless files than standard PNG.'
	},
	{
		name: 'jxl',
		label: 'JPEG XL',
		mimeType: 'image/jxl',
		extension: 'jxl',
		supportsQuality: true,
		qualityRange: [0, 100],
		defaultQuality: 75,
		description: 'Next-gen format. Excellent quality. Limited browser support.'
	}
];

export const CODEC_MAP = new Map<CodecName, CodecInfo>(CODECS.map((c) => [c.name, c]));

export function getCodec(name: CodecName): CodecInfo {
	const codec = CODEC_MAP.get(name);
	if (!codec) throw new Error(`Unknown codec: ${name}`);
	return codec;
}
