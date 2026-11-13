import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$server/db';
import { authenticateProfile, addBioLink, updateBioLink, deleteBioLink } from '$server/bio-db';
import { validateUrlSafety } from '$server/safety';
import { normalizeUrl } from '$utils/url';
import { enforceCreationLimits } from '$server/creation-limits';
import { assertModelBudget, gateDestinationOrThrow, isOwnSite } from '$server/link-gate/route';

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

	// Server-side length caps
	if (title.length > 200) {
		throw error(400, 'title must be 200 characters or fewer');
	}
	if (icon && icon.length > 500) {
		throw error(400, 'icon must be 500 characters or fewer');
	}

	await authenticateProfile(db, handle, passphrase);

	const normalizedUrl = normalizeUrl(url);
	const safety = await validateUrlSafety(normalizedUrl, db, { forRedirect: false });
	if (!safety.safe) {
		throw error(400, safety.reason || 'URL is not allowed');
	}

	// Each new link costs a destination check, so it shares the link-creation budget.
	if (!isOwnSite(normalizedUrl)) await assertModelBudget(platform, normalizedUrl);
	await enforceCreationLimits(platform, request, passphrase);
	await gateDestinationOrThrow(platform, db, normalizedUrl, { forRedirect: false });

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

	// Server-side length caps
	if (fields.title && fields.title.length > 200) {
		throw error(400, 'title must be 200 characters or fewer');
	}
	if (fields.icon && fields.icon.length > 500) {
		throw error(400, 'icon must be 500 characters or fewer');
	}

	// Validate URL if changing. The management page sends the URL with every
	// edit, so an unchanged URL (a title-only edit) is not checked or charged again.
	if (fields.url) {
		const normalizedUrl = normalizeUrl(fields.url);
		const current = await db
			.prepare('SELECT url FROM bio_links WHERE id = ? AND profile_handle = ?')
			.bind(link_id, handle)
			.first<{ url: string }>();
		if (current?.url !== normalizedUrl) {
			const safety = await validateUrlSafety(normalizedUrl, db, { forRedirect: false });
			if (!safety.safe) {
				throw error(400, safety.reason || 'URL is not allowed');
			}
			if (!isOwnSite(normalizedUrl)) await assertModelBudget(platform, normalizedUrl);
			await enforceCreationLimits(platform, request, passphrase);
			await gateDestinationOrThrow(platform, db, normalizedUrl, { forRedirect: false });
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
