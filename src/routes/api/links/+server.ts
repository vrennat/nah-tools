import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getDB,
	authenticateRedirect,
	generateShortCode,
	createLink,
	isAliasAvailable,
	deactivateRedirect
} from '$server/db';
import { hashPassphrase } from '$server/auth';
import { validateUrlSafety, validateAlias, verifyTurnstile, checkRateLimit } from '$server/safety';
import { normalizeUrl } from '$utils/url';

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as {
		url: string;
		passphrase?: string;
		alias?: string;
		label?: string;
		expires_at?: string;
		utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
		turnstile_token?: string;
	};
	const { url, passphrase, alias, label, expires_at, utm, turnstile_token } = body;

	if (!url || typeof url !== 'string') {
		throw error(400, 'URL is required');
	}

	const normalizedUrl = normalizeUrl(url);

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
	}

	// Rate limit
	const ip = request.headers.get('cf-connecting-ip') || 'unknown';
	if (!checkRateLimit(ip)) {
		throw error(429, 'Rate limit exceeded. Try again later.');
	}

	// Validate URL safety
	const safety = await validateUrlSafety(normalizedUrl, db);
	if (!safety.safe) {
		throw error(400, safety.reason || 'URL is not allowed');
	}

	// Validate alias if provided
	if (alias) {
		const aliasCheck = validateAlias(alias);
		if (!aliasCheck.valid) {
			throw error(400, aliasCheck.reason || 'Invalid alias');
		}
		const available = await isAliasAvailable(db, alias);
		if (!available) {
			throw error(409, 'This alias is already taken');
		}
	}

	// Hash passphrase if provided, otherwise anonymous
	let passphraseHash = '';
	if (passphrase && typeof passphrase === 'string') {
		if (passphrase.length < 8) {
			throw error(400, 'Passphrase must be at least 8 characters');
		}
		passphraseHash = await hashPassphrase(passphrase);
	}

	const shortCode = generateShortCode();
	await createLink(db, shortCode, normalizedUrl, passphraseHash, {
		label,
		customAlias: alias,
		expiresAt: expires_at,
		utm
	});

	const displayCode = alias || shortCode;

	const response: { short_code: string; short_url: string; manage_url?: string } = {
		short_code: displayCode,
		short_url: `https://go.nah.tools/${displayCode}`
	};

	if (passphraseHash) {
		response.manage_url = `/links/manage/${displayCode}`;
	}

	return json(response, { status: 201 });
};

export const PUT: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as {
		short_code: string;
		passphrase: string;
		url: string;
		utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
	};
	const { short_code, passphrase, url } = body;

	if (!short_code || !passphrase || !url) {
		throw error(400, 'short_code, passphrase, and url are required');
	}

	const normalizedUrl = normalizeUrl(url);

	// Validate URL safety
	const safety = await validateUrlSafety(normalizedUrl, db);
	if (!safety.safe) {
		throw error(400, safety.reason || 'URL is not allowed');
	}

	await authenticateRedirect(db, short_code, passphrase);

	// Update destination URL
	await db
		.prepare(
			`UPDATE redirects SET destination_url = ?, utm_source = ?, utm_medium = ?, utm_campaign = ?, utm_term = ?, utm_content = ?, updated_at = datetime('now')
			 WHERE short_code = ? OR custom_alias = ?`
		)
		.bind(
			normalizedUrl,
			body.utm?.source ?? null,
			body.utm?.medium ?? null,
			body.utm?.campaign ?? null,
			body.utm?.term ?? null,
			body.utm?.content ?? null,
			short_code,
			short_code
		)
		.run();

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
