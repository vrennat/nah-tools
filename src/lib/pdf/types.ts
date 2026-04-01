/** Page metadata derived from pdf-lib document */
export interface PageMeta {
	index: number;
	width: number; // PDF points
	height: number; // PDF points
	rotation: number; // 0, 90, 180, 270
	label: string; // "Page 1", "Page 2", etc.
}

/** Transform state for a rendered page */
export interface PageTransform {
	scale: number; // zoom * (CSS px / PDF point)
	rotation: number; // 0, 90, 180, 270
	pdfWidth: number; // page width in PDF points
	pdfHeight: number; // page height in PDF points
	canvasWidth: number; // rendered width in CSS pixels
	canvasHeight: number; // rendered height in CSS pixels
}

/** Active tool in the editor */
export type EditorTool = 'select' | 'text' | 'draw' | 'highlight' | 'form';

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

/** Extracted table data from a PDF page */
export interface ExtractedTable {
	headers: string[];
	rows: string[][];
	pageIndex: number;
}

/** OCR configuration */
export interface OCRConfig {
	language: string; // Tesseract language code: 'eng', 'spa', 'fra', etc.
}

/** PDF permission flags for encryption */
export interface PDFPermissions {
	printing: boolean;
	copying: boolean;
	modifying: boolean;
	annotating: boolean;
}

/** Crop/margin trim configuration — values in PDF points (1pt = 1/72 inch) */
export interface CropConfig {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/** Extracted image from a PDF */
export interface ExtractedImage {
	id: string;
	pageNumber: number;
	width: number;
	height: number;
	dataUrl: string;
	blob: Blob;
}

export interface PdfAPreparationConfig {
	conformanceLevel: 'PDF/A-1b' | 'PDF/A-2b';
	title?: string;
}

export interface PdfAPreparationResult {
	data: Uint8Array;
	warnings: string[];
}

/** Options for PDF comparison */
export interface CompareOptions {
	scale?: number;
	diffColor?: [number, number, number];
	threshold?: number;
}

/** Result of comparing a single page pair */
export interface PageCompareResult {
	pageIndex: number;
	originalDataUrl: string;
	revisedDataUrl: string;
	diffDataUrl: string;
	diffPixelCount: number;
	totalPixelCount: number;
	diffPercent: number;
	width: number;
	height: number;
}

/** Redaction region in percentage coordinates (0-1) relative to page dimensions */
export interface RedactRegion {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface RedactPageConfig {
	pageIndex: number;
	regions: RedactRegion[];
}

export interface RedactConfig {
	pages: RedactPageConfig[];
	scale?: number;
}
