/** Metadata about a loaded PDF file */
export interface PdfFileInfo {
	file: File;
	name: string;
	size: number;
	pageCount: number;
	id: string;
}

/** Thumbnail render result */
export interface PageThumbnail {
	pageIndex: number;
	dataUrl: string;
	width: number;
	height: number;
}

/** Page number position options */
export type PageNumberPosition =
	| 'bottom-center'
	| 'bottom-left'
	| 'bottom-right'
	| 'top-center'
	| 'top-left'
	| 'top-right';

/** Page number configuration */
export interface PageNumberConfig {
	position: PageNumberPosition;
	format: string;
	fontSize: number;
	margin: number;
	startNumber: number;
}

/** Watermark configuration */
export interface WatermarkConfig {
	text: string;
	fontSize: number;
	color: string;
	opacity: number;
	rotation: number;
}

/** Page range specification for split */
export interface PageRange {
	start: number;
	end: number;
}

/** Progress callback for multi-page operations */
export type ProgressCallback = (current: number, total: number) => void;
