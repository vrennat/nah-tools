import type { ToolEntry } from '../types';

// Registry for /guides — how-to articles that are not themselves tools.
// Structural scaffold only: `name`/`description` are placeholders for the
// "content" workstream to overwrite in the same file when it writes each
// article's body (src/routes/guides/<slug>/+page.svelte). Do not treat the
// placeholder strings below as shippable copy.
//
// `related` is left unset so ArticleShell's related grid falls back to
// same-family siblings (other guides); content can set explicit cross-links
// to relevant tools once an article's content is written.
export const guideTools: ToolEntry[] = [
	{
		path: '/guides/how-to-redact-a-pdf-properly',
		family: 'guides',
		name: 'TBD — content: How to Redact a PDF Properly',
		description: 'TBD — content: placeholder description for SEO/nav card.',
		keywords: ['redact pdf', 'pdf redaction', 'remove sensitive information', 'black out pdf'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	},
	{
		path: '/guides/compress-video-for-email',
		family: 'guides',
		name: 'TBD — content: Compress a Video for Email',
		description: 'TBD — content: placeholder description for SEO/nav card.',
		keywords: ['compress video for email', 'video too large to email', 'shrink video file size'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	},
	{
		path: '/guides/remove-yourself-from-people-search-sites',
		family: 'guides',
		name: 'TBD — content: Remove Yourself From People-Search Sites',
		description: 'TBD — content: placeholder description for SEO/nav card.',
		keywords: ['remove yourself from people search', 'data broker opt out', 'delete personal info online'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	},
	{
		path: '/guides/transcribe-audio-without-uploading',
		family: 'guides',
		name: 'TBD — content: Transcribe Audio Without Uploading It',
		description: 'TBD — content: placeholder description for SEO/nav card.',
		keywords: ['transcribe audio privately', 'on-device transcription', 'offline speech to text'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	},
	{
		path: '/guides/format-a-resume-for-ats',
		family: 'guides',
		name: 'TBD — content: Format a Resume for ATS',
		description: 'TBD — content: placeholder description for SEO/nav card.',
		keywords: ['ats resume format', 'applicant tracking system', 'resume parsing'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	},
	{
		path: '/guides/merge-scanned-and-digital-pdf-pages',
		family: 'guides',
		name: 'TBD — content: Merge Scanned and Digital PDF Pages',
		description: 'TBD — content: placeholder description for SEO/nav card.',
		keywords: ['merge scanned pdf', 'combine scanned and digital pdf', 'merge pdf pages'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	}
];
