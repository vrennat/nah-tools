/**
 * D1 Database Helpers for Bio Profiles
 */

import { error } from '@sveltejs/kit';
import type { BioProfile, BioLink, BioClickStats } from '$bio/types';
import { verifyPassphrase } from '$server/auth';

/** Look up a profile and verify passphrase, or throw */
export async function authenticateProfile(
	db: D1Database,
	handle: string,
	passphrase: string
): Promise<BioProfile> {
	const profile = await getProfile(db, handle);
	if (!profile) throw error(404, 'Profile not found');
	const valid = await verifyPassphrase(passphrase, profile.passphrase_hash);
	if (!valid) throw error(403, 'Invalid passphrase');
	return profile;
}

/** Get a profile by handle */
export async function getProfile(db: D1Database, handle: string): Promise<BioProfile | null> {
	return db
		.prepare('SELECT * FROM bio_profiles WHERE handle = ?')
		.bind(handle)
		.first<BioProfile>();
}

/** Get a profile with its active links (ordered) */
export async function getProfileWithLinks(
	db: D1Database,
	handle: string
): Promise<{ profile: BioProfile; links: BioLink[] } | null> {
	const profile = await db
		.prepare('SELECT * FROM bio_profiles WHERE handle = ? AND is_active = 1')
		.bind(handle)
		.first<BioProfile>();

	if (!profile) return null;

	const { results: links } = await db
		.prepare(
			'SELECT * FROM bio_links WHERE profile_handle = ? AND is_active = 1 ORDER BY order_index ASC'
		)
		.bind(handle)
		.all<BioLink>();

	return { profile, links };
}

/** Create a new bio profile */
export async function createProfile(
	db: D1Database,
	handle: string,
	displayName: string,
	bio: string | null,
	avatarUrl: string | null,
	theme: string,
	passphraseHash: string
): Promise<BioProfile> {
	const result = await db
		.prepare(
			`INSERT INTO bio_profiles (handle, display_name, bio, avatar_url, theme, passphrase_hash)
			 VALUES (?, ?, ?, ?, ?, ?)
			 RETURNING *`
		)
		.bind(handle, displayName, bio, avatarUrl, theme, passphraseHash)
		.first<BioProfile>();

	if (!result) throw new Error('Failed to create profile');
	return result;
}

/** Update profile fields */
export async function updateProfile(
	db: D1Database,
	handle: string,
	fields: {
		display_name?: string;
		bio?: string | null;
		avatar_url?: string | null;
		theme?: string;
	}
): Promise<void> {
	const sets: string[] = [];
	const values: (string | null)[] = [];

	if (fields.display_name !== undefined) {
		sets.push('display_name = ?');
		values.push(fields.display_name);
	}
	if (fields.bio !== undefined) {
		sets.push('bio = ?');
		values.push(fields.bio);
	}
	if (fields.avatar_url !== undefined) {
		sets.push('avatar_url = ?');
		values.push(fields.avatar_url);
	}
	if (fields.theme !== undefined) {
		sets.push('theme = ?');
		values.push(fields.theme);
	}

	if (sets.length === 0) return;

	sets.push("updated_at = datetime('now')");

	await db
		.prepare(`UPDATE bio_profiles SET ${sets.join(', ')} WHERE handle = ?`)
		.bind(...values, handle)
		.run();
}

/** Deactivate (soft delete) a profile */
export async function deactivateProfile(db: D1Database, handle: string): Promise<void> {
	await db
		.prepare(`UPDATE bio_profiles SET is_active = 0, updated_at = datetime('now') WHERE handle = ?`)
		.bind(handle)
		.run();
}

/** Check if a handle is available */
export async function isHandleAvailable(db: D1Database, handle: string): Promise<boolean> {
	const existing = await db
		.prepare('SELECT 1 FROM bio_profiles WHERE handle = ?')
		.bind(handle)
		.first();
	return !existing;
}

/** Increment view count (fire-and-forget) */
export async function incrementViewCount(db: D1Database, handle: string): Promise<void> {
	await db
		.prepare('UPDATE bio_profiles SET view_count = view_count + 1 WHERE handle = ?')
		.bind(handle)
		.run();
}

// --- Bio Links ---

/** Add a link to a profile */
export async function addBioLink(
	db: D1Database,
	handle: string,
	url: string,
	title: string,
	icon: string | null,
	orderIndex: number
): Promise<BioLink> {
	const result = await db
		.prepare(
			`INSERT INTO bio_links (profile_handle, url, title, icon, order_index)
			 VALUES (?, ?, ?, ?, ?)
			 RETURNING *`
		)
		.bind(handle, url, title, icon, orderIndex)
		.first<BioLink>();

	if (!result) throw new Error('Failed to add link');
	return result;
}

/** Update a bio link (scoped to handle for ownership safety) */
export async function updateBioLink(
	db: D1Database,
	handle: string,
	linkId: number,
	fields: { url?: string; title?: string; icon?: string | null; is_active?: number }
): Promise<void> {
	const sets: string[] = [];
	const values: (string | number | null)[] = [];

	if (fields.url !== undefined) {
		sets.push('url = ?');
		values.push(fields.url);
	}
	if (fields.title !== undefined) {
		sets.push('title = ?');
		values.push(fields.title);
	}
	if (fields.icon !== undefined) {
		sets.push('icon = ?');
		values.push(fields.icon);
	}
	if (fields.is_active !== undefined) {
		sets.push('is_active = ?');
		values.push(fields.is_active);
	}

	if (sets.length === 0) return;

	sets.push("updated_at = datetime('now')");

	await db
		.prepare(`UPDATE bio_links SET ${sets.join(', ')} WHERE id = ? AND profile_handle = ?`)
		.bind(...values, linkId, handle)
		.run();
}

/** Delete a bio link (scoped to handle for ownership safety) */
export async function deleteBioLink(db: D1Database, handle: string, linkId: number): Promise<void> {
	await db.prepare('DELETE FROM bio_links WHERE id = ? AND profile_handle = ?').bind(linkId, handle).run();
}

/** Reorder links by setting order_index from an ordered array of IDs */
export async function reorderBioLinks(
	db: D1Database,
	handle: string,
	orderedIds: number[]
): Promise<void> {
	const stmt = db.prepare(
		'UPDATE bio_links SET order_index = ? WHERE id = ? AND profile_handle = ?'
	);
	const batch = orderedIds.map((id, index) => stmt.bind(index, id, handle));
	await db.batch(batch);
}

/** Get all links for a profile (including inactive, for management) */
export async function getAllBioLinks(db: D1Database, handle: string): Promise<BioLink[]> {
	const { results } = await db
		.prepare('SELECT * FROM bio_links WHERE profile_handle = ? ORDER BY order_index ASC')
		.bind(handle)
		.all<BioLink>();
	return results;
}

// --- Click Tracking ---

/** Log a click on a bio link (validates link belongs to handle) */
export async function logBioClick(
	db: D1Database,
	handle: string,
	linkId: number,
	meta: { country?: string; deviceType?: string; referer?: string }
): Promise<void> {
	// Verify the link belongs to this handle and is active
	const link = await db
		.prepare('SELECT 1 FROM bio_links WHERE id = ? AND profile_handle = ? AND is_active = 1')
		.bind(linkId, handle)
		.first();
	if (!link) return; // Silently ignore mismatched or inactive links

	await db
		.prepare(
			'INSERT INTO bio_click_logs (profile_handle, link_id, country, device_type, referer) VALUES (?, ?, ?, ?, ?)'
		)
		.bind(handle, linkId, meta.country ?? null, meta.deviceType ?? null, meta.referer ?? null)
		.run();

	// Also increment the denormalized click_count on the link
	await db
		.prepare('UPDATE bio_links SET click_count = click_count + 1 WHERE id = ? AND profile_handle = ?')
		.bind(linkId, handle)
		.run();
}

/** Get aggregated click stats for a profile */
export async function getBioClickStats(
	db: D1Database,
	handle: string
): Promise<BioClickStats> {
	const [viewRow, clickRow, byLink, byDay, byCountry, byReferer] = await Promise.all([
		db
			.prepare('SELECT view_count FROM bio_profiles WHERE handle = ?')
			.bind(handle)
			.first<{ view_count: number }>(),
		db
			.prepare('SELECT COUNT(*) as total FROM bio_click_logs WHERE profile_handle = ?')
			.bind(handle)
			.first<{ total: number }>(),
		db
			.prepare(
				`SELECT cl.link_id, bl.title, bl.url, COUNT(*) as count
				 FROM bio_click_logs cl
				 JOIN bio_links bl ON cl.link_id = bl.id
				 WHERE cl.profile_handle = ?
				 GROUP BY cl.link_id
				 ORDER BY count DESC`
			)
			.bind(handle)
			.all<{ link_id: number; title: string; url: string; count: number }>(),
		db
			.prepare(
				`SELECT date(clicked_at) as date, COUNT(*) as count
				 FROM bio_click_logs
				 WHERE profile_handle = ?
				 GROUP BY date(clicked_at)
				 ORDER BY date DESC
				 LIMIT 30`
			)
			.bind(handle)
			.all<{ date: string; count: number }>(),
		db
			.prepare(
				`SELECT country, COUNT(*) as count
				 FROM bio_click_logs
				 WHERE profile_handle = ? AND country IS NOT NULL
				 GROUP BY country
				 ORDER BY count DESC
				 LIMIT 20`
			)
			.bind(handle)
			.all<{ country: string; count: number }>(),
		db
			.prepare(
				`SELECT COALESCE(referer, 'Direct') as referer, COUNT(*) as count
				 FROM bio_click_logs
				 WHERE profile_handle = ?
				 GROUP BY referer
				 ORDER BY count DESC
				 LIMIT 10`
			)
			.bind(handle)
			.all<{ referer: string; count: number }>()
	]);

	return {
		totalViews: viewRow?.view_count ?? 0,
		totalClicks: clickRow?.total ?? 0,
		clicksByLink: byLink.results,
		clicksByDay: byDay.results,
		topCountries: byCountry.results,
		topReferers: byReferer.results
	};
}
