import type { CodecName } from '$compress/types';

export interface ConversionPair {
	slug: string;
	sourceFormat: string;
	targetFormat: string;
	sourceExtensions: string;
	sourceMimeTypes: string;
	targetCodec: CodecName;
	defaultQuality: number;
	supportsQuality: boolean;
	title: string;
	description: string;
	popular: boolean;
}

export interface ConversionResult {
	blob: Blob;
	filename: string;
	originalSize: number;
	convertedSize: number;
}
