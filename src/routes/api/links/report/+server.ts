import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB, getKV, getRedirect, reportLink, invalidateRedirectCache } from '$server/db';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as { short_code: string; reason: string };
	const { short_code, reason } = body;

	if (!short_code || typeof short_code !== 'string') {
		throw error(400, 'short_code is required');
	}
	if (!reason || typeof reason !== 'string') {
		throw error(400, 'reason is required');
	}

	const redirect = await getRedirect(db, short_code);
	if (!redirect) {
		throw error(404, 'Link not found');
	}

	const ip = request.headers.get('cf-connecting-ip') || undefined;
	await reportLink(db, short_code, reason, ip);

	// Invalidate KV in case the report triggered auto-deactivation
	await invalidateRedirectCache(getKV(platform), db, short_code);

	return json({ success: true });
};
