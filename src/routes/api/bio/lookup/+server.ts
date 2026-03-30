import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$server/db';
import { authenticateProfile, getAllBioLinks, getBioClickStats } from '$server/bio-db';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as { handle: string; passphrase: string };
	const { handle, passphrase } = body;

	if (!handle || !passphrase) {
		throw error(400, 'handle and passphrase are required');
	}

	const profile = await authenticateProfile(db, handle, passphrase);
	const links = await getAllBioLinks(db, handle);
	const stats = await getBioClickStats(db, handle);

	return json({
		handle: profile.handle,
		display_name: profile.display_name,
		bio: profile.bio,
		avatar_url: profile.avatar_url,
		theme: profile.theme,
		is_active: profile.is_active,
		created_at: profile.created_at,
		updated_at: profile.updated_at,
		links,
		stats
	});
};
