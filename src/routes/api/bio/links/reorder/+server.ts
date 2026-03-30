import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$server/db';
import { authenticateProfile, reorderBioLinks } from '$server/bio-db';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as {
		handle: string;
		passphrase: string;
		ordered_ids: number[];
	};

	const { handle, passphrase, ordered_ids } = body;

	if (!handle || !passphrase || !ordered_ids || !Array.isArray(ordered_ids)) {
		throw error(400, 'handle, passphrase, and ordered_ids are required');
	}

	await authenticateProfile(db, handle, passphrase);
	await reorderBioLinks(db, handle, ordered_ids);

	return json({ success: true });
};
