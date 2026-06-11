import type { ToolEntry } from '../types';

// Names and descriptions copied verbatim from src/routes/legal-gen/+page.svelte card grid.
// Order matches the hub page display order.
export const legalGenTools: ToolEntry[] = [
	{
		path: '/legal-gen/privacy-policy',
		family: 'legal-gen',
		name: 'Privacy Policy',
		description: 'Explain how you collect, use, and protect user data. Includes GDPR and CCPA compliance.',
		icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
		keywords: ['privacy policy', 'gdpr', 'ccpa', 'data', 'legal'],
		sitemap: { changefreq: 'monthly', priority: 0.9 }
	},
	{
		path: '/legal-gen/terms-of-service',
		family: 'legal-gen',
		name: 'Terms of Service',
		description: 'Protect your business with clear usage terms, liability limits, and dispute resolution.',
		icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
		keywords: ['terms of service', 'tos', 'legal', 'agreement'],
		sitemap: { changefreq: 'monthly', priority: 0.9 }
	},
	{
		path: '/legal-gen/cookie-policy',
		family: 'legal-gen',
		name: 'Cookie Policy',
		description: 'Disclose your cookie practices and tracking technologies. GDPR and CCPA compliant.',
		keywords: ['cookie policy', 'gdpr', 'ccpa', 'tracking', 'legal'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/legal-gen/dmca-notice',
		family: 'legal-gen',
		name: 'DMCA Notice',
		description: 'Establish your copyright compliance procedures and handling of infringement claims.',
		icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
		keywords: ['dmca', 'copyright', 'infringement', 'legal'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	}
];
