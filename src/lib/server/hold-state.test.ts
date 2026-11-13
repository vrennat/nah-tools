/**
 * Hold-state transitions in db.ts, run against real SQLite with the
 * repository's migrations, so the CASE logic is tested as SQL, not as a mock.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { DatabaseSync } from 'node:sqlite';
import { migratedDb } from './sqlite-d1';
import {
	createLink,
	createRedirect,
	updateLinkDestination,
	updateRedirect,
	resolveUncheckedHold,
	deactivateRedirect
} from '$server/db';

let sqlite: DatabaseSync;
let db: D1Database;
const row = (code: string) =>
	sqlite.prepare('SELECT is_active, hold_reason, destination_url FROM redirects WHERE short_code = ?').get(code) as {
		is_active: number;
		hold_reason: string | null;
		destination_url: string;
	};

beforeEach(() => {
	({ sqlite, db } = migratedDb());
});

describe('creating links', () => {
	it('stores an allowed link active and unheld', async () => {
		await createLink(db, 'okcode01', 'https://a.example/', '');
		expect(row('okcode01')).toMatchObject({ is_active: 1, hold_reason: null });
	});

	it('stores a held link inactive, so an old redirect worker will not serve it', async () => {
		await createLink(db, 'held0001', 'https://a.example/', '', { holdReason: 'suspicious' });
		expect(row('held0001')).toMatchObject({ is_active: 0, hold_reason: 'suspicious' });
		await createRedirect(db, 'qrheld01', 'https://a.example/', 'hash', undefined, 'unchecked');
		expect(row('qrheld01')).toMatchObject({ is_active: 0, hold_reason: 'unchecked' });
	});
});

describe('changing a destination', () => {
	it('holds an active link when the new destination is held', async () => {
		await createLink(db, 'code0001', 'https://a.example/', 'h');
		await updateLinkDestination(db, 'code0001', 'https://b.example/', 'suspicious', undefined);
		expect(row('code0001')).toEqual({ is_active: 0, hold_reason: 'suspicious', destination_url: 'https://b.example/' });
	});

	it('releases a held link when the new destination is allowed', async () => {
		await createLink(db, 'code0002', 'https://a.example/', 'h', { holdReason: 'suspicious' });
		await updateLinkDestination(db, 'code0002', 'https://b.example/', null, undefined);
		expect(row('code0002')).toMatchObject({ is_active: 1, hold_reason: null });
	});

	it('keeps an owner-deactivated link inactive when the new destination is allowed', async () => {
		await createLink(db, 'code0003', 'https://a.example/', 'h');
		await deactivateRedirect(db, 'code0003');
		await updateLinkDestination(db, 'code0003', 'https://b.example/', null, undefined);
		expect(row('code0003')).toMatchObject({ is_active: 0, hold_reason: null });
	});

	it('does not mark a deactivated link held, so a recheck cannot revive it', async () => {
		await createLink(db, 'code0004', 'https://a.example/', 'h');
		await deactivateRedirect(db, 'code0004');
		await updateRedirect(db, 'code0004', 'https://b.example/', 'unchecked');
		expect(row('code0004')).toMatchObject({ is_active: 0, hold_reason: null });
		expect(await resolveUncheckedHold(db, 'code0004', 'https://b.example/', undefined, null)).toBe(false);
		expect(row('code0004').is_active).toBe(0);
	});

	it('clears the hold when a held link is deactivated (owner or reports)', async () => {
		await createLink(db, 'code0005', 'https://a.example/', 'h', { holdReason: 'unchecked' });
		await deactivateRedirect(db, 'code0005');
		expect(row('code0005')).toMatchObject({ is_active: 0, hold_reason: null });
		expect(await resolveUncheckedHold(db, 'code0005', 'https://a.example/', undefined, null)).toBe(false);
	});
});

describe('background recheck', () => {
	it('activates an unchecked link when the recheck allows it', async () => {
		await createLink(db, 'code0006', 'https://a.example/', '', { holdReason: 'unchecked' });
		expect(await resolveUncheckedHold(db, 'code0006', 'https://a.example/', undefined, null)).toBe(true);
		expect(row('code0006')).toMatchObject({ is_active: 1, hold_reason: null });
	});

	it('keeps it held as blocked when the recheck blocks it', async () => {
		await createLink(db, 'code0007', 'https://a.example/', '', { holdReason: 'unchecked' });
		await resolveUncheckedHold(db, 'code0007', 'https://a.example/', undefined, 'blocked');
		expect(row('code0007')).toMatchObject({ is_active: 0, hold_reason: 'blocked' });
	});

	it('does nothing if the destination changed since the hold', async () => {
		await createLink(db, 'code0008', 'https://a.example/', 'h', { holdReason: 'unchecked' });
		await updateLinkDestination(db, 'code0008', 'https://b.example/', 'unchecked', undefined);
		expect(await resolveUncheckedHold(db, 'code0008', 'https://a.example/', undefined, null)).toBe(false);
		expect(row('code0008').is_active).toBe(0);
	});

	it('releases a link held as unreadable when the recheck can read and allow it', async () => {
		await createLink(db, 'code0011', 'https://a.example/', '', { holdReason: 'unreadable' });
		expect(await resolveUncheckedHold(db, 'code0011', 'https://a.example/', undefined, null)).toBe(true);
		expect(row('code0011')).toMatchObject({ is_active: 1, hold_reason: null });
	});

	it('does not release the row when its UTM parameters changed since the judged URL', async () => {
		await createLink(db, 'code0012', 'https://a.example/', 'h', { holdReason: 'unreadable', utm: { content: 'u1' } });
		await updateLinkDestination(db, 'code0012', 'https://a.example/', 'unreadable', { content: 'u2' });
		// The recheck scheduled for u1 finds a clean page; it must not put u2 live.
		expect(await resolveUncheckedHold(db, 'code0012', 'https://a.example/', { content: 'u1' }, null)).toBe(false);
		expect(row('code0012').is_active).toBe(0);
		expect(await resolveUncheckedHold(db, 'code0012', 'https://a.example/', { content: 'u2' }, null)).toBe(true);
	});

	it('does not release a link held for another reason', async () => {
		await createLink(db, 'code0009', 'https://a.example/', '', { holdReason: 'suspicious' });
		expect(await resolveUncheckedHold(db, 'code0009', 'https://a.example/', undefined, null)).toBe(false);
		expect(row('code0009')).toMatchObject({ is_active: 0, hold_reason: 'suspicious' });
	});

	it('leaves the row alone when the recheck is still unchecked', async () => {
		await createLink(db, 'code0010', 'https://a.example/', '', { holdReason: 'unchecked' });
		expect(await resolveUncheckedHold(db, 'code0010', 'https://a.example/', undefined, 'unchecked')).toBe(false);
		expect(row('code0010')).toMatchObject({ is_active: 0, hold_reason: 'unchecked' });
	});
});
