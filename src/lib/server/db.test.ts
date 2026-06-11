import { describe, it, expect, vi } from 'vitest';
import { generateShortCode, isValidURL, getClickLogs, reportLink } from '$server/db';

describe('isValidURL', () => {
	it('returns true for https://example.com', () => {
		expect(isValidURL('https://example.com')).toBe(true);
	});

	it('returns true for http://example.com', () => {
		expect(isValidURL('http://example.com')).toBe(true);
	});

	it('returns false for javascript:alert(1)', () => {
		expect(isValidURL('javascript:alert(1)')).toBe(false);
	});

	it('returns false for data:text/html,<h1>hi</h1>', () => {
		expect(isValidURL('data:text/html,<h1>hi</h1>')).toBe(false);
	});

	it('returns false for file:///etc/passwd', () => {
		expect(isValidURL('file:///etc/passwd')).toBe(false);
	});

	it('returns false for vbscript:msgbox', () => {
		expect(isValidURL('vbscript:msgbox')).toBe(false);
	});

	it('returns false for ftp://example.com', () => {
		expect(isValidURL('ftp://example.com')).toBe(false);
	});

	it('returns false for empty string', () => {
		expect(isValidURL('')).toBe(false);
	});

	it('returns false for random text', () => {
		expect(isValidURL('not a url')).toBe(false);
	});
});

describe('generateShortCode', () => {
	it('returns an 8-character string', () => {
		const code = generateShortCode();
		expect(code).toHaveLength(8);
	});

	it('contains only alphanumeric characters', () => {
		const code = generateShortCode();
		expect(code).toMatch(/^[a-zA-Z0-9]+$/);
	});

	it('produces different codes on successive calls', () => {
		const a = generateShortCode();
		const b = generateShortCode();
		expect(a).not.toBe(b);
	});
});

describe('getClickLogs - limit guard', () => {
	// getClickLogs throws before touching the platform when limit is invalid.
	// We pass undefined as platform so that any attempt to use it would crash,
	// letting us verify the guard fires first.

	it('throws on limit = 0', async () => {
		await expect(getClickLogs(undefined, 'abc', 0)).rejects.toThrow('invalid limit');
	});

	it('throws on limit = -1', async () => {
		await expect(getClickLogs(undefined, 'abc', -1)).rejects.toThrow('invalid limit');
	});

	it('throws on limit = 1001', async () => {
		await expect(getClickLogs(undefined, 'abc', 1001)).rejects.toThrow('invalid limit');
	});

	it('throws on non-integer limit (3.5)', async () => {
		await expect(getClickLogs(undefined, 'abc', 3.5)).rejects.toThrow('invalid limit');
	});
});

describe('reportLink - deduplication', () => {
	function makeDb(existingReport: boolean) {
		// Tracks calls so we can assert INSERT was/was not called
		let insertCalled = false;

		const stmtMap = new Map<string, object>();

		function makeStmt(sql: string) {
			const stmt = {
				_sql: sql,
				_bindings: [] as unknown[],
				bind(...args: unknown[]) {
					this._bindings = args;
					return this;
				},
				async first() {
					// Duplicate check query
					if (sql.includes('reporter_ip') && sql.includes('SELECT 1')) {
						return existingReport ? {} : null;
					}
					// Count query
					if (sql.includes('COUNT(*)')) {
						return { count: 0 };
					}
					return null;
				},
				async run() {
					if (sql.includes('INSERT INTO reported_links')) {
						insertCalled = true;
					}
					return { success: true };
				},
			};
			return stmt;
		}

		const db = {
			prepare(sql: string) {
				return makeStmt(sql);
			},
			_wasInsertCalled() {
				return insertCalled;
			},
		} as unknown as D1Database & { _wasInsertCalled(): boolean };

		return db;
	}

	it('inserts when no prior report from this IP', async () => {
		const db = makeDb(false) as D1Database & { _wasInsertCalled(): boolean };
		await reportLink(db, 'abc123', 'spam', '1.2.3.4');
		expect((db as { _wasInsertCalled(): boolean })._wasInsertCalled()).toBe(true);
	});

	it('skips INSERT when same IP already reported', async () => {
		const db = makeDb(true) as D1Database & { _wasInsertCalled(): boolean };
		await reportLink(db, 'abc123', 'spam', '1.2.3.4');
		expect((db as { _wasInsertCalled(): boolean })._wasInsertCalled()).toBe(false);
	});

	it('always inserts when IP is undefined (anonymous reports)', async () => {
		// Anonymous reports should not be deduplicated against each other
		const db = makeDb(true) as D1Database & { _wasInsertCalled(): boolean };
		await reportLink(db, 'abc123', 'spam', undefined);
		expect((db as { _wasInsertCalled(): boolean })._wasInsertCalled()).toBe(true);
	});
});
