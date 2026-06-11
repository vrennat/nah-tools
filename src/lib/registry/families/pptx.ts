import type { ToolEntry } from '../types';

// Names and descriptions copied verbatim from src/routes/pptx/+page.svelte card grid.
// Order matches the hub page display order.
export const pptxTools: ToolEntry[] = [
	{
		path: '/pptx/merge',
		family: 'pptx',
		name: 'Merge Presentations',
		description: 'Combine multiple PPTX files into one',
		icon: 'M12 4v16m8-8H4',
		keywords: ['merge', 'combine', 'pptx', 'powerpoint'],
		related: ['/pptx/split', '/pptx/compress', '/pptx/remove-notes', '/pptx/watermark'],
		sitemap: { changefreq: 'monthly', priority: 0.9 }
	},
	{
		path: '/pptx/split',
		family: 'pptx',
		name: 'Split Presentation',
		description: 'Extract slides or split into ranges',
		icon: 'M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01',
		keywords: ['split', 'extract', 'slides', 'pptx'],
		related: ['/pptx/merge', '/pptx/extract-images', '/pptx/extract-text', '/pptx/slide-numbers'],
		sitemap: { changefreq: 'monthly', priority: 0.9 }
	},
	{
		path: '/pptx/compress',
		family: 'pptx',
		name: 'Compress PPTX',
		description: 'Reduce file size by compressing images',
		icon: 'M19 14l-7 7m0 0l-7-7m7 7V3',
		keywords: ['compress', 'reduce', 'size', 'pptx'],
		related: ['/pptx/merge', '/pptx/extract-images', '/pptx/remove-notes', '/pptx/remove-animations'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/pptx/extract-images',
		family: 'pptx',
		name: 'Extract Images',
		description: 'Pull all embedded images from a presentation',
		icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
		keywords: ['extract', 'images', 'photos', 'pptx'],
		related: ['/pptx/extract-text', '/pptx/compress', '/pptx/split', '/pptx/metadata'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/pptx/extract-text',
		family: 'pptx',
		name: 'Extract Text',
		description: 'Get all text from every slide',
		icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
		keywords: ['extract', 'text', 'slides', 'pptx'],
		related: ['/pptx/extract-images', '/pptx/split', '/pptx/remove-notes', '/pptx/metadata'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/pptx/remove-notes',
		family: 'pptx',
		name: 'Remove Speaker Notes',
		description: 'Strip notes before sharing',
		icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
		keywords: ['remove', 'notes', 'speaker', 'pptx'],
		related: ['/pptx/watermark', '/pptx/remove-animations', '/pptx/metadata', '/pptx/compress'],
		sitemap: { changefreq: 'monthly', priority: 0.7 }
	},
	{
		path: '/pptx/watermark',
		family: 'pptx',
		name: 'Add Watermark',
		description: 'Add text watermark to all slides',
		icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z M9 13h6m-6 4h4',
		keywords: ['watermark', 'text', 'overlay', 'pptx'],
		related: ['/pptx/remove-notes', '/pptx/slide-numbers', '/pptx/remove-animations', '/pptx/metadata'],
		sitemap: { changefreq: 'monthly', priority: 0.7 }
	},
	{
		path: '/pptx/remove-animations',
		family: 'pptx',
		name: 'Remove Animations',
		description: 'Strip all animations and transitions',
		icon: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18',
		keywords: ['animations', 'transitions', 'remove', 'pptx'],
		related: ['/pptx/remove-notes', '/pptx/compress', '/pptx/watermark', '/pptx/split'],
		sitemap: { changefreq: 'monthly', priority: 0.7 }
	},
	{
		path: '/pptx/slide-numbers',
		family: 'pptx',
		name: 'Add Slide Numbers',
		description: 'Number your slides automatically',
		icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
		keywords: ['slide numbers', 'numbering', 'pptx'],
		related: ['/pptx/watermark', '/pptx/split', '/pptx/merge', '/pptx/metadata'],
		sitemap: { changefreq: 'monthly', priority: 0.7 }
	},
	{
		path: '/pptx/metadata',
		family: 'pptx',
		name: 'Edit Metadata',
		description: 'View and edit title, author, and properties',
		icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
		keywords: ['metadata', 'title', 'author', 'properties', 'pptx'],
		related: ['/pptx/remove-notes', '/pptx/extract-text', '/pptx/compress', '/pptx/watermark'],
		sitemap: { changefreq: 'monthly', priority: 0.7 }
	}
];
