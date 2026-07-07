import { describe, it, expect } from 'vitest';
import { GET } from './+server';

// The complete set of <loc> URLs the sitemap must emit.
// This list was captured from the original hardcoded sitemap and is the
// authoritative record — any drift will fail this test.
const EXPECTED_PATHS = [
	// Static / editorial
	'/',
	'/why',
	'/why/qr',
	'/why/resume',
	'/why/pdf',
	'/why/photo',
	'/why/links',
	'/why/remove',
	'/why/invoice',
	'/why/pptx',
	'/why/protect',
	'/why/signature',
	'/why/convert',
	'/why/media',
	'/why/legal-gen',
	'/compare',
	'/mcp',
	'/trust',
	'/privacy',
	'/terms',
	// Family hubs
	'/pdf',
	'/pptx',
	'/photo',
	'/convert',
	'/media',
	'/audio',
	'/dev',
	'/text',
	'/qr',
	'/legal-gen',
	// PDF tools
	'/pdf/merge',
	'/pdf/split',
	'/pdf/rotate',
	'/pdf/remove-pages',
	'/pdf/reorder',
	'/pdf/images-to-pdf',
	'/pdf/pdf-to-images',
	'/pdf/pdf-to-svg',
	'/pdf/compress',
	'/pdf/flatten',
	'/pdf/page-numbers',
	'/pdf/watermark',
	'/pdf/edit',
	'/pdf/fill-sign',
	'/pdf/word-to-pdf',
	'/pdf/protect',
	'/pdf/unlock',
	'/pdf/pdf-to-csv',
	'/pdf/ocr',
	'/pdf/crop',
	'/pdf/extract-images',
	'/pdf/pdfa',
	'/pdf/compare',
	'/pdf/redact',
	// PPTX tools
	'/pptx/merge',
	'/pptx/split',
	'/pptx/compress',
	'/pptx/extract-images',
	'/pptx/extract-text',
	'/pptx/remove-notes',
	'/pptx/watermark',
	'/pptx/remove-animations',
	'/pptx/slide-numbers',
	'/pptx/metadata',
	// Photo tools
	'/photo/rm-bg',
	'/photo/compress',
	'/photo/filters',
	'/photo/exif',
	'/photo/crop',
	'/photo/favicon',
	'/photo/svg-optimize',
	// Media tools
	'/media/compress-video',
	'/media/trim-video',
	'/media/trim-audio',
	'/media/compress-audio',
	'/media/video-to-gif',
	'/media/extract-audio',
	// Audio tools
	'/audio/convert',
	'/audio/merge',
	'/audio/normalize',
	'/audio/speed',
	'/audio/pitch',
	'/audio/volume',
	'/audio/fade',
	'/audio/reverse',
	'/audio/silence-remove',
	'/audio/record',
	'/audio/transcribe',
	// QR landing pages
	'/qr/wifi',
	'/qr/vcard',
	'/qr/email',
	'/qr/phone',
	'/qr/sms',
	// Legal gen tools
	'/legal-gen/privacy-policy',
	'/legal-gen/terms-of-service',
	'/legal-gen/cookie-policy',
	'/legal-gen/dmca-notice',
	// Standalone tools
	'/resume',
	'/invoice',
	'/signature',
	'/links',
	'/bio',
	'/remove',
	// Dev tools
	'/dev/json',
	'/dev/base64',
	'/dev/jwt',
	'/dev/url',
	'/dev/hash',
	'/dev/uuid',
	'/dev/regex',
	'/dev/cron',
	'/dev/timestamp',
	'/dev/color',
	'/dev/qr-reader',
	'/dev/diff',
	'/dev/password',
	'/dev/markdown',
	'/dev/lorem',
	'/dev/case',
	// Text tools
	'/text/word-count',
	'/text/find-replace',
	'/text/summarize',
	// Convert pairs
	'/convert/heic-to-jpg',
	'/convert/heic-to-png',
	'/convert/webp-to-png',
	'/convert/webp-to-jpg',
	'/convert/png-to-webp',
	'/convert/jpg-to-webp',
	'/convert/png-to-jpg',
	'/convert/jpg-to-png',
	'/convert/svg-to-png',
	'/convert/avif-to-png',
	'/convert/avif-to-jpg',
	'/convert/png-to-avif',
	'/convert/jpg-to-avif',
	'/convert/jxl-to-png',
	'/convert/bmp-to-png',
	'/convert/gif-to-png',
	'/convert/tiff-to-jpg'
];

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

	it('contains every expected URL (exact set — additions fail here)', async () => {
		const response = await callGET();
		const body = await response.text();
		for (const path of EXPECTED_PATHS) {
			expect(body, `missing: ${path}`).toContain(`<loc>https://nah.tools${path}</loc>`);
		}
	});

	it('emits no unexpected URLs beyond the expected set', async () => {
		const response = await callGET();
		const body = await response.text();
		const locMatches = body.match(/<loc>https:\/\/nah\.tools(.*?)<\/loc>/g) ?? [];
		const emittedPaths = locMatches.map((m) =>
			m.replace('<loc>https://nah.tools', '').replace('</loc>', '')
		);
		const expectedSet = new Set(EXPECTED_PATHS);
		for (const path of emittedPaths) {
			expect(expectedSet.has(path), `unexpected URL in sitemap: ${path}`).toBe(true);
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

	it('should emit each URL exactly once', async () => {
		const response = await callGET();
		const xml = await response.text();
		const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
		expect(new Set(locs).size).toBe(locs.length);
	});
});
