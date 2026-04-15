/**
 * nah — Dynamic QR Code Redirect Worker
 * Deployed to go.nah.tools
 *
 * Handles: go.nah.tools/{code} → KV/D1 lookup → 302 redirect
 * Uses KV cache for hot redirects, falls back to D1 on miss.
 * Click logging via Analytics Engine (free, no D1 writes on hot path).
 */

interface Env {
	DB: D1Database;
	KV: KVNamespace;
	CLICKS: AnalyticsEngineDataset;
}

interface RedirectRow {
	destination_url: string;
	is_active: number;
	short_code: string;
	expires_at: string | null;
	passphrase_hash: string;
	utm_source: string | null;
	utm_medium: string | null;
	utm_campaign: string | null;
	utm_term: string | null;
	utm_content: string | null;
}

function getDeviceType(ua: string): string {
	if (!ua) return 'unknown';
	if (/bot|crawler|spider|crawling/i.test(ua)) return 'bot';
	if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile';
	if (/tablet|ipad/i.test(ua)) return 'tablet';
	return 'desktop';
}

function appendUTM(url: string, utm: Record<string, string | null>): string {
	const parsed = new URL(url);
	for (const [key, value] of Object.entries(utm)) {
		if (value) parsed.searchParams.set(key, value);
	}
	return parsed.toString();
}

const KV_TTL = 3600; // 1 hour

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const code = url.pathname.slice(1); // strip leading /

		// Root or invalid short codes → redirect to main site
		if (!code || code.length < 3) {
			return Response.redirect('https://nah.tools', 302);
		}

		// KV-first lookup, fall back to D1
		const cacheKey = `redirect:${code}`;
		let row: RedirectRow | null = null;

		const cached = await env.KV.get<RedirectRow>(cacheKey, 'json');
		if (cached) {
			row = cached;
		} else {
			row = await env.DB.prepare(
				'SELECT short_code, destination_url, is_active, expires_at, passphrase_hash, utm_source, utm_medium, utm_campaign, utm_term, utm_content FROM redirects WHERE short_code = ? OR custom_alias = ?'
			)
				.bind(code, code)
				.first<RedirectRow>();

			// Cache D1 result in KV for next time
			if (row) {
				ctx.waitUntil(env.KV.put(cacheKey, JSON.stringify(row), { expirationTtl: KV_TTL }));
			}
		}

		if (!row) {
			return new Response('QR code not found.', {
				status: 404,
				headers: { 'Content-Type': 'text/plain' }
			});
		}

		if (!row.is_active) {
			return new Response('This QR code has been deactivated by its owner.', {
				status: 410,
				headers: { 'Content-Type': 'text/plain' }
			});
		}

		// Check expiration
		if (row.expires_at && new Date(row.expires_at) < new Date()) {
			return new Response('This link has expired.', {
				status: 410,
				headers: { 'Content-Type': 'text/plain' }
			});
		}

		// Build destination URL with UTM parameters if present
		let destination = row.destination_url;
		const utm = {
			utm_source: row.utm_source,
			utm_medium: row.utm_medium,
			utm_campaign: row.utm_campaign,
			utm_term: row.utm_term,
			utm_content: row.utm_content
		};
		if (Object.values(utm).some((v) => v !== null)) {
			destination = appendUTM(destination, utm);
		}

		// Log click via Analytics Engine (free, fire-and-forget)
		// Only for passphrase-protected links (someone will view stats)
		if (row.passphrase_hash !== '') {
			const userAgent = request.headers.get('user-agent') || '';
			const referer = request.headers.get('referer') || null;
			const cf = (request as any).cf;

			env.CLICKS.writeDataPoint({
				indexes: [row.short_code],
				blobs: [
					cf?.country || '',
					cf?.city || '',
					cf?.region || '',
					getDeviceType(userAgent),
					referer || '',
					userAgent.slice(0, 256)
				],
				doubles: [Date.now()]
			});
		}

		return Response.redirect(destination, 302);
	}
};
