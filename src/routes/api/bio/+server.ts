import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$server/db';
import { hashPassphrase } from '$server/auth';
import {
	createProfile,
	authenticateProfile,
	updateProfile,
	deactivateProfile,
	isHandleAvailable,
	addBioLink
} from '$server/bio-db';
import { validateHandle, validateUrlSafety, verifyTurnstile, checkRateLimit } from '$server/safety';
import { normalizeUrl } from '$utils/url';
import { assertModelBudget, gateAllOrThrow, isOwnSite } from '$server/link-gate/route';
import { enforceCreationLimits } from '$server/creation-limits';

/** Each initial link runs the spam gate, so a new profile takes at most this many. */
const MAX_INITIAL_LINKS = 20;
import { themes } from '$bio/themes';

// Derive the allowlist from the canonical theme definitions so this stays in sync automatically
const VALID_THEME_IDS = new Set(themes.map((t) => t.id));

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as {
		handle: string;
		display_name: string;
		bio?: string;
		avatar_url?: string;
		theme?: string;
		passphrase: string;
		links?: { url: string; title: string }[];
		turnstile_token?: string;
	};

	const { handle, display_name, bio, avatar_url, theme, passphrase, links, turnstile_token } =
		body;

	if (!handle || !display_name || !passphrase) {
		throw error(400, 'handle, display_name, and passphrase are required');
	}

	// Input length limits
	if (display_name.length > 100) {
		throw error(400, 'Display name must be 100 characters or fewer');
	}
	if (bio && bio.length > 500) {
		throw error(400, 'Bio must be 500 characters or fewer');
	}
	if (avatar_url && avatar_url.length > 2000) {
		throw error(400, 'Avatar URL is too long');
	}

	// Validate theme against allowlist before persisting
	if (theme !== undefined && !VALID_THEME_IDS.has(theme)) {
		throw error(400, `Invalid theme. Valid themes: ${[...VALID_THEME_IDS].join(', ')}`);
	}

	// Verify Turnstile if configured
	const turnstileSecret = platform?.env?.TURNSTILE_SECRET_KEY;
	if (turnstileSecret) {
		if (!turnstile_token) {
			throw error(400, 'Turnstile verification is required');
		}
		const ip = request.headers.get('cf-connecting-ip') || undefined;
		const valid = await verifyTurnstile(turnstile_token, turnstileSecret, ip);
		if (!valid) {
			throw error(403, 'Turnstile verification failed');
		}
	} else {
		console.warn('TURNSTILE_SECRET_KEY not configured - bot protection disabled');
	}

	// Rate limit
	const ip = request.headers.get('cf-connecting-ip') || 'unknown';
	if (!checkRateLimit(ip)) {
		throw error(429, 'Rate limit exceeded. Try again later.');
	}

	// Validate handle
	const handleCheck = validateHandle(handle.toLowerCase());
	if (!handleCheck.valid) {
		throw error(400, handleCheck.reason || 'Invalid handle');
	}

	const normalizedHandle = handle.toLowerCase();

	// Check availability
	const available = await isHandleAvailable(db, normalizedHandle);
	if (!available) {
		throw error(409, 'This handle is already taken');
	}

	// Validate passphrase
	if (passphrase.length < 8) {
		throw error(400, 'Passphrase must be at least 8 characters');
	}

	if (links !== undefined && links !== null && !Array.isArray(links)) {
		throw error(400, 'links must be an array');
	}
	if (links && links.length > MAX_INITIAL_LINKS) {
		throw error(400, `A new profile can have at most ${MAX_INITIAL_LINKS} links; add more after creating it.`);
	}

	// Validate avatar URL if provided
	if (avatar_url) {
		const safety = await validateUrlSafety(normalizeUrl(avatar_url), db, { forRedirect: false });
		if (!safety.safe) {
			throw error(400, safety.reason || 'Avatar URL is not allowed');
		}
	}

	// Initial links: unsafe ones are skipped as before; then every kept link
	// goes through the spam gate before anything is stored, so a blocked link
	// rejects the request instead of leaving a half-created profile.
	const initialLinks: { url: string; title: string; index: number }[] = [];
	for (let i = 0; i < (links?.length ?? 0); i++) {
		const link = links![i];
		if (!link || typeof link.url !== 'string' || typeof link.title !== 'string' || !link.url || !link.title) continue;
		const normalizedUrl = normalizeUrl(link.url);
		const safety = await validateUrlSafety(normalizedUrl, db, { forRedirect: false });
		if (!safety.safe) continue;
		initialLinks.push({ url: normalizedUrl, title: link.title, index: i });
	}
	// Each initial link costs a destination check, so together they count
	// against the shared per-network link-creation budget, like links added later.
	// At the daily model-call limit, refuse before the allowance is charged
	// (links to nah.tools itself are not checked, so they need no model).
	if (initialLinks.some((link) => !isOwnSite(link.url))) {
		await assertModelBudget(platform, '');
	}
	if (initialLinks.length > 0) {
		await enforceCreationLimits(platform, request, passphrase, initialLinks.length);
	}
	// Checked a few at a time, not one by one (twenty slow destinations would
	// take minutes) and not all at once (queued fetches would time out and be
	// allowed unchecked). Any block rejects the request before anything is written.
	await gateAllOrThrow(
		platform,
		db,
		initialLinks.map((link) => link.url),
		{ forRedirect: false }
	);

	const passphraseHash = await hashPassphrase(passphrase);

	const profile = await createProfile(
		db,
		normalizedHandle,
		display_name,
		bio ?? null,
		avatar_url ?? null,
		theme ?? 'minimal',
		passphraseHash
	);

	for (const link of initialLinks) {
		await addBioLink(db, normalizedHandle, link.url, link.title, null, link.index);
	}

	return json(
		{
			handle: profile.handle,
			profile_url: `https://nah.tools/bio/${profile.handle}`,
			manage_url: `/bio/manage/${profile.handle}`
		},
		{ status: 201 }
	);
};

export const PUT: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as {
		handle: string;
		passphrase: string;
		display_name?: string;
		bio?: string | null;
		avatar_url?: string | null;
		theme?: string;
	};

	const { handle, passphrase, ...fields } = body;

	if (!handle || !passphrase) {
		throw error(400, 'handle and passphrase are required');
	}

	await authenticateProfile(db, handle, passphrase);

	// Input length limits
	if (fields.display_name && fields.display_name.length > 100) {
		throw error(400, 'Display name must be 100 characters or fewer');
	}
	if (fields.bio && fields.bio.length > 500) {
		throw error(400, 'Bio must be 500 characters or fewer');
	}

	// Validate theme against allowlist
	if (fields.theme !== undefined && !VALID_THEME_IDS.has(fields.theme)) {
		throw error(400, `Invalid theme. Valid themes: ${[...VALID_THEME_IDS].join(', ')}`);
	}

	// Validate avatar URL if changing
	if (fields.avatar_url) {
		const safety = await validateUrlSafety(normalizeUrl(fields.avatar_url), db, { forRedirect: false });
		if (!safety.safe) {
			throw error(400, safety.reason || 'Avatar URL is not allowed');
		}
	}

	await updateProfile(db, handle, fields);

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as { handle: string; passphrase: string };
	const { handle, passphrase } = body;

	if (!handle || !passphrase) {
		throw error(400, 'handle and passphrase are required');
	}

	await authenticateProfile(db, handle, passphrase);
	await deactivateProfile(db, handle);

	return json({ success: true });
};
