import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB, isAliasAvailable } from '$server/db';
import { validateAlias } from '$server/safety';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as { alias: string };
	const { alias } = body;

	if (!alias || typeof alias !== 'string') {
		throw error(400, 'alias is required');
	}

	const validation = validateAlias(alias);
	if (!validation.valid) {
		throw error(400, validation.reason || 'Invalid alias');
	}

	const available = await isAliasAvailable(db, alias);

	return json({ available });
};
