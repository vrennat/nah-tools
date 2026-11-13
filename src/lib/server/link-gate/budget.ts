/**
 * Global daily budget for spam-gate model calls (issue #56).
 *
 * Per-network creation limits bound what one attacker can spend, but not the
 * total. Model calls are counted per UTC day in D1 (table link_gate_budget,
 * migration 0005). Each call reserves one unit just before it runs, with one
 * conditional upsert that only adds below the cap, so concurrent requests
 * cannot overshoot it. When the cap is reached, the request is refused (see
 * assertModelBudget and judgeWithinBudget in route.ts): turning the model off instead would let
 * whoever exhausts the budget create unchecked links for the rest of the day.
 *
 * D1, not KV: KV allows one write per second to the same key, so a KV
 * counter loses increments when calls finish close together.
 *
 * If D1 cannot be read or written (for example before the migration is
 * applied), the model is called and the failure is logged: this limits
 * spend, it is not a safety check.
 */

/** About $2.80/day at ~2.3K input tokens per call on @cf/cloudflare/clef ($0.24/M). */
export const DEFAULT_DAILY_MODEL_CALLS = 5000;

/** Thrown by a reserved model call when the day's budget is used up. */
export class BudgetExhaustedError extends Error {
	constructor() {
		super('daily model-call budget exhausted');
		this.name = 'BudgetExhaustedError';
	}
}

export function budgetDay(now = new Date()): string {
	return now.toISOString().slice(0, 10);
}

/**
 * The cap from LINK_GATE_DAILY_MODEL_CALLS. Missing, blank, non-integer or
 * values below 1 fall back to the default: a cap of 0 would refuse every new
 * link, so it cannot be set by accident (an empty variable used to mean 0).
 */
export function dailyCap(raw: string | undefined): number {
	const trimmed = raw?.trim() ?? '';
	if (!/^\d+$/.test(trimmed)) return DEFAULT_DAILY_MODEL_CALLS;
	const n = Number(trimmed);
	return n >= 1 ? n : DEFAULT_DAILY_MODEL_CALLS;
}

function logBudgetError(reason: string): void {
	console.error(JSON.stringify({ event: 'link_gate_budget_error', reason }));
}

/** Calls used so far today, or null (logged) when the counter cannot be read. */
export async function readUsage(db: D1Database | undefined, now = new Date()): Promise<number | null> {
	if (!db) return null;
	try {
		const row = await db
			.prepare('SELECT calls FROM link_gate_budget WHERE day = ?')
			.bind(budgetDay(now))
			.first<{ calls: number }>();
		return row?.calls ?? 0;
	} catch {
		logBudgetError('counter_read_failed');
		return null;
	}
}

/**
 * Reserve one model call. Returns true if it fits under the cap, false if the
 * budget is used up, and true (logged) if D1 fails. One atomic statement:
 * the first call of the day inserts the row, later ones add one only while
 * the count is below the cap, so concurrent reservations never pass it.
 */
export async function reserveCall(db: D1Database | undefined, cap: number, now = new Date()): Promise<boolean> {
	if (!db) return true;
	try {
		const row = await db
			.prepare(
				`INSERT INTO link_gate_budget (day, calls) VALUES (?1, 1)
				 ON CONFLICT(day) DO UPDATE SET calls = calls + 1 WHERE calls < ?2
				 RETURNING calls`
			)
			.bind(budgetDay(now), cap)
			.first<{ calls: number }>();
		return row !== null;
	} catch {
		logBudgetError('counter_write_failed');
		return true;
	}
}
