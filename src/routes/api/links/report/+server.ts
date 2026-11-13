import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB, getKV, getRedirect, reportLink, invalidateRedirectCache } from '$server/db';
import { checkRateLimit } from '$server/safety';
import { dailySalt, hashIdentity } from '$server/creation-limits';

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

	// Store a daily-salted hash, never the IP itself. It still stops one client
	// from filing repeat reports against the same link on the same day.
	const kv = getKV(platform);
	const reporterIp = request.headers.get('cf-connecting-ip');
	const reporterKey = reporterIp
		? await hashIdentity(await dailySalt(kv), 'report', reporterIp)
		: undefined;
	await reportLink(db, short_code, reason, reporterKey);

	// Invalidate KV in case the report triggered auto-deactivation
	await invalidateRedirectCache(kv, db, short_code);

	return json({ success: true });
};
