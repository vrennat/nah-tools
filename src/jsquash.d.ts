// Type declarations for @jsquash/* codec modules (no bundled types)
declare module '@jsquash/jpeg' {
	export function encode(data: ImageData, options?: { quality?: number }): Promise<ArrayBuffer>;
	export function decode(buffer: ArrayBuffer): Promise<ImageData>;
}
declare module '@jsquash/webp' {
	export function encode(data: ImageData, options?: { quality?: number }): Promise<ArrayBuffer>;
	export function decode(buffer: ArrayBuffer): Promise<ImageData>;
}
declare module '@jsquash/avif' {
	export function encode(data: ImageData, options?: { cqLevel?: number }): Promise<ArrayBuffer>;
	export function decode(buffer: ArrayBuffer): Promise<ImageData>;
}
declare module '@jsquash/png' {
	export function encode(data: ImageData): Promise<ArrayBuffer>;
	export function decode(buffer: ArrayBuffer): Promise<ImageData>;
}
declare module '@jsquash/oxipng' {
	export function optimise(data: ImageData, options?: { level?: number }): Promise<ArrayBuffer>;
}
declare module '@jsquash/jxl' {
	export function encode(data: ImageData, options?: { quality?: number }): Promise<ArrayBuffer>;
	export function decode(buffer: ArrayBuffer): Promise<ImageData>;
}
