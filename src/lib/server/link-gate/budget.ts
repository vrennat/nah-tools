/**
 * Global daily budget for spam-gate model calls (issue #56).
 *
 * Per-network creation limits bound what one attacker can spend, but not the
 * total. This counts model calls per UTC day in D1 (table link_gate_budget,
 * migration 0005). Once the cap is reached the gate skips the model and
 * allows the link, logged as link_gate_allow_unchecked / daily_model_cap: the
 * same policy as a model outage.
 *
 * D1, not KV: KV allows one write per second to the same key, so a daily KV
 * counter loses increments whenever model calls finish close together (bulk
 * requests do this). D1 increments atomically with INSERT ... ON CONFLICT.
 * Requests that read the count at the same time can still both proceed, so
 * the cap can be overshot by the number of concurrent requests.
 *
 * If the count cannot be read or written (for example before the migration
 * is applied), the model is called anyway: this limits spend, it is not a
 * safety check.
 */

/** About $2.80/day at ~2.3K input tokens per call on @cf/cloudflare/clef ($0.24/M). */
export const DEFAULT_DAILY_MODEL_CALLS = 5000;

export function budgetDay(now = new Date()): string {
	return now.toISOString().slice(0, 10);
}

export function dailyCap(raw: string | undefined): number {
	const n = raw === undefined ? NaN : Number(raw);
	return Number.isInteger(n) && n >= 0 ? n : DEFAULT_DAILY_MODEL_CALLS;
}

/** Calls used so far today, or null when the counter cannot be read. */
export async function readUsage(db: D1Database | undefined, now = new Date()): Promise<number | null> {
	if (!db) return null;
	try {
		const row = await db
			.prepare('SELECT calls FROM link_gate_budget WHERE day = ?')
			.bind(budgetDay(now))
			.first<{ calls: number }>();
		return row?.calls ?? 0;
	} catch {
		return null;
	}
}

/** Add calls to today's count atomically. Never throws. */
export async function addUsage(db: D1Database | undefined, calls: number, now = new Date()): Promise<void> {
	if (!db || calls <= 0) return;
	try {
		await db
			.prepare(
				`INSERT INTO link_gate_budget (day, calls) VALUES (?1, ?2)
				 ON CONFLICT(day) DO UPDATE SET calls = calls + ?2`
			)
			.bind(budgetDay(now), calls)
			.run();
	} catch {
		console.error(JSON.stringify({ event: 'link_gate_budget_error', reason: 'counter_write_failed' }));
	}
}
