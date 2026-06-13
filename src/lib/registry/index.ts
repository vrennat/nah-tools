import type { FamilyId, ToolEntry, ToolFamily } from './types';
import { pdfTools } from './families/pdf';
import { pptxTools } from './families/pptx';
import { photoTools } from './families/photo';
import { mediaTools } from './families/media';
import { audioTools } from './families/audio';
import { qrTools } from './families/qr';
import { legalGenTools } from './families/legal-gen';
import { standaloneTools } from './families/standalone';

// Derive entries from the three existing registries rather than duplicate them.
// This keeps the registry as the single source of truth while not modifying
// dev/tools.ts, text/tools.ts, or convert/pairs.ts.
import { devTools } from '$dev/tools';
import { textTools } from '$text/tools';
import { allPairs } from '$convert/pairs';

function devToolsToEntries(): ToolEntry[] {
	return devTools.map((t) => ({
		path: `/dev/${t.slug}`,
		family: 'dev' as FamilyId,
		name: t.name,
		description: t.desc,
		icon: t.icon,
		keywords: t.keywords,
		sitemap: { changefreq: 'monthly', priority: 0.9 }
	}));
}

function textToolsToEntries(): ToolEntry[] {
	return textTools.map((t) => ({
		path: `/text/${t.slug}`,
		family: 'text' as FamilyId,
		name: t.name,
		description: t.desc,
		icon: t.icon,
		keywords: t.keywords,
		sitemap: { changefreq: 'monthly', priority: 0.9 }
	}));
}

function convertPairsToEntries(): ToolEntry[] {
	return allPairs.map((p) => ({
		path: `/convert/${p.slug}`,
		family: 'convert' as FamilyId,
		name: p.title,
		description: p.description,
		keywords: [p.sourceFormat.toLowerCase(), p.targetFormat.toLowerCase(), 'convert', 'image'],
		popular: p.popular,
		sitemap: { changefreq: 'monthly', priority: p.popular ? 0.9 : 0.8 }
	}));
}

// Canonical display order. The homepage directory, header nav, and footer all
// render families in this order — change it here and every surface follows.
export const allFamilies: ToolFamily[] = [
	{ id: 'pdf', name: 'PDF Tools', hub: '/pdf', description: 'Merge, split, rotate, compress, convert PDFs in your browser.' },
	{ id: 'photo', name: 'Photo & Image Tools', hub: '/photo', description: 'Convert, compress, remove backgrounds, adjust colors.' },
	{ id: 'convert', name: 'Image Converter', hub: '/convert', description: 'HEIC to JPG, WebP to PNG, SVG to PNG, and 14 more conversions.' },
	{ id: 'qr', name: 'QR Code Generator', hub: '/qr', description: 'Static, dynamic, styled, batch export. No expiration. No paywall.' },
	{ id: 'media', name: 'Video & Audio Tools', hub: '/media', description: 'Trim, compress, convert media files in your browser.' },
	{ id: 'audio', name: 'Audio Tools', hub: '/audio', description: 'Convert, merge, normalize audio files in your browser.' },
	{ id: 'pptx', name: 'PowerPoint Tools', hub: '/pptx', description: 'Merge, split, compress, extract, watermark PPTX files.' },
	{ id: 'dev', name: 'Developer Tools', hub: '/dev', description: 'JSON, Base64, JWT, hash, regex, UUID, and more.' },
	{ id: 'text', name: 'Text Tools', hub: '/text', description: 'Word counter, bulk find and replace.' },
	{ id: 'legal-gen', name: 'Policy Generator', hub: '/legal-gen', description: 'Privacy policy, ToS, cookie policy, DMCA notice.' },
	{ id: 'standalone', name: 'Standalone Tools', hub: null, description: 'Free single-purpose tools — resume, invoice, links, and more.' }
];

export const allTools: ToolEntry[] = [
	...pdfTools,
	...pptxTools,
	...photoTools,
	...mediaTools,
	...audioTools,
	...qrTools,
	...legalGenTools,
	...standaloneTools,
	...devToolsToEntries(),
	...textToolsToEntries(),
	...convertPairsToEntries()
];

/** Returns the ToolEntry for a given path, or undefined if not found. */
export function getTool(path: string): ToolEntry | undefined {
	return allTools.find((t) => t.path === path);
}

/** Returns the ToolFamily for a given id, or undefined if not found. */
export function getFamily(id: FamilyId): ToolFamily | undefined {
	return allFamilies.find((f) => f.id === id);
}

/** Returns all tools belonging to a given family. */
export function getFamilyTools(id: FamilyId): ToolEntry[] {
	return allTools.filter((t) => t.family === id);
}

/**
 * Returns up to `n` related tools for a given path.
 * Uses the `related` field if populated; falls back to same-family siblings
 * when unset. Never returns the tool itself.
 */
export function getRelated(path: string, n = 4): ToolEntry[] {
	const tool = getTool(path);
	if (!tool) return [];

	if (tool.related && tool.related.length > 0) {
		return tool.related
			.slice(0, n)
			.map((p) => getTool(p))
			.filter((t): t is ToolEntry => t !== undefined);
	}

	// Fall back to same-family siblings (excluding self) in definition order.
	return getFamilyTools(tool.family)
		.filter((t) => t.path !== path)
		.slice(0, n);
}
