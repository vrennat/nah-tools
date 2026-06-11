import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$server/db';
import { getProfile, logBioClick } from '$server/bio-db';
import { checkRateLimit } from '$server/safety';

export const POST: RequestHandler = async ({ request, platform }) => {
	// Rate-limit click logging to prevent artificial inflation
	const ip = request.headers.get('cf-connecting-ip') || 'unknown';
	if (!checkRateLimit(ip)) {
		throw error(429, 'Rate limit exceeded. Try again later.');
	}

	const db = getDB(platform);

	const body = (await request.json()) as {
		handle: string;
		link_id: number;
	};

	const { handle, link_id } = body;

	if (!handle || !link_id) {
		throw error(400, 'handle and link_id are required');
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
