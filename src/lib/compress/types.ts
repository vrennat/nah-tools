export type CodecName = 'jpeg' | 'webp' | 'avif' | 'png' | 'oxipng' | 'jxl';

export interface CodecInfo {
	name: CodecName;
	label: string;
	mimeType: string;
	extension: string;
	supportsQuality: boolean;
	qualityRange: [min: number, max: number];
	defaultQuality: number;
	description: string;
}

export interface CompressionJob {
	id: string;
	file: File;
	originalSize: number;
	codec: CodecName;
	quality: number;
	status: 'pending' | 'encoding' | 'done' | 'error';
	result?: CompressionResult;
	error?: string;
}

export interface CompressionResult {
	buffer: ArrayBuffer;
	size: number;
	codec: CodecName;
	quality: number;
	encodeTimeMs: number;
	mimeType: string;
	extension: string;
}
