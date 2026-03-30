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

/** Text annotation for PDF editing */
export interface TextAnnotation {
	type: 'text';
	pageIndex: number;
	x: number;
	y: number;
	text: string;
	fontSize: number;
	color: string;
}

/** Image annotation for PDF editing */
export interface ImageAnnotation {
	type: 'image';
	pageIndex: number;
	x: number;
	y: number;
	width: number;
	height: number;
	data: ArrayBuffer;
	imageType: 'png' | 'jpg';
}

/** Freehand drawing annotation for PDF editing */
export interface DrawAnnotation {
	type: 'draw';
	pageIndex: number;
	paths: { x: number; y: number }[][];
	strokeColor: string;
	strokeWidth: number;
}

/** Union type for all PDF edit annotations */
export type EditAnnotation = TextAnnotation | ImageAnnotation | DrawAnnotation;

/** A signature placed on a PDF page */
export interface SignatureField {
	pageIndex: number;
	x: number;
	y: number;
	width: number;
	height: number;
	data: string; // data URL (drawn/typed) or base64
}

/** A text annotation placed on a PDF page */
export interface TextFieldFill {
	pageIndex: number;
	x: number;
	y: number;
	text: string;
	fontSize: number;
	color: string;
}

/** PDF permission flags for encryption */
export interface PDFPermissions {
	printing: boolean;
	copying: boolean;
	modifying: boolean;
	annotating: boolean;
}
