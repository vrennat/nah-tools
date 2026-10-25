import { json, error } from '@sveltejs/kit';
import { readJson } from '$server/http';
import type { RequestHandler } from './$types';
import { getDB } from '$server/db';
import { getProfile, logBioClick } from '$server/bio-db';
import { checkIpRateLimit } from '$server/safety';

/** Clicks logged per IP per profile per hour. */
const CLICK_LIMIT_PER_HOUR = 60;

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await readJson(request)) as {
		handle: string;
		link_id: number;
	};

	const { handle, link_id } = body;

	if (!handle || typeof handle !== 'string' || !link_id) {
		throw error(400, 'handle and link_id are required');
	}
	if (handle.length > 32) {
		throw error(400, 'Invalid handle');
	}

	// Rate-limit click logging to prevent artificial inflation. Scoped per
	// profile so a visitor (or a shared NAT) browsing several bio pages is not
	// throttled across them, and kept separate from the create quota.
	if (
		!(await checkIpRateLimit(platform, request, `click:${handle.toLowerCase()}`, 1, {
			max: CLICK_LIMIT_PER_HOUR
		}))
	) {
		throw error(429, 'Rate limit exceeded. Try again later.');
	}

	// Only log clicks for active profiles — prevents inflating stats for deactivated profiles
	const profile = await getProfile(db, handle);
	if (!profile || !profile.is_active) {
		throw error(404, 'Profile not found');
	}

	// Extract geo/device from Cloudflare headers
	const country = (request as any).cf?.country as string | undefined;
	const ua = request.headers.get('user-agent') || '';
	const referer = request.headers.get('referer') || undefined;

	let deviceType = 'desktop';
	if (/mobile|android|iphone|ipad/i.test(ua)) {
		deviceType = /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
	}

	// Fire-and-forget via waitUntil if available
	const doLog = logBioClick(db, handle, link_id, {
		country,
		deviceType,
		referer
	});

	if (platform?.context?.waitUntil) {
		platform.context.waitUntil(doLog);
	} else {
		await doLog;
	}

	return json({ ok: true });
};
