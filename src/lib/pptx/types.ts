/**
 * PPTX Tool Types — shared type definitions for PPTX processing.
 */

export interface SlideRange {
	start: number;
	end: number;
}

export interface WatermarkConfig {
	text: string;
	fontSize: number;
	color: string;
	opacity: number;
	rotation: number;
}

export interface SlideNumberConfig {
	position: 'bottom-left' | 'bottom-center' | 'bottom-right';
	fontSize: number;
	startFrom: number;
}

export interface PptxMetadata {
	title: string;
	subject: string;
	creator: string;
	description: string;
	lastModifiedBy: string;
	created: string;
	modified: string;
	revision: string;
	category: string;
	keywords: string;
}

export interface ExtractedImage {
	name: string;
	data: Blob;
	type: string;
}

export interface ExtractedText {
	slideNumber: number;
	text: string;
}

export interface CompressResult {
	data: Uint8Array;
	originalSize: number;
	newSize: number;
	imagesCompressed: number;
}

export type ProgressCallback = (current: number, total: number) => void;
