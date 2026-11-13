import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB, generateShortCode, createLink, isAliasAvailable } from '$server/db';
import { hashPassphrase } from '$server/auth';
import { validateUrlSafety, validateAlias, verifyTurnstile } from '$server/safety';
import { enforceCreationLimits } from '$server/creation-limits';
import { normalizeUrl } from '$utils/url';
import { assertModelBudget, gateDeps, judgeWithinBudget, logGateDecision } from '$server/link-gate/route';

/**
 * Each link runs the spam gate (up to 6 fetches, a blocklist lookup per hop
 * and model calls), so a bulk request is capped well below what one Worker
 * invocation can afford.
 */
const MAX_BULK_LINKS = 20;

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = getDB(platform);

	const body = (await request.json()) as {
		links: Array<{ url: string; alias?: string; label?: string }>;
		passphrase?: string;
		turnstile_token?: string;
	};
	const { links, passphrase, turnstile_token } = body;

	if (!links || !Array.isArray(links) || links.length === 0) {
		throw error(400, 'links array is required and must not be empty');
	}

	if (links.length > MAX_BULK_LINKS) {
		throw error(400, `Maximum ${MAX_BULK_LINKS} links per request`);
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

	// Each link in the batch counts against the daily cap.
	const budget = await assertModelBudget(platform, request, '');
	await enforceCreationLimits(platform, request, passphrase, links.length);

	// Hash passphrase if provided, otherwise anonymous
	let passphraseHash = '';
	if (passphrase && typeof passphrase === 'string') {
		if (passphrase.length < 8) {
			throw error(400, 'Passphrase must be at least 8 characters');
		}
		passphraseHash = await hashPassphrase(passphrase);
	}

	const results: Array<{ short_code: string; short_url: string; destination: string; error?: string }> = [];
	const deps = gateDeps(platform, db);

	for (const link of links) {
		try {
			if (!link.url || typeof link.url !== 'string') {
				results.push({ short_code: '', short_url: '', destination: link.url || '', error: 'URL is required' });
				continue;
			}

			const normalized = normalizeUrl(link.url);

			// Validate URL safety
			const safety = await validateUrlSafety(normalized, db);
			if (!safety.safe) {
				results.push({
					short_code: '', short_url: '', destination: link.url,
					error: safety.reason || 'URL is not allowed'
				});
				continue;
			}

			// Validate alias if provided
			if (link.alias) {
				const aliasCheck = validateAlias(link.alias);
				if (!aliasCheck.valid) {
					results.push({
						short_code: '', short_url: '', destination: link.url,
						error: aliasCheck.reason || 'Invalid alias'
					});
					continue;
				}
				const available = await isAliasAvailable(db, link.alias);
				if (!available) {
					results.push({
						short_code: '', short_url: '', destination: link.url,
						error: 'Alias is already taken'
					});
					continue;
				}
			}

			// Every bulk link goes through the spam gate, one at a time.
			const decision = await judgeWithinBudget(platform, normalized, deps, budget);
			logGateDecision(decision);
			if (decision.verdict === 'block') {
				results.push({ short_code: '', short_url: '', destination: link.url, error: decision.message });
				continue;
			}

			const shortCode = generateShortCode();
			await createLink(db, shortCode, normalized, passphraseHash, {
				label: link.label,
				customAlias: link.alias
			});

			const displayCode = link.alias || shortCode;
			results.push({
				short_code: displayCode,
				short_url: `https://go.nah.tools/${displayCode}`,
				destination: link.url
			});
		} catch {
			results.push({
				short_code: '', short_url: '', destination: link.url,
				error: 'Failed to create link'
			});
		}
	}

	return json({ results }, { status: 201 });
};
