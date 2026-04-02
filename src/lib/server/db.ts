/**
 * D1 Database Helpers
 * Query helpers for dynamic QR code CRUD
 */

import { error } from '@sveltejs/kit';
import type { DynamicCode, ClickLog, ClickStats, UTMParams } from '$qr/types';
import { verifyPassphrase } from '$server/auth';

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
	label?: string
): Promise<DynamicCode> {
	const result = await db
		.prepare(
			`INSERT INTO redirects (short_code, destination_url, passphrase_hash, label)
			 VALUES (?, ?, ?, ?)
			 RETURNING *`
		)
		.bind(shortCode, destinationUrl, passphraseHash, label ?? null)
		.first<DynamicCode>();

	if (!result) throw new Error('Failed to create redirect');
	return result;
}

/** Look up a dynamic code by short code */
export async function getRedirect(db: D1Database, shortCode: string): Promise<DynamicCode | null> {
	return db
		.prepare('SELECT * FROM redirects WHERE short_code = ?')
		.bind(shortCode)
		.first<DynamicCode>();
}

/** Update the destination URL */
export async function updateRedirect(
	db: D1Database,
	shortCode: string,
	destinationUrl: string
): Promise<void> {
	await db
		.prepare(
			`UPDATE redirects SET destination_url = ?, updated_at = datetime('now')
			 WHERE short_code = ?`
		)
		.bind(destinationUrl, shortCode)
		.run();
}

/** Deactivate (soft delete) a dynamic code */
export async function deactivateRedirect(db: D1Database, shortCode: string): Promise<void> {
	await db
		.prepare(
			`UPDATE redirects SET is_active = 0, updated_at = datetime('now')
			 WHERE short_code = ?`
		)
		.bind(shortCode)
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
	}
): Promise<DynamicCode> {
	const result = await db
		.prepare(
			`INSERT INTO redirects (short_code, destination_url, passphrase_hash, label, source, custom_alias, expires_at, utm_source, utm_medium, utm_campaign, utm_term, utm_content)
			 VALUES (?, ?, ?, ?, 'link', ?, ?, ?, ?, ?, ?, ?)
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
			options?.utm?.content ?? null
		)
		.first<DynamicCode>();

	if (!result) throw new Error('Failed to create link');
	return result;
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

/** Check if a domain is blocked */
export async function isDomainBlocked(db: D1Database, domain: string): Promise<boolean> {
	const row = await db
		.prepare('SELECT 1 FROM blocked_domains WHERE domain = ?')
		.bind(domain)
		.first();
	return !!row;
}

/** Report a link as abusive. Auto-deactivates after 3 reports. */
export async function reportLink(
	db: D1Database,
	shortCode: string,
	reason: string,
	reporterIp?: string
): Promise<void> {
	await db
		.prepare('INSERT INTO reported_links (short_code, reason, reporter_ip) VALUES (?, ?, ?)')
		.bind(shortCode, reason, reporterIp ?? null)
		.run();

	// Check if threshold reached (3 unresolved reports)
	const countRow = await db
		.prepare(
			'SELECT COUNT(*) as count FROM reported_links WHERE short_code = ? AND resolved = 0'
		)
		.bind(shortCode)
		.first<{ count: number }>();

	if (countRow && countRow.count >= 3) {
		await deactivateRedirect(db, shortCode);
	}
}
