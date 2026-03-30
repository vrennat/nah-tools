import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$server/db';
import { authenticateProfile, addBioLink, updateBioLink, deleteBioLink } from '$server/bio-db';
import { validateUrlSafety } from '$server/safety';
import { normalizeUrl } from '$utils/url';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as {
		handle: string;
		passphrase: string;
		url: string;
		title: string;
		icon?: string;
		order_index?: number;
	};

	const { handle, passphrase, url, title, icon, order_index } = body;

	if (!handle || !passphrase || !url || !title) {
		throw error(400, 'handle, passphrase, url, and title are required');
	}

	await authenticateProfile(db, handle, passphrase);

	const normalizedUrl = normalizeUrl(url);
	const safety = await validateUrlSafety(normalizedUrl, db);
	if (!safety.safe) {
		throw error(400, safety.reason || 'URL is not allowed');
	}

	const link = await addBioLink(db, handle, normalizedUrl, title, icon ?? null, order_index ?? 0);

	return json({ link }, { status: 201 });
};

export const PUT: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as {
		handle: string;
		passphrase: string;
		link_id: number;
		url?: string;
		title?: string;
		icon?: string | null;
		is_active?: number;
	};

	const { handle, passphrase, link_id, ...fields } = body;

	if (!handle || !passphrase || !link_id) {
		throw error(400, 'handle, passphrase, and link_id are required');
	}

	await authenticateProfile(db, handle, passphrase);

	// Validate URL if changing
	if (fields.url) {
		const normalizedUrl = normalizeUrl(fields.url);
		const safety = await validateUrlSafety(normalizedUrl, db);
		if (!safety.safe) {
			throw error(400, safety.reason || 'URL is not allowed');
		}
		fields.url = normalizedUrl;
	}

	await updateBioLink(db, handle, link_id, fields);

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as {
		handle: string;
		passphrase: string;
		link_id: number;
	};

	const { handle, passphrase, link_id } = body;

	if (!handle || !passphrase || !link_id) {
		throw error(400, 'handle, passphrase, and link_id are required');
	}

	await authenticateProfile(db, handle, passphrase);
	await deleteBioLink(db, handle, link_id);

	return json({ success: true });
};
