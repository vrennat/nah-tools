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
	/** 'global': the day's total is used up; 'network': this network's share is. */
	constructor(readonly scope: 'global' | 'network' = 'global') {
		super(`daily model-call budget exhausted (${scope})`);
		this.name = 'BudgetExhaustedError';
	}
}

export function budgetDay(now = new Date()): string {
	return now.toISOString().slice(0, 10);
}

/** Model calls one client network may use per UTC day (see reserveNetworkCall). */
export const DEFAULT_NETWORK_DAILY_MODEL_CALLS = 60;

/**
 * A cap from an environment variable. Missing, blank, non-integer or values
 * below 1 fall back to the default: a cap of 0 would refuse every new link,
 * so it cannot be set by accident (an empty variable used to mean 0).
 */
function parseCap(raw: string | undefined, fallback: number): number {
	const trimmed = raw?.trim() ?? '';
	if (!/^\d+$/.test(trimmed)) return fallback;
	const n = Number(trimmed);
	return n >= 1 ? n : fallback;
}

/** The global cap from LINK_GATE_DAILY_MODEL_CALLS. */
export function dailyCap(raw: string | undefined): number {
	return parseCap(raw, DEFAULT_DAILY_MODEL_CALLS);
}

/** The per-network share from LINK_GATE_NETWORK_DAILY_MODEL_CALLS. */
export function networkCap(raw: string | undefined): number {
	return parseCap(raw, DEFAULT_NETWORK_DAILY_MODEL_CALLS);
}

export function logBudgetError(reason: string): void {
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

/*
 * Per-network share (issue #56 follow-up). The global cap alone lets about 9
 * networks use up the day's calls and stop link creation for everyone until
 * 00:00 UTC. Each network (a salted hash, see networkId in route.ts) also has
 * its own daily share, counted in link_gate_network_budget (migration 0006).
 * D1 failures are logged and allowed, as for the global counter.
 */

/** Calls this network used today, or null (logged) when the counter cannot be read. */
export async function readNetworkUsage(
	db: D1Database | undefined,
	network: string,
	now = new Date()
): Promise<number | null> {
	if (!db) return null;
	try {
		const row = await db
			.prepare('SELECT calls FROM link_gate_network_budget WHERE day = ? AND network = ?')
			.bind(budgetDay(now), network)
			.first<{ calls: number }>();
		return row?.calls ?? 0;
	} catch {
		logBudgetError('network_counter_read_failed');
		return null;
	}
}

/** The outcome of a network reservation. `day` is set only when a unit was actually taken. */
export interface NetworkReservation {
	/** False only when the share is used up. True when a unit was taken, and when D1 failed (logged). */
	ok: boolean;
	/** The UTC day the unit was taken from, for giving it back. */
	day?: string;
}

/**
 * Reserve one model call from this network's share. One atomic upsert, like
 * reserveCall. A network's first call of the day also deletes earlier days'
 * rows (all networks), so the table holds about one day of rows; a failed
 * delete is logged on its own and does not affect the reservation.
 */
export async function reserveNetworkCall(
	db: D1Database | undefined,
	network: string,
	cap: number,
	now = new Date()
): Promise<NetworkReservation> {
	if (!db) return { ok: true };
	const day = budgetDay(now);
	let row: { calls: number } | null;
	try {
		row = await db
			.prepare(
				`INSERT INTO link_gate_network_budget (day, network, calls) VALUES (?1, ?2, 1)
				 ON CONFLICT(day, network) DO UPDATE SET calls = calls + 1 WHERE calls < ?3
				 RETURNING calls`
			)
			.bind(day, network, cap)
			.first<{ calls: number }>();
	} catch {
		logBudgetError('network_counter_write_failed');
		return { ok: true };
	}
	if (row === null) return { ok: false };
	if (row.calls === 1) {
		try {
			await db.prepare('DELETE FROM link_gate_network_budget WHERE day < ?').bind(day).run();
		} catch {
			logBudgetError('network_counter_cleanup_failed');
		}
	}
	return { ok: true, day };
}

/**
 * Give back a network unit whose model call did not run (the global cap
 * refused it). Only for a reservation that took a unit, and on the day it
 * was taken, so a unit is never returned that was not taken.
 */
export async function refundNetworkCall(
	db: D1Database | undefined,
	network: string,
	reservation: NetworkReservation
): Promise<void> {
	if (!db || !reservation.day) return;
	try {
		await db
			.prepare('UPDATE link_gate_network_budget SET calls = calls - 1 WHERE day = ? AND network = ? AND calls > 0')
			.bind(reservation.day, network)
			.run();
	} catch {
		logBudgetError('network_counter_refund_failed');
	}
}
