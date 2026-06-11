import type { ToolEntry } from '../types';

// Names and descriptions copied verbatim from src/routes/photo/+page.svelte card grid.
// Order matches the hub page display order.
// Note: the photo hub also shows '/convert' as a card — that card is kept in the
// convert family; the hub page will be updated to pull from both families.
export const photoTools: ToolEntry[] = [
	{
		path: '/photo/rm-bg',
		family: 'photo',
		name: 'Background Remover',
		description: 'Remove image backgrounds instantly. Free, unlimited, full resolution.',
		icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z',
		keywords: ['background', 'remove', 'transparent', 'png', 'photo'],
		popular: true,
		related: ['/photo/compress', '/photo/filters', '/convert/png-to-webp', '/photo/exif'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/photo/compress',
		family: 'photo',
		name: 'Image Compression',
		description: 'Compress to WebP, AVIF, JPEG, PNG, or JPEG XL with full quality control.',
		icon: 'M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859',
		keywords: ['compress', 'webp', 'avif', 'jpeg', 'png', 'jxl', 'photo'],
		related: ['/convert/heic-to-jpg', '/convert/webp-to-png', '/convert/png-to-webp', '/photo/rm-bg'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/photo/filters',
		family: 'photo',
		name: 'Color Correction',
		description: 'Brightness, contrast, exposure, temperature, and more. Real-time WebGL2.',
		icon: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75',
		keywords: ['filters', 'brightness', 'contrast', 'exposure', 'color', 'photo'],
		related: ['/photo/compress', '/photo/rm-bg', '/photo/exif', '/photo/crop'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/photo/exif',
		family: 'photo',
		name: 'EXIF Viewer & Remover',
		description: 'See camera, timestamp, and GPS data — then strip it before sharing.',
		icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
		keywords: ['exif', 'metadata', 'gps', 'camera', 'photo'],
		related: ['/photo/compress', '/photo/rm-bg', '/convert/heic-to-jpg', '/photo/filters'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/photo/crop',
		family: 'photo',
		name: 'Social Media Crop',
		description: 'Pixel-perfect crops for Instagram, Twitter, LinkedIn, and YouTube.',
		icon: 'M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zM6.75 2.25v4.5m0 0H2.25m13.902 1.487l1.536-.887m-1.536.887a3 3 0 105.196-3 3 3 0 00-5.196 3zm1.536-.887V2.25m0 4.5h4.5',
		keywords: ['crop', 'social media', 'instagram', 'twitter', 'photo'],
		related: ['/photo/compress', '/photo/filters', '/photo/exif', '/convert/png-to-webp'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/photo/favicon',
		family: 'photo',
		name: 'Favicon Generator',
		description: 'Multi-size favicon.ico plus a full PNG icon set from one image.',
		icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
		keywords: ['favicon', 'ico', 'icon', 'png', 'photo'],
		related: ['/photo/compress', '/convert/svg-to-png', '/photo/svg-optimize', '/photo/crop'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/photo/svg-optimize',
		family: 'photo',
		name: 'SVG Optimizer',
		description: 'Strip editor metadata and minify SVG markup to shrink file size.',
		icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5',
		keywords: ['svg', 'optimize', 'minify', 'compress', 'photo'],
		related: ['/convert/svg-to-png', '/photo/favicon', '/photo/compress', '/photo/filters'],
		sitemap: { changefreq: 'monthly', priority: 0.7 }
	}
];
