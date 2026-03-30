import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB, authenticateRedirect, getClickStats } from '$server/db';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as { short_code: string; passphrase: string };
	const { short_code, passphrase } = body;

	if (!short_code || !passphrase) {
		throw error(400, 'short_code and passphrase are required');
	}

	const redirect = await authenticateRedirect(db, short_code, passphrase);
	const stats = await getClickStats(db, short_code);

	return json({
		short_code: redirect.short_code,
		destination_url: redirect.destination_url,
		label: redirect.label,
		custom_alias: redirect.custom_alias,
		scan_count: redirect.scan_count,
		is_active: redirect.is_active,
		created_at: redirect.created_at,
		updated_at: redirect.updated_at,
		expires_at: redirect.expires_at,
		utm_source: redirect.utm_source,
		utm_medium: redirect.utm_medium,
		utm_campaign: redirect.utm_campaign,
		utm_term: redirect.utm_term,
		utm_content: redirect.utm_content,
		stats
	});
};
