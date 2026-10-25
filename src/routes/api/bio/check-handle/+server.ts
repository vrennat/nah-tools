import { json, error } from '@sveltejs/kit';
import { readJson } from '$server/http';
import type { RequestHandler } from './$types';
import { getDB } from '$server/db';
import { isHandleAvailable } from '$server/bio-db';
import { validateHandle } from '$server/safety';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await readJson(request)) as { handle: string };
	const { handle } = body;

	if (!handle) {
		throw error(400, 'handle is required');
	}

	const normalized = handle.toLowerCase();
	const validation = validateHandle(normalized);
	if (!validation.valid) {
		return json({ available: false, reason: validation.reason });
	}

	const available = await isHandleAvailable(db, normalized);
	return json({ available });
};
