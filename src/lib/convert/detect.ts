import { allPairs } from './pairs';
import type { ConversionPair } from './types';

/** Deduped accept string across every pair, for the universal dropzone. */
export const allSourceExtensions = [
	...new Set(allPairs.flatMap((p) => p.sourceExtensions.split(',')))
].join(',');

/** Map a filename to its source format label (e.g. "HEIC"), or null if unsupported. */
export function detectSourceFormat(filename: string): string | null {
	const ext = '.' + (filename.split('.').pop() ?? '').toLowerCase();
	const pair = allPairs.find((p) => p.sourceExtensions.split(',').includes(ext));
	return pair?.sourceFormat ?? null;
}

/** Target formats every given source format can convert to (pair-matrix intersection). */
export function commonTargets(sourceFormats: string[]): string[] {
	if (sourceFormats.length === 0) return [];
	const targetsPerSource = sourceFormats.map(
		(s) => new Set(allPairs.filter((p) => p.sourceFormat === s).map((p) => p.targetFormat))
	);
	return [...targetsPerSource[0]].filter((t) => targetsPerSource.every((set) => set.has(t)));
}

export function resolvePair(
	sourceFormat: string,
	targetFormat: string
): ConversionPair | undefined {
	return allPairs.find((p) => p.sourceFormat === sourceFormat && p.targetFormat === targetFormat);
}

/**
 * Browsers often report an empty `File.type` for less-common formats (HEIC on
 * Chrome, TIFF on some platforms). Resolve the MIME from the pairs registry by
 * extension so the decode worker always receives a usable source type.
 */
export function resolveSourceMime(file: File): string {
	const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
	const pair = allPairs.find((p) => p.sourceExtensions.split(',').includes(ext));
	return pair?.sourceMimeTypes.split(',')[0] ?? file.type;
}
