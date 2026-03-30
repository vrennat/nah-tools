/**
 * Nah Tools — Dynamic QR Code Redirect Worker
 * Deployed to go.nah.tools
 *
 * Handles: go.nah.tools/{short_code} → D1 lookup → 302 redirect
 * Also increments scan counter (fire-and-forget, non-blocking)
 */

interface Env {
	DB: D1Database;
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

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const code = url.pathname.slice(1); // strip leading /

		// Root or invalid short codes → redirect to main site
		if (!code || code.length < 6) {
			return Response.redirect('https://nah.tools', 302);
		}

		const row = await env.DB.prepare(
			'SELECT short_code, destination_url, is_active, expires_at, passphrase_hash, utm_source, utm_medium, utm_campaign, utm_term, utm_content FROM redirects WHERE short_code = ? OR custom_alias = ?'
		)
			.bind(code, code)
			.first<RedirectRow>();

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

		// Fire-and-forget: scan counter increment + click logging (non-blocking)
		const shortCode = row.short_code;
		const userAgent = request.headers.get('user-agent') || '';
		const referer = request.headers.get('referer') || null;
		const cf = (request as any).cf;

		ctx.waitUntil(
			(async () => {
				// Always increment scan count
				await env.DB.prepare(
					'UPDATE redirects SET scan_count = scan_count + 1 WHERE short_code = ?'
				)
					.bind(shortCode)
					.run();

				// Only log clicks for links with a passphrase (someone will view stats)
				if (row.passphrase_hash !== '') {
					await env.DB.prepare(
						'INSERT INTO click_logs (short_code, country, city, region, device_type, referer, user_agent, clicked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
					)
						.bind(
							shortCode,
							cf?.country || null,
							cf?.city || null,
							cf?.region || null,
							getDeviceType(userAgent),
							referer,
							userAgent.slice(0, 256),
							new Date().toISOString()
						)
						.run();
				}
			})()
		);

		return Response.redirect(destination, 302);
	}
};
