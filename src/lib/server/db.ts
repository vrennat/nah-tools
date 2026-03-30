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

/** Get click logs for a short code */
export async function getClickLogs(
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

/** Get aggregated click statistics */
export async function getClickStats(db: D1Database, shortCode: string): Promise<ClickStats> {
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
