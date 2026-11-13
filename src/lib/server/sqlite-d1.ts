/**
 * Test helper: an in-memory SQLite database with the repository's
 * migrations applied, behind a minimal D1 shim (prepare().bind().first/run/all).
 * Used only by tests; not imported by application code.
 */
import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function d1(sqlite: DatabaseSync): D1Database {
	const prepare = (sql: string) => {
		let params: unknown[] = [];
		const stmt = {
			bind: (...p: unknown[]) => {
				params = p;
				return stmt;
			},
			first: async () => (sqlite.prepare(sql).get(...(params as never[])) as unknown) ?? null,
			run: async () => {
				const r = sqlite.prepare(sql).run(...(params as never[]));
				return { success: true, meta: { changes: Number(r.changes) } };
			},
			all: async () => ({ results: sqlite.prepare(sql).all(...(params as never[])) })
		};
		return stmt;
	};
	return { prepare } as unknown as D1Database;
}

export function migratedDb(): { sqlite: DatabaseSync; db: D1Database } {
	const sqlite = new DatabaseSync(':memory:');
	const dir = join(process.cwd(), 'migrations');
	for (const f of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
		sqlite.exec(readFileSync(join(dir, f), 'utf8'));
	}
	return { sqlite, db: d1(sqlite) };
}
