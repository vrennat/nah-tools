import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB, authenticateRedirect, generateShortCode, createRedirect, updateRedirect, deactivateRedirect } from '$server/db';
import { hashPassphrase } from '$server/auth';
import { validateUrlSafety } from '$server/safety';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as { url: string; passphrase: string; label?: string };
	const { url, passphrase, label } = body;

	if (!url || typeof url !== 'string') {
		throw error(400, 'URL is required');
	}
	const safety = await validateUrlSafety(url, db);
	if (!safety.safe) {
		throw error(400, safety.reason || 'URL is not allowed');
	}
	if (!passphrase || typeof passphrase !== 'string') {
		throw error(400, 'Passphrase is required');
	}
	if (passphrase.length < 8) {
		throw error(400, 'Passphrase must be at least 8 characters');
	}

	const shortCode = generateShortCode();
	const passphraseHash = await hashPassphrase(passphrase);
	await createRedirect(db, shortCode, url, passphraseHash, label);

	return json(
		{
			short_code: shortCode,
			redirect_url: `https://go.nah.tools/${shortCode}`,
			manage_url: `/qr/manage/${shortCode}`
		},
		{ status: 201 }
	);
};

export const PUT: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as { short_code: string; passphrase: string; url: string };
	const { short_code, passphrase, url } = body;

	if (!short_code || !passphrase || !url) {
		throw error(400, 'short_code, passphrase, and url are required');
	}
	const safety = await validateUrlSafety(url, db);
	if (!safety.safe) {
		throw error(400, safety.reason || 'URL is not allowed');
	}

	await authenticateRedirect(db, short_code, passphrase);
	await updateRedirect(db, short_code, url);
	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as { short_code: string; passphrase: string };
	const { short_code, passphrase } = body;

	if (!short_code || !passphrase) {
		throw error(400, 'short_code and passphrase are required');
	}

	await authenticateRedirect(db, short_code, passphrase);
	await deactivateRedirect(db, short_code);
	return json({ success: true });
};
