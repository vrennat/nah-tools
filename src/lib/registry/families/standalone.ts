import type { ToolEntry } from '../types';

// Standalone tools: no family hub (hub is null in ToolFamily).
// Names and descriptions sourced from the landing page and header nav.
export const standaloneTools: ToolEntry[] = [
	{
		path: '/resume',
		family: 'standalone',
		name: 'Resume Builder',
		description: 'ATS-optimized, PDF and DOCX export.',
		keywords: ['resume', 'cv', 'ats', 'pdf', 'docx'],
		popular: true,
		sitemap: { changefreq: 'weekly', priority: 1.0 }
	},
	{
		path: '/invoice',
		family: 'standalone',
		name: 'Invoice Generator',
		description: 'Multi-currency, tax support, PDF export.',
		keywords: ['invoice', 'billing', 'tax', 'pdf'],
		sitemap: { changefreq: 'weekly', priority: 0.9 }
	},
	{
		path: '/signature',
		family: 'standalone',
		name: 'Email Signatures',
		description: 'HTML signatures, free templates.',
		keywords: ['email', 'signature', 'html', 'gmail', 'outlook'],
		sitemap: { changefreq: 'weekly', priority: 1.0 }
	},
	{
		path: '/links',
		family: 'standalone',
		name: 'Link Shortener',
		description: 'Custom aliases, click analytics, UTM builder.',
		keywords: ['link shortener', 'url', 'analytics', 'utm'],
		popular: true,
		sitemap: { changefreq: 'weekly', priority: 1.0 }
	},
	{
		path: '/bio',
		family: 'standalone',
		name: 'Link in Bio',
		description: 'Your links, your page, no signup.',
		keywords: ['link in bio', 'linktree', 'page'],
		sitemap: { changefreq: 'weekly', priority: 0.9 }
	},
	{
		path: '/remove',
		family: 'standalone',
		name: 'Data Removal',
		description: 'Remove your info from 25+ data brokers.',
		keywords: ['data removal', 'privacy', 'data brokers', 'opt-out'],
		sitemap: { changefreq: 'weekly', priority: 1.0 }
	}
];
