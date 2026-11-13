/**
 * D1 Database Helpers
 * Query helpers for dynamic QR code CRUD
 */

import { error } from '@sveltejs/kit';
import type { DynamicCode, ClickLog, ClickStats, UTMParams } from '$qr/types';
import { verifyPassphrase } from '$server/auth';
import type { HoldReason } from '$server/link-gate/decide';

/** Extract and validate the D1 database binding */
export function getDB(platform: App.Platform | undefined): D1Database {
	const db = platform?.env?.DB;
	if (!db) throw error(500, 'Database not available');
	return db;
}

/** Extract the KV namespace binding */
export function getKV(platform: App.Platform | undefined): KVNamespace {
	const kv = platform?.env?.KV;
	if (!kv) throw error(500, 'KV not available');
	return kv;
}

/** Invalidate KV cache for a redirect (by short_code, and custom_alias if set) */
export async function invalidateRedirectCache(
	kv: KVNamespace,
	db: D1Database,
	shortCode: string
): Promise<void> {
	const row = await db
		.prepare('SELECT short_code, custom_alias FROM redirects WHERE short_code = ? OR custom_alias = ?')
		.bind(shortCode, shortCode)
		.first<{ short_code: string; custom_alias: string | null }>();

	if (!row) return;

	const deletes: Promise<void>[] = [kv.delete(`redirect:${row.short_code}`)];
	if (row.custom_alias) {
		deletes.push(kv.delete(`redirect:${row.custom_alias}`));
	}
	if (shortCode !== row.short_code && shortCode !== row.custom_alias) {
		deletes.push(kv.delete(`redirect:${shortCode}`));
	}
	await Promise.all(deletes);
}

/** Look up a redirect and verify the passphrase, or throw */
export async function authenticateRedirect(
	db: D1Database,
	shortCode: string,
	passphrase: string
): Promise<DynamicCode> {
	const redirect = await getRedirect(db, shortCode);
	if (!redirect) throw error(404, 'Dynamic code not found');
	const valid = await verifyPassphrase(passphrase, redirect.passphrase_hash);
	if (!valid) throw error(403, 'Invalid passphrase');
	return redirect;
}

/** Generate an 8-char alphanumeric short code */
export function generateShortCode(): string {
	return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}

/** Validate a destination URL */
export function isValidURL(url: string): boolean {
	try {
		const parsed = new URL(url);
		// Block dangerous schemes
		const blocked = ['javascript:', 'data:', 'file:', 'vbscript:'];
		if (blocked.some((s) => parsed.protocol === s)) return false;
		// Must be http or https
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

/** Create a new dynamic redirect */
export async function createRedirect(
	db: D1Database,
	shortCode: string,
	destinationUrl: string,
	passphraseHash: string,
	label?: string,
	holdReason: HoldReason | null = null
): Promise<DynamicCode> {
	const result = await db
		.prepare(
			`INSERT INTO redirects (short_code, destination_url, passphrase_hash, label, is_active, hold_reason)
			 VALUES (?, ?, ?, ?, ?, ?)
			 RETURNING *`
		)
		.bind(shortCode, destinationUrl, passphraseHash, label ?? null, holdReason ? 0 : 1, holdReason)
		.first<DynamicCode>();

	if (!result) throw new Error('Failed to create redirect');
	return result;
}

/** Look up a dynamic code by short_code OR custom_alias so manage operations work for aliased links */
export async function getRedirect(db: D1Database, shortCode: string): Promise<DynamicCode | null> {
	return db
		.prepare('SELECT * FROM redirects WHERE short_code = ? OR custom_alias = ?')
		.bind(shortCode, shortCode)
		.first<DynamicCode>();
}

/**
 * SQL fragment that applies a spam-gate result to a destination change.
 * Binds one parameter (the hold reason, or NULL for allow).
 *
 * - Allow: a link that was held becomes active again. A link the owner
 *   deactivated, or that reports deactivated, stays inactive (its
 *   hold_reason is NULL, see deactivateRedirect).
 * - Hold: an active or already-held link becomes inactive and held. An
 *   inactive, unheld link is left inactive and unheld, so a later recheck
 *   cannot revive a link that was deactivated.
 *
 * SQLite evaluates every right-hand side against the row before the update.
 */
const APPLY_GATE_SQL = `
	is_active = CASE
		WHEN ?1 IS NULL THEN CASE WHEN hold_reason IS NOT NULL THEN 1 ELSE is_active END
		WHEN is_active = 1 OR hold_reason IS NOT NULL THEN 0
		ELSE is_active END,
	hold_reason = CASE
		WHEN ?1 IS NULL THEN NULL
		WHEN is_active = 1 OR hold_reason IS NOT NULL THEN ?1
		ELSE NULL END`;

/** Update the destination URL — matches short_code OR custom_alias */
export async function updateRedirect(
	db: D1Database,
	shortCode: string,
	destinationUrl: string,
	holdReason: HoldReason | null
): Promise<void> {
	await db
		.prepare(
			`UPDATE redirects SET ${APPLY_GATE_SQL}, destination_url = ?2, updated_at = datetime('now')
			 WHERE short_code = ?3 OR custom_alias = ?3`
		)
		.bind(holdReason, destinationUrl, shortCode)
		.run();
}

/** Update a short link's destination and UTM parameters, applying the spam-gate result. */
export async function updateLinkDestination(
	db: D1Database,
	shortCode: string,
	destinationUrl: string,
	holdReason: HoldReason | null,
	utm: UTMParams | undefined
): Promise<void> {
	await db
		.prepare(
			`UPDATE redirects SET ${APPLY_GATE_SQL}, destination_url = ?2, utm_source = ?3, utm_medium = ?4,
			 utm_campaign = ?5, utm_term = ?6, utm_content = ?7, updated_at = datetime('now')
			 WHERE short_code = ?8 OR custom_alias = ?8`
		)
		.bind(
			holdReason,
			destinationUrl,
			utm?.source ?? null,
			utm?.medium ?? null,
			utm?.campaign ?? null,
			utm?.term ?? null,
			utm?.content ?? null,
			shortCode
		)
		.run();
}

/**
 * Record the result of a background recheck of a link held as 'unchecked'
 * or 'unreadable'. Only touches the row if it is still held that way for the same
 * destination, so it cannot revive a link that was edited, deactivated or
 * reported in the meantime. Returns true if the row changed.
 */
export async function resolveUncheckedHold(
	db: D1Database,
	shortCode: string,
	destinationUrl: string,
	holdReason: HoldReason | 'blocked' | null
): Promise<boolean> {
	// Another failed check changes nothing; the link stays held.
	if (holdReason === 'unchecked' || holdReason === 'unreadable') return false;
	const res = await db
		.prepare(
			`UPDATE redirects SET is_active = CASE WHEN ?1 IS NULL THEN 1 ELSE 0 END, hold_reason = ?1, updated_at = datetime('now')
			 WHERE short_code = ?2 AND destination_url = ?3 AND hold_reason IN ('unchecked', 'unreadable')`
		)
		.bind(holdReason, shortCode, destinationUrl)
		.run();
	return (res.meta?.changes ?? 0) > 0;
}

/** Deactivate (soft delete) a dynamic code — matches short_code OR custom_alias */
export async function deactivateRedirect(db: D1Database, shortCode: string): Promise<void> {
	await db
		.prepare(
			`UPDATE redirects SET is_active = 0, hold_reason = NULL, updated_at = datetime('now')
			 WHERE short_code = ? OR custom_alias = ?`
		)
		.bind(shortCode, shortCode)
		.run();
}

/** Create a short link with optional passphrase, alias, UTM params */
export async function createLink(
	db: D1Database,
	shortCode: string,
	destinationUrl: string,
	passphraseHash: string, // '' for anonymous
	options?: {
		label?: string;
		customAlias?: string;
		expiresAt?: string;
		utm?: UTMParams;
		/** Set when the spam gate held the destination; the link is stored inactive. */
		holdReason?: HoldReason | null;
	}
): Promise<DynamicCode> {
	const holdReason = options?.holdReason ?? null;
	try {
		const result = await db
			.prepare(
				`INSERT INTO redirects (short_code, destination_url, passphrase_hash, label, source, custom_alias, expires_at, utm_source, utm_medium, utm_campaign, utm_term, utm_content, is_active, hold_reason)
			 VALUES (?, ?, ?, ?, 'link', ?, ?, ?, ?, ?, ?, ?, ?, ?)
			 RETURNING *`
			)
			.bind(
				shortCode,
				destinationUrl,
				passphraseHash,
				options?.label ?? null,
				options?.customAlias ?? null,
				options?.expiresAt ?? null,
				options?.utm?.source ?? null,
				options?.utm?.medium ?? null,
				options?.utm?.campaign ?? null,
				options?.utm?.term ?? null,
				options?.utm?.content ?? null,
				holdReason ? 0 : 1,
				holdReason
			)
			.first<DynamicCode>();

		if (!result) throw new Error('Failed to create link');
		return result;
	} catch (err) {
		// D1 surfaces UNIQUE constraint violations as a generic error containing "UNIQUE constraint failed".
		// Re-throw as a 409 so callers get a deterministic, user-friendly response instead of a 500.
		if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
			throw error(409, 'This alias is already taken');
		}
		throw err;
	}
}

/** Check if a custom alias is available */
export async function isAliasAvailable(db: D1Database, alias: string): Promise<boolean> {
	// Check both short_code and custom_alias columns
	const existing = await db
		.prepare('SELECT 1 FROM redirects WHERE short_code = ? OR custom_alias = ?')
		.bind(alias, alias)
		.first();
	return !existing;
}

/** Validate short code for safe interpolation into Analytics Engine SQL */
function sanitizeCode(value: string): string {
	if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
		throw error(400, 'Invalid short code');
	}
	return value;
}

/** Query Analytics Engine via SQL API */
async function queryAnalytics(
	accountId: string,
	apiToken: string,
	sql: string
): Promise<{ data: Record<string, unknown>[] }> {
	const res = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`,
		{
			method: 'POST',
			headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'text/plain' },
			body: sql
		}
	);
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Analytics Engine query failed: ${res.status} ${text}`);
	}
	return res.json() as Promise<{ data: Record<string, unknown>[] }>;
}

/** Get click logs for a short code */
export async function getClickLogs(
	platform: App.Platform | undefined,
	shortCode: string,
	limit = 100
): Promise<ClickLog[]> {
	// Analytics Engine SQL does not support parameterized queries — all interpolated values must
	// be validated before use. `shortCode` passes through sanitizeCode() (alphanumeric/dash/underscore
	// only). `limit` is asserted to be a safe integer to prevent numeric injection.
	if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
		throw new Error('invalid limit');
	}

	const accountId = platform?.env?.CF_ACCOUNT_ID;
	const apiToken = platform?.env?.CF_ANALYTICS_TOKEN;

	if (!accountId || !apiToken) {
		return getClickLogsFromD1(getDB(platform), shortCode, limit);
	}

	const code = sanitizeCode(shortCode);
	const result = await queryAnalytics(accountId, apiToken,
		`SELECT timestamp as clicked_at, blob1 as country, blob2 as city, blob3 as region, blob4 as device_type, blob5 as referer FROM nah_clicks WHERE index1 = '${code}' ORDER BY timestamp DESC LIMIT ${limit}`
	);

	return result.data.map((row, i) => ({
		id: i,
		short_code: shortCode,
		clicked_at: row.clicked_at as string,
		country: (row.country as string) || null,
		city: (row.city as string) || null,
		region: (row.region as string) || null,
		device_type: (row.device_type as string) || null,
		referer: (row.referer as string) || null
	}));
}

/** Get aggregated click statistics */
export async function getClickStats(
	platform: App.Platform | undefined,
	shortCode: string
): Promise<ClickStats> {
	const accountId = platform?.env?.CF_ACCOUNT_ID;
	const apiToken = platform?.env?.CF_ANALYTICS_TOKEN;

	if (!accountId || !apiToken) {
		return getClickStatsFromD1(getDB(platform), shortCode);
	}

	const code = sanitizeCode(shortCode);
	const ds = 'nah_clicks';

	const [totalResult, countryResult, dayResult, deviceResult, refererResult] = await Promise.all([
		queryAnalytics(accountId, apiToken,
			`SELECT count() as total FROM ${ds} WHERE index1 = '${code}'`),
		queryAnalytics(accountId, apiToken,
			`SELECT blob1 as country, count() as count FROM ${ds} WHERE index1 = '${code}' AND blob1 != '' GROUP BY blob1 ORDER BY count DESC LIMIT 20`),
		queryAnalytics(accountId, apiToken,
			`SELECT toDate(timestamp) as date, count() as count FROM ${ds} WHERE index1 = '${code}' GROUP BY date ORDER BY date DESC LIMIT 30`),
		queryAnalytics(accountId, apiToken,
			`SELECT blob4 as device, count() as count FROM ${ds} WHERE index1 = '${code}' AND blob4 != '' GROUP BY blob4 ORDER BY count DESC`),
		queryAnalytics(accountId, apiToken,
			`SELECT IF(blob5 = '', 'Direct', blob5) as referer, count() as count FROM ${ds} WHERE index1 = '${code}' GROUP BY referer ORDER BY count DESC LIMIT 10`)
	]);

	return {
		total: (totalResult.data[0]?.total as number) ?? 0,
		byCountry: countryResult.data as { country: string; count: number }[],
		byDay: dayResult.data as { date: string; count: number }[],
		byDevice: deviceResult.data as { device: string; count: number }[],
		byReferer: refererResult.data as { referer: string; count: number }[]
	};
}

/** D1 fallback for click logs (used when Analytics Engine is not configured) */
async function getClickLogsFromD1(
	db: D1Database,
	shortCode: string,
	limit = 100
): Promise<ClickLog[]> {
	const { results } = await db
		.prepare(
			'SELECT id, short_code, clicked_at, country, city, region, device_type, referer FROM click_logs WHERE short_code = ? ORDER BY clicked_at DESC LIMIT ?'
		)
		.bind(shortCode, limit)
		.all<ClickLog>();
	return results;
}

/** D1 fallback for click stats (used when Analytics Engine is not configured) */
async function getClickStatsFromD1(db: D1Database, shortCode: string): Promise<ClickStats> {
	const [totalRow, byCountry, byDay, byDevice, byReferer] = await Promise.all([
		db
			.prepare('SELECT COUNT(*) as total FROM click_logs WHERE short_code = ?')
			.bind(shortCode)
			.first<{ total: number }>(),
		db
			.prepare(
				'SELECT country, COUNT(*) as count FROM click_logs WHERE short_code = ? AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 20'
			)
			.bind(shortCode)
			.all<{ country: string; count: number }>(),
		db
			.prepare(
				"SELECT date(clicked_at) as date, COUNT(*) as count FROM click_logs WHERE short_code = ? GROUP BY date(clicked_at) ORDER BY date DESC LIMIT 30"
			)
			.bind(shortCode)
			.all<{ date: string; count: number }>(),
		db
			.prepare(
				'SELECT device_type as device, COUNT(*) as count FROM click_logs WHERE short_code = ? AND device_type IS NOT NULL GROUP BY device_type ORDER BY count DESC'
			)
			.bind(shortCode)
			.all<{ device: string; count: number }>(),
		db
			.prepare(
				"SELECT COALESCE(referer, 'Direct') as referer, COUNT(*) as count FROM click_logs WHERE short_code = ? GROUP BY referer ORDER BY count DESC LIMIT 10"
			)
			.bind(shortCode)
			.all<{ referer: string; count: number }>()
	]);

	return {
		total: totalRow?.total ?? 0,
		byCountry: byCountry.results,
		byDay: byDay.results,
		byDevice: byDevice.results,
		byReferer: byReferer.results
	};
}

/** Report a link as abusive. Auto-deactivates after 3 unique reports.
 *  `reporterKey` is a salted hash of the reporter's network (never the IP).
 *  One open report per key per short_code; duplicates are silently ignored.
 *  Reports without a key are recorded for review but do not count toward
 *  auto-deactivation, so they cannot be used to bomb a link offline.
 */
export async function reportLink(
	db: D1Database,
	shortCode: string,
	reason: string,
	reporterIp?: string
): Promise<void> {
	// Skip duplicate reports from the same reporter key to prevent report-bombing.
	if (reporterIp) {
		const existing = await db
			.prepare(
				'SELECT 1 FROM reported_links WHERE short_code = ? AND reporter_ip = ? AND resolved = 0'
			)
			.bind(shortCode, reporterIp)
			.first();
		if (existing) return;
	}

	await db
		.prepare('INSERT INTO reported_links (short_code, reason, reporter_ip) VALUES (?, ?, ?)')
		.bind(shortCode, reason, reporterIp ?? null)
		.run();

	// Check if threshold reached (3 unresolved reports)
	const countRow = await db
		.prepare(
			'SELECT COUNT(*) as count FROM reported_links WHERE short_code = ? AND resolved = 0 AND reporter_ip IS NOT NULL'
		)
		.bind(shortCode)
		.first<{ count: number }>();

	if (countRow && countRow.count >= 3) {
		await deactivateRedirect(db, shortCode);
	}
}
