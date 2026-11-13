/**
 * A recheck disables a link only for a spam verdict. A block that only means
 * "could not check", such as a refusal at the daily model-call limit, leaves
 * the link active and logged (review of #63 and #64).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import type { GateDecision } from './decide';

const verdicts: GateDecision[] = [];
vi.mock('./index', async (orig) => ({
	...(await orig<typeof import('./index')>()),
	judgeDestination: vi.fn(async () => verdicts.shift()!)
}));
const { scheduleRecheck, isSpamVerdict } = await import('./route');
const { createLink } = await import('$server/db');

const unchecked: GateDecision = {
	verdict: 'allow',
	log: { event: 'link_gate_allow_unchecked', reason: 'fetch_timeout', host: 'a.example' }
};
let info: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
	info = vi.spyOn(console, 'info').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

async function recheckWith(result: GateDecision) {
	const { db, sqlite } = migratedDb();
	await createLink(db, 'code0001', 'https://a.example/', '');
	verdicts.push(result);
	const tasks: Promise<unknown>[] = [];
	const platform = { env: { DB: db }, context: { waitUntil: (p: Promise<unknown>) => tasks.push(p) } };
	await scheduleRecheck(platform as never, db, unchecked, {
		shortCode: 'code0001',
		storedUrl: 'https://a.example/',
		gateUrl: 'https://a.example/'
	});
	await Promise.all(tasks);
	const row = sqlite.prepare('SELECT is_active, disabled_reason FROM redirects').get();
	const done = info.mock.calls
		.map((c: unknown[]) => JSON.parse(c[0] as string) as { event: string })
		.find((e: { event: string }) => e.event === 'link_gate_recheck_done');
	return { row, done };
}

describe('recheck guard', () => {
	it('leaves the link active when the recheck is refused at the daily model-call limit', async () => {
		const { row, done } = await recheckWith({
			verdict: 'block',
			message: 'paused',
			log: { event: 'link_gate_budget_exhausted' as never, reason: 'daily_model_cap', host: 'a.example' }
		});
		expect(row).toEqual({ is_active: 1, disabled_reason: null });
		expect(done).toMatchObject({ verdict: 'block', result_event: 'link_gate_budget_exhausted', disabled: false });
	});

	it.each(['link_gate_block', 'link_gate_block_download'] as const)('disables the link on %s', async (event) => {
		const { row, done } = await recheckWith({
			verdict: 'block',
			message: 'blocked',
			log: { event, reason: 'model_scam', host: 'a.example' }
		});
		expect(row).toEqual({ is_active: 0, disabled_reason: 'destination_flagged' });
		expect(done).toMatchObject({ disabled: true });
	});

	it('counts only destination verdicts as spam', () => {
		expect(isSpamVerdict({ verdict: 'allow' })).toBe(false);
		expect(isSpamVerdict(unchecked)).toBe(false);
	});
});
