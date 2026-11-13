import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB, getKV, getRedirect, reportLink, invalidateRedirectCache } from '$server/db';
import { checkRateLimit } from '$server/safety';
import { reporterKey } from '$server/creation-limits';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	// Rate-limit before touching the database
	const ip = request.headers.get('cf-connecting-ip') || 'unknown';
	if (!checkRateLimit(ip)) {
		throw error(429, 'Rate limit exceeded. Try again later.');
	}

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

	// Store a salted hash of the reporter's network, never the IP itself. It
	// still limits each network to one open report per link.
	const kv = getKV(platform);
	await reportLink(db, short_code, reason, await reporterKey(kv, request.headers.get('cf-connecting-ip')));

	// Invalidate KV in case the report triggered auto-deactivation
	await invalidateRedirectCache(kv, db, short_code);

	return json({ success: true });
};
