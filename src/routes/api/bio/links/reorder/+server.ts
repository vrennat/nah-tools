import { json, error } from '@sveltejs/kit';
import { readJson } from '$server/http';
import type { RequestHandler } from './$types';
import { getDB } from '$server/db';
import { authenticateProfile, reorderBioLinks } from '$server/bio-db';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await readJson(request)) as {
		handle: string;
		passphrase: string;
		ordered_ids: number[];
	};

	const { handle, passphrase, ordered_ids } = body;

	if (!handle || !passphrase || !ordered_ids || !Array.isArray(ordered_ids)) {
		throw error(400, 'handle, passphrase, and ordered_ids are required');
	}

	// Cap batch size to prevent unbounded DB work from a single request
	if (ordered_ids.length > 200) {
		throw error(400, 'ordered_ids must not exceed 200 entries');
	}

	await authenticateProfile(db, handle, passphrase);
	await reorderBioLinks(db, handle, ordered_ids);

	return json({ success: true });
};
