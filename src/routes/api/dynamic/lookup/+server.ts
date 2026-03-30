import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB, authenticateRedirect } from '$server/db';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as { short_code: string; passphrase: string };
	const { short_code, passphrase } = body;

	if (!short_code || !passphrase) {
		throw error(400, 'short_code and passphrase are required');
	}

	const redirect = await authenticateRedirect(db, short_code, passphrase);

	return json({
		short_code: redirect.short_code,
		destination_url: redirect.destination_url,
		label: redirect.label,
		scan_count: redirect.scan_count,
		is_active: redirect.is_active,
		created_at: redirect.created_at,
		updated_at: redirect.updated_at
	});
};
