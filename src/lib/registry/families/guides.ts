import type { ToolEntry } from '../types';

// Registry for /guides — how-to articles that are not themselves tools.
export const guideTools: ToolEntry[] = [
	{
		path: '/guides/how-to-redact-a-pdf-properly',
		family: 'guides',
		name: 'How to Redact a PDF Properly',
		description: 'Black boxes don’t remove text — how real PDF redaction works, and how to do it free in your browser.',
		keywords: ['redact pdf', 'pdf redaction', 'remove sensitive information', 'black out pdf'],
		related: ['/pdf/redact', '/pdf/protect', '/pdf/watermark'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	},
	{
		path: '/guides/compress-video-for-email',
		family: 'guides',
		name: 'How to Compress a Video for Email',
		description: 'Shrink a video under 25MB without turning it to mush — how video compression actually works, free and in-browser.',
		keywords: ['compress video for email', 'video too large to email', 'shrink video file size'],
		related: ['/media/compress-video', '/media/trim-video', '/media/extract-audio'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	},
	{
		path: '/guides/remove-yourself-from-people-search-sites',
		family: 'guides',
		name: 'How to Remove Yourself From People-Search Sites',
		description: 'How opt-out requests to Spokeo, Whitepages, and other data brokers actually work — and how to send them yourself for free.',
		keywords: ['remove yourself from people search', 'data broker opt out', 'delete personal info online'],
		related: ['/remove'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	},
	{
		path: '/guides/transcribe-audio-without-uploading',
		family: 'guides',
		name: 'How to Transcribe Audio Without Uploading It',
		description: 'On-device Whisper transcription — your recording never leaves the browser. How it works and which model to pick.',
		keywords: ['transcribe audio privately', 'on-device transcription', 'offline speech to text'],
		related: ['/audio/transcribe', '/audio/normalize'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	},
	{
		path: '/guides/format-a-resume-for-ats',
		family: 'guides',
		name: 'How to Format a Resume for ATS',
		description: 'What actually breaks applicant-tracking-system parsing, and how to check your resume for free — no guarantees, just the real checklist.',
		keywords: ['ats resume format', 'applicant tracking system', 'resume parsing'],
		related: ['/resume'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	},
	{
		path: '/guides/merge-scanned-and-digital-pdf-pages',
		family: 'guides',
		name: 'How to Merge Scanned and Digital PDF Pages',
		description: 'Combine a scanned document and a digital PDF into one file, then OCR the scanned pages so the whole thing is searchable.',
		keywords: ['merge scanned pdf', 'combine scanned and digital pdf', 'merge pdf pages'],
		related: ['/pdf/merge', '/pdf/ocr'],
		sitemap: { changefreq: 'monthly', priority: 0.6 }
	}
];
