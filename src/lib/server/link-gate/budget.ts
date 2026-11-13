/**
 * Global daily budget for spam-gate model calls (issue #56).
 *
 * Per-network creation limits bound what one attacker can spend, but not the
 * total. This counts model calls per UTC day in KV. Once the cap is reached
 * the gate skips the model and allows the link, logged as
 * link_gate_allow_unchecked / daily_model_cap: the same policy as a model
 * outage. KV is not atomic, so concurrent requests can overshoot the cap by
 * a little; that is acceptable for a spend limit. If KV fails, the counter is
 * skipped and the model is called: this limits spend, it is not a safety check.
 */

/** About $2.80/day at ~2.3K input tokens per call on @cf/cloudflare/clef ($0.24/M). */
export const DEFAULT_DAILY_MODEL_CALLS = 5000;

const KEY_TTL_S = 2 * 24 * 60 * 60;

export function budgetKey(now = new Date()): string {
	return `link-gate:model-calls:${now.toISOString().slice(0, 10)}`;
}

export function dailyCap(raw: string | undefined): number {
	const n = raw === undefined ? NaN : Number(raw);
	return Number.isInteger(n) && n >= 0 ? n : DEFAULT_DAILY_MODEL_CALLS;
}

/** Calls used so far today, or null when the counter cannot be read. */
export async function readUsage(kv: KVNamespace | undefined, now = new Date()): Promise<number | null> {
	if (!kv) return null;
	try {
		const v = await kv.get(budgetKey(now));
		const n = v === null ? 0 : Number(v);
		return Number.isFinite(n) && n >= 0 ? n : 0;
	} catch {
		return null;
	}
}

export async function addUsage(
	kv: KVNamespace | undefined,
	before: number,
	calls: number,
	now = new Date()
): Promise<void> {
	if (!kv || calls <= 0) return;
	try {
		await kv.put(budgetKey(now), String(before + calls), { expirationTtl: KEY_TTL_S });
	} catch {
		console.error(JSON.stringify({ event: 'link_gate_budget_error', reason: 'kv_write_failed' }));
	}
}
