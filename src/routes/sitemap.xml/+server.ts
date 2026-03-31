import type { RequestHandler } from '@sveltejs/kit';

const SITE = 'https://nah.tools';

const routes: { path: string; changefreq: string; priority: string }[] = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/qr', changefreq: 'weekly', priority: '1.0' },
	{ path: '/links', changefreq: 'weekly', priority: '1.0' },
	{ path: '/pdf', changefreq: 'weekly', priority: '1.0' },
	{ path: '/resume', changefreq: 'weekly', priority: '1.0' },
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
	{ path: '/pptx', changefreq: 'weekly', priority: '1.0' },
	{ path: '/pptx/merge', changefreq: 'monthly', priority: '0.9' },
	{ path: '/pptx/split', changefreq: 'monthly', priority: '0.9' },
	{ path: '/pptx/compress', changefreq: 'monthly', priority: '0.8' },
	{ path: '/pptx/extract-images', changefreq: 'monthly', priority: '0.8' },
	{ path: '/pptx/extract-text', changefreq: 'monthly', priority: '0.8' },
	{ path: '/pptx/remove-notes', changefreq: 'monthly', priority: '0.7' },
	{ path: '/pptx/watermark', changefreq: 'monthly', priority: '0.7' },
	{ path: '/pptx/remove-animations', changefreq: 'monthly', priority: '0.7' },
	{ path: '/pptx/slide-numbers', changefreq: 'monthly', priority: '0.7' },
	{ path: '/pptx/metadata', changefreq: 'monthly', priority: '0.7' },
	{ path: '/photo', changefreq: 'weekly', priority: '0.9' },
	{ path: '/photo/rm-bg', changefreq: 'monthly', priority: '0.8' },
	{ path: '/photo/compress', changefreq: 'monthly', priority: '0.8' },
	{ path: '/photo/filters', changefreq: 'monthly', priority: '0.8' },
	{ path: '/remove', changefreq: 'weekly', priority: '1.0' },
	{ path: '/qr/wifi', changefreq: 'monthly', priority: '0.8' },
	{ path: '/qr/vcard', changefreq: 'monthly', priority: '0.8' },
	{ path: '/qr/email', changefreq: 'monthly', priority: '0.8' },
	{ path: '/qr/phone', changefreq: 'monthly', priority: '0.8' },
	{ path: '/qr/sms', changefreq: 'monthly', priority: '0.8' },
	{ path: '/why', changefreq: 'monthly', priority: '0.7' },
	{ path: '/why/qr', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/resume', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/pdf', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/photo', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/links', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/remove', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/invoice', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/protect', changefreq: 'monthly', priority: '0.6' },
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
