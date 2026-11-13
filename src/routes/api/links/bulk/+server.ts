import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB, generateShortCode, createLink, isAliasAvailable } from '$server/db';
import { hashPassphrase } from '$server/auth';
import { validateUrlSafety, validateAlias, verifyTurnstile } from '$server/safety';
import { enforceCreationLimits } from '$server/creation-limits';
import { normalizeUrl } from '$utils/url';
import { judgeDestination } from '$server/link-gate';
import { gateDeps, scheduleRecheck, HOLD_NOTICE } from '$server/link-gate/route';

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

	if (links.length > 100) {
		throw error(400, 'Maximum 100 links per request');
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
	await enforceCreationLimits(platform, request, passphrase, links.length);

	// Hash passphrase if provided, otherwise anonymous
	let passphraseHash = '';
	if (passphrase && typeof passphrase === 'string') {
		if (passphrase.length < 8) {
			throw error(400, 'Passphrase must be at least 8 characters');
		}
		passphraseHash = await hashPassphrase(passphrase);
	}

	const results: Array<{
		short_code: string;
		short_url: string;
		destination: string;
		error?: string;
		status?: 'active' | 'held';
		notice?: string;
	}> = [];
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

			// Every bulk link goes through the spam gate, one at a time. If the
			// gate cannot finish (model down, subrequest limit), the link is held.
			const decision = await judgeDestination(normalized, deps);
			if (decision.verdict === 'block') {
				results.push({ short_code: '', short_url: '', destination: link.url, error: decision.reason });
				continue;
			}
			const holdReason = decision.verdict === 'hold' ? decision.holdReason : null;

			const shortCode = generateShortCode();
			await createLink(db, shortCode, normalized, passphraseHash, {
				label: link.label,
				customAlias: link.alias,
				holdReason
			});
			scheduleRecheck(platform, db, shortCode, normalized, holdReason);

			const displayCode = link.alias || shortCode;
			results.push({
				short_code: displayCode,
				short_url: `https://go.nah.tools/${displayCode}`,
				destination: link.url,
				status: holdReason ? 'held' : 'active',
				...(holdReason ? { notice: HOLD_NOTICE } : {})
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
