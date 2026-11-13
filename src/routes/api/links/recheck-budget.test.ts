/**
 * The background recheck (issue #54) and the daily model-call limit (issue
 * #56) together: rechecks count toward the limit, and a recheck stopped by
 * the limit leaves the link active and logged instead of disabling it.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import { NOUL_QUESTIONS } from '$server/link-gate/questions';
import { readUsage } from '$server/link-gate/budget';

vi.mock('$server/creation-limits', () => ({ enforceCreationLimits: vi.fn(async () => {}) }));
const links = await import('./+server');

const PHISH = '<title>Prize</title><p>Claim your prize now. ' + 'Enter your card. '.repeat(30) + '</p>';
let db: D1Database;
let sqlite: import('node:sqlite').DatabaseSync;
let tasks: Promise<unknown>[];
let fetches: number;

const ai = {
	run: vi.fn(async (_m: string, input: unknown) => {
		const phish = (input as { state: string }).state.includes('Claim your prize');
		return {
			answers: Object.fromEntries(
				Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: phish && (id === 'scam' || id === 'impersonation') ? 0.95 : 0.02 }])
			)
		};
	})
};
function platform(cap: string) {
	return {
		env: { DB: db, KV: { delete: vi.fn(async () => {}), put: vi.fn(async () => {}) }, AI: ai, LINK_GATE_DAILY_MODEL_CALLS: cap },
		context: { waitUntil: (p: Promise<unknown>) => tasks.push(p) }
	};
}
const events = (spy: { mock: { calls: unknown[][] } }) =>
	spy.mock.calls.map((c) => JSON.parse(c[0] as string) as { event: string; [k: string]: unknown });

let info: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
	({ db, sqlite } = migratedDb());
	tasks = [];
	fetches = 0;
	ai.run.mockClear();
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => {
			// First check: the destination is down. Recheck: it serves phishing.
			if (++fetches === 1) throw new TypeError('network error');
			return new Response(PHISH, { headers: { 'content-type': 'text/html' } });
		})
	);
	info = vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

async function create(cap: string) {
	const req = new Request('https://nah.tools/api/links', { method: 'POST', body: JSON.stringify({ url: 'https://slow.example/' }) });
	const res = await links.POST({ request: req, platform: platform(cap) } as never);
	expect(res.status).toBe(201);
	await Promise.all(tasks);
	return sqlite.prepare('SELECT is_active, disabled_reason FROM redirects').get();
}

describe('recheck within the daily model-call limit', () => {
	it('counts the recheck model call toward the limit', async () => {
		expect(await create('5')).toEqual({ is_active: 0, disabled_reason: 'destination_flagged' });
		// One call for the first check (on the URL alone, the page was down), one for the recheck.
		expect(ai.run).toHaveBeenCalledTimes(2);
		expect(await readUsage(db)).toBe(2);
	});

	it('leaves the link active and logged when the limit is used up before the recheck calls the model', async () => {
		// The first check uses the one call; by the time the recheck reaches the model, none is left.
		expect(await create('1')).toEqual({ is_active: 1, disabled_reason: null });
		expect(ai.run).toHaveBeenCalledTimes(1);
		expect(events(info).at(-1)).toMatchObject({
			event: 'link_gate_recheck_done',
			verdict: 'block',
			result_event: 'link_gate_budget_exhausted',
			disabled: false
		});
	});
});
