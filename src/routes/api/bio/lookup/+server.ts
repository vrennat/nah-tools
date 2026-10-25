import { json, error } from '@sveltejs/kit';
import { readJson } from '$server/http';
import type { RequestHandler } from './$types';
import { withPassphraseLimit } from '$server/passphrase-limit';
import { getDB } from '$server/db';
import { authenticateProfile, getAllBioLinks, getBioClickStats } from '$server/bio-db';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	const db = getDB(platform);

	const body = (await readJson(request)) as { handle: string; passphrase: string };
	const { handle, passphrase } = body;

	if (!handle || !passphrase) {
		throw error(400, 'handle and passphrase are required');
	}

	const profile = await withPassphraseLimit({ platform, request, locals }, `bio:${handle}`, () =>
		authenticateProfile(db, handle, passphrase)
	);
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
