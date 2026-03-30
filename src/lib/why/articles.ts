export interface Article {
	slug: string;
	title: string;
	summary: string;
	related: string[];
	toolHref: string;
	toolCta: string;
	datePublished: string;
	dateModified: string;
}

export const articles: Article[] = [
	{
		slug: 'qr',
		title: 'The QR Code Shakedown',
		summary: '1,500,000% markup on a free algorithm. 9,000+ one-star reviews.',
		related: ['links', 'pdf'],
		toolHref: '/qr',
		toolCta: 'Create a free QR code',
		datePublished: '2026-03-15',
		dateModified: '2026-03-30'
	},
	{
		slug: 'resume',
		title: 'The Resume Shakedown',
		summary: 'Four brands, one company, $628 million from paywalled PDFs.',
		related: ['pdf', 'invoice'],
		toolHref: '/resume',
		toolCta: 'Build your resume for free',
		datePublished: '2026-03-30',
		dateModified: '2026-03-30'
	},
	{
		slug: 'pdf',
		title: 'The PDF Shakedown',
		summary: '$96/year to fill out government forms your taxes already paid for.',
		related: ['resume', 'invoice'],
		toolHref: '/pdf',
		toolCta: 'Use free PDF tools',
		datePublished: '2026-03-30',
		dateModified: '2026-03-30'
	},
	{
		slug: 'photo',
		title: 'The Background Removal Shakedown',
		summary: 'Perfect result shown, then ransomed at $2 per image.',
		related: ['pdf', 'qr'],
		toolHref: '/photo/rm-bg',
		toolCta: 'Remove backgrounds for free',
		datePublished: '2026-03-30',
		dateModified: '2026-03-30'
	},
	{
		slug: 'links',
		title: 'The Link Shortener Shakedown',
		summary: '$348/year for a database lookup that takes four milliseconds.',
		related: ['qr', 'invoice'],
		toolHref: '/links',
		toolCta: 'Shorten links for free',
		datePublished: '2026-03-30',
		dateModified: '2026-03-30'
	},
	{
		slug: 'remove',
		title: 'The Data Broker Shakedown',
		summary: '$129/year to exercise rights you already have. The $20 option works better.',
		related: ['links', 'resume'],
		toolHref: '/remove',
		toolCta: 'Start removing your data for free',
		datePublished: '2026-03-30',
		dateModified: '2026-03-30'
	},
	{
		slug: 'invoice',
		title: 'The Invoice Shakedown',
		summary: '"Free forever" until the $405 million acquisition check clears.',
		related: ['pdf', 'resume'],
		toolHref: '/invoice',
		toolCta: 'Create an invoice for free',
		datePublished: '2026-03-30',
		dateModified: '2026-03-30'
	}
];

export function getArticle(slug: string): Article | undefined {
	return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string): Article[] {
	const article = getArticle(slug);
	if (!article) return [];
	return article.related.map((r) => getArticle(r)).filter((a): a is Article => a !== undefined);
}
