import type { ToolEntry } from '../types';

// Names and descriptions copied verbatim from src/routes/audio/+page.svelte card grid.
// Order matches the hub page display order.
export const audioTools: ToolEntry[] = [
	{
		path: '/audio/convert',
		family: 'audio',
		name: 'Convert Audio',
		description: 'MP3, WAV, OGG, M4A, FLAC, AAC',
		icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
		keywords: ['convert', 'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'audio'],
		related: ['/audio/merge', '/audio/normalize', '/media/compress-audio', '/media/extract-audio'],
		popular: true,
		sitemap: { changefreq: 'monthly', priority: 0.9 }
	},
	{
		path: '/audio/merge',
		family: 'audio',
		name: 'Merge Audio',
		description: 'Join multiple tracks into one file',
		icon: 'M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z',
		keywords: ['merge', 'join', 'combine', 'tracks', 'audio'],
		related: ['/audio/convert', '/audio/normalize', '/media/trim-audio', '/media/extract-audio'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/audio/normalize',
		family: 'audio',
		name: 'Normalize Volume',
		description: 'Even out loudness (EBU R128)',
		icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
		keywords: ['normalize', 'loudness', 'ebu r128', 'volume', 'audio'],
		related: ['/audio/convert', '/audio/merge', '/media/compress-audio', '/media/extract-audio'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	}
];
