import { describe, it, expect } from 'vitest';
import { GET } from './+server';

async function callGET() {
	return await GET({} as Parameters<typeof GET>[0]);
}

describe('GET /sitemap.xml', () => {
	it('returns 200 status', async () => {
		const response = await callGET();
		expect(response.status).toBe(200);
	});

	it('has application/xml content type', async () => {
		const response = await callGET();
		expect(response.headers.get('Content-Type')).toBe('application/xml');
	});

	it('contains <urlset> root element', async () => {
		const response = await callGET();
		const body = await response.text();
		expect(body).toContain('<urlset');
	});

	it('contains all expected pages', async () => {
		const response = await callGET();
		const body = await response.text();
		const expectedPaths = ['/', '/qr', '/links', '/why', '/compare', '/privacy', '/terms'];
		for (const path of expectedPaths) {
			expect(body).toContain(`<loc>https://nah.tools${path}</loc>`);
		}
	});

	it('uses https://nah.tools as base URL for every entry', async () => {
		const response = await callGET();
		const body = await response.text();
		const locMatches = body.match(/<loc>(.*?)<\/loc>/g) ?? [];
		expect(locMatches.length).toBeGreaterThan(0);
		for (const loc of locMatches) {
			expect(loc).toContain('https://nah.tools');
		}
	});
});
