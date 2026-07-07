import type { RequestHandler } from '@sveltejs/kit';
import { allTools, allFamilies } from '$lib/registry/index';

const SITE = 'https://nah.tools';

// Hub routes for families that have a hub — generated from the registry so
// adding a new family automatically appears in the sitemap.
const familyHubRoutes = allFamilies
	.filter((f) => f.hub !== null)
	.map((f) => ({ path: f.hub as string, changefreq: 'weekly', priority: '1.0' }));

// Tool routes from the registry — all tool sub-pages land here automatically.
const toolRoutes = allTools.map((t) => ({
	path: t.path,
	changefreq: t.sitemap?.changefreq ?? 'monthly',
	priority: String(t.sitemap?.priority ?? 0.7)
}));

// Editorial and static routes that are not in the registry.
// These are stable page paths that do not correspond to a ToolEntry.
const staticRoutes: { path: string; changefreq: string; priority: string }[] = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/why', changefreq: 'monthly', priority: '0.7' },
	{ path: '/why/qr', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/resume', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/pdf', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/photo', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/links', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/remove', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/invoice', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/pptx', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/protect', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/signature', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/convert', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/media', changefreq: 'monthly', priority: '0.6' },
	{ path: '/why/legal-gen', changefreq: 'monthly', priority: '0.6' },
	{ path: '/compare', changefreq: 'monthly', priority: '0.7' },
	{ path: '/mcp', changefreq: 'weekly', priority: '0.9' },
	{ path: '/trust', changefreq: 'monthly', priority: '0.6' },
	{ path: '/privacy', changefreq: 'yearly', priority: '0.3' },
	{ path: '/terms', changefreq: 'yearly', priority: '0.3' }
];

// A path can legitimately appear in more than one source (e.g. /qr is both a
// registry entry and a static route). First occurrence wins so each URL is
// emitted exactly once.
const seen = new Set<string>();
const routes = [...staticRoutes, ...familyHubRoutes, ...toolRoutes].filter((route) => {
	if (seen.has(route.path)) return false;
	seen.add(route.path);
	return true;
});

// Resolved once at build time (the sitemap is prerendered), so every deploy
// stamps the sitemap with its build date.
const lastmod = new Date().toISOString().slice(0, 10);

export const GET: RequestHandler = () => {
	const urls = routes
		.map(
			(route) => `  <url>
    <loc>${SITE}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
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
