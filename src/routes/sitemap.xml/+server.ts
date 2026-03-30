import type { RequestHandler } from '@sveltejs/kit';

const SITE = 'https://nah.tools';

const routes: { path: string; changefreq: string; priority: string }[] = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/qr', changefreq: 'weekly', priority: '1.0' },
	{ path: '/links', changefreq: 'weekly', priority: '1.0' },
	{ path: '/pdf', changefreq: 'weekly', priority: '1.0' },
	{ path: '/pdf/merge', changefreq: 'monthly', priority: '0.9' },
	{ path: '/pdf/split', changefreq: 'monthly', priority: '0.9' },
	{ path: '/pdf/rotate', changefreq: 'monthly', priority: '0.8' },
	{ path: '/pdf/remove-pages', changefreq: 'monthly', priority: '0.8' },
	{ path: '/pdf/reorder', changefreq: 'monthly', priority: '0.8' },
	{ path: '/pdf/images-to-pdf', changefreq: 'monthly', priority: '0.8' },
	{ path: '/pdf/pdf-to-images', changefreq: 'monthly', priority: '0.8' },
	{ path: '/pdf/compress', changefreq: 'monthly', priority: '0.7' },
	{ path: '/pdf/page-numbers', changefreq: 'monthly', priority: '0.7' },
	{ path: '/pdf/watermark', changefreq: 'monthly', priority: '0.7' },
	{ path: '/remove', changefreq: 'weekly', priority: '1.0' },
	{ path: '/qr/wifi', changefreq: 'monthly', priority: '0.8' },
	{ path: '/qr/vcard', changefreq: 'monthly', priority: '0.8' },
	{ path: '/qr/email', changefreq: 'monthly', priority: '0.8' },
	{ path: '/qr/phone', changefreq: 'monthly', priority: '0.8' },
	{ path: '/qr/sms', changefreq: 'monthly', priority: '0.8' },
	{ path: '/why', changefreq: 'monthly', priority: '0.7' },
	{ path: '/compare', changefreq: 'monthly', priority: '0.7' },
	{ path: '/privacy', changefreq: 'yearly', priority: '0.3' },
	{ path: '/terms', changefreq: 'yearly', priority: '0.3' }
];

export const GET: RequestHandler = () => {
	const urls = routes
		.map(
			(route) => `  <url>
    <loc>${SITE}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
};

export const prerender = true;
