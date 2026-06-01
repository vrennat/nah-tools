// Lightweight SVG optimizer. Strips editor cruft, metadata, and comments, then
// minifies whitespace and (optionally) rounds numbers. DOM-based for safety —
// runs entirely in the browser. No SVGO dependency.

export interface SvgOptimizeOptions {
	removeMetadata: boolean; // <metadata>, <desc>
	removeComments: boolean;
	removeEditorData: boolean; // inkscape:, sodipodi:, Adobe namespaces
	removeTitle: boolean; // <title> — off by default (accessibility)
	collapseWhitespace: boolean;
	roundPrecision: number | null; // decimals to keep, or null to leave numbers alone
}

export const DEFAULT_OPTIONS: SvgOptimizeOptions = {
	removeMetadata: true,
	removeComments: true,
	removeEditorData: true,
	removeTitle: false,
	collapseWhitespace: true,
	roundPrecision: 2
};

const EDITOR_PREFIXES = ['inkscape', 'sodipodi', 'sketch', 'illustrator', 'i', 'dc', 'cc', 'rdf'];

function removeElements(root: Element, selectors: string[]) {
	for (const sel of selectors) {
		root.querySelectorAll(sel).forEach((el) => el.remove());
	}
}

function stripEditorNamespaces(el: Element) {
	// Remove namespaced elements (e.g. sodipodi:namedview) and attributes.
	const children = Array.from(el.children);
	for (const child of children) {
		const prefix = child.tagName.includes(':') ? child.tagName.split(':')[0] : '';
		if (EDITOR_PREFIXES.includes(prefix)) {
			child.remove();
			continue;
		}
		stripEditorNamespaces(child);
	}
	for (const attr of Array.from(el.attributes)) {
		const prefix = attr.name.includes(':') ? attr.name.split(':')[0] : '';
		if (prefix === 'xmlns') {
			const nsName = attr.name.split(':')[1];
			if (EDITOR_PREFIXES.includes(nsName)) el.removeAttribute(attr.name);
		} else if (EDITOR_PREFIXES.includes(prefix)) {
			el.removeAttribute(attr.name);
		}
	}
}

function roundNumbers(svg: string, precision: number): string {
	// Round any decimal number with more than `precision` fractional digits.
	const factor = Math.pow(10, precision);
	return svg.replace(/-?\d*\.\d+(?:e[-+]?\d+)?/gi, (match) => {
		const n = parseFloat(match);
		if (!Number.isFinite(n)) return match;
		const rounded = Math.round(n * factor) / factor;
		return String(rounded);
	});
}

export interface SvgOptimizeResult {
	output: string;
	originalSize: number;
	resultSize: number;
}

export function optimizeSvg(input: string, options: SvgOptimizeOptions = DEFAULT_OPTIONS): SvgOptimizeResult {
	const originalSize = new Blob([input]).size;

	const parser = new DOMParser();
	const doc = parser.parseFromString(input, 'image/svg+xml');
	const svg = doc.querySelector('svg');
	if (!svg || doc.querySelector('parsererror')) {
		throw new Error('Could not parse this file as SVG. Check that it is valid.');
	}

	const toRemove: string[] = [];
	if (options.removeMetadata) toRemove.push('metadata', 'desc');
	if (options.removeTitle) toRemove.push('title');
	if (toRemove.length) removeElements(svg, toRemove);

	if (options.removeEditorData) stripEditorNamespaces(svg);

	const serializer = new XMLSerializer();
	let output = serializer.serializeToString(svg);

	if (options.removeComments) {
		output = output.replace(/<!--[\s\S]*?-->/g, '');
	}

	if (options.roundPrecision !== null) {
		output = roundNumbers(output, options.roundPrecision);
	}

	if (options.collapseWhitespace) {
		output = output
			.replace(/>\s+</g, '><') // whitespace between tags
			.replace(/\s{2,}/g, ' ') // runs of whitespace
			.trim();
	}

	return {
		output,
		originalSize,
		resultSize: new Blob([output]).size
	};
}
