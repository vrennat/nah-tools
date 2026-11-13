import { describe, it, expect, vi, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import { budgetDay, dailyCap, DEFAULT_DAILY_MODEL_CALLS, readUsage } from './budget';
import { judgeWithinBudget, BUDGET_EXHAUSTED_MESSAGE } from './route';
import { NOUL_QUESTIONS } from './questions';

const PAGE = `<title>Shop</title><p>${'Shoes for sale. '.repeat(40)}</p>`;
const fetchImpl = (async () => new Response(PAGE, { headers: { 'content-type': 'text/html' } })) as typeof fetch;
const ai = () => ({
	run: vi.fn(async () => {
		// Yield so concurrent requests interleave, as they would in the Worker.
		await new Promise((r) => setTimeout(r, 1));
		return { answers: Object.fromEntries(Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: 0.02 }])) };
	})
});
const exhausted = {
	verdict: 'block',
	message: BUDGET_EXHAUSTED_MESSAGE,
	httpStatus: 503,
	log: { event: 'link_gate_budget_exhausted', reason: 'daily_model_cap' }
};

afterEach(() => vi.restoreAllMocks());

describe('daily model-call budget (D1)', () => {
	it('counts calls and refuses with 503 once the cap is reached', async () => {
		const { db } = migratedDb();
		const model = ai();
		const platform = { env: { DB: db, LINK_GATE_DAILY_MODEL_CALLS: '2' } } as never;
		const deps = { ai: model, fetchImpl };
		expect(await judgeWithinBudget(platform, 'https://a.example/', deps)).toEqual({ verdict: 'allow' });
		expect(await judgeWithinBudget(platform, 'https://b.example/', deps)).toEqual({ verdict: 'allow' });
		expect(await readUsage(db)).toBe(2);
		expect(await judgeWithinBudget(platform, 'https://c.example/', deps)).toMatchObject(exhausted);
		expect(model.run).toHaveBeenCalledTimes(2);
	});

	it('never overshoots the cap under concurrency: limit 5, 50 parallel requests', async () => {
		const { db } = migratedDb();
		const model = ai();
		const platform = { env: { DB: db, LINK_GATE_DAILY_MODEL_CALLS: '5' } } as never;
		const results = await Promise.all(
			Array.from({ length: 50 }, (_, i) => judgeWithinBudget(platform, `https://p${i}.example/`, { ai: model, fetchImpl }))
		);
		expect(model.run).toHaveBeenCalledTimes(5);
		expect(await readUsage(db)).toBe(5);
		expect(results.filter((r) => r.verdict === 'allow')).toHaveLength(5);
		expect(results.filter((r) => r.verdict === 'block' && r.httpStatus === 503)).toHaveLength(45);
	});

	it('counts every call when checks finish back to back', async () => {
		const { db } = migratedDb();
		const platform = { env: { DB: db } } as never;
		const deps = { ai: ai(), fetchImpl };
		for (let i = 0; i < 20; i++) await judgeWithinBudget(platform, `https://s${i}.example/`, deps);
		await Promise.all(Array.from({ length: 20 }, (_, i) => judgeWithinBudget(platform, `https://c${i}.example/`, deps)));
		expect(await readUsage(db)).toBe(40);
	});

	it('refuses without fetching the destination once the count is already at the cap', async () => {
		const { db, sqlite } = migratedDb();
		sqlite.prepare('INSERT INTO link_gate_budget (day, calls) VALUES (?, 5000)').run(budgetDay());
		const fetchSpy = vi.fn(fetchImpl);
		const d = await judgeWithinBudget({ env: { DB: db } } as never, 'https://x.example/', {
			ai: ai(),
			fetchImpl: fetchSpy as typeof fetch
		});
		expect(d).toMatchObject(exhausted);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('calls the model and logs both failures when the counter cannot be read or written', async () => {
		const model = ai();
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});
		const fail = async () => Promise.reject(new Error('no such table: link_gate_budget'));
		const db = { prepare: () => ({ bind: () => ({ first: fail, run: fail }) }) } as unknown as D1Database;
		const d = await judgeWithinBudget({ env: { DB: db } } as never, 'https://a.example/', { ai: model, fetchImpl });
		expect(d).toEqual({ verdict: 'allow' });
		expect(model.run).toHaveBeenCalledTimes(1);
		expect(err.mock.calls.map((c) => JSON.parse(c[0] as string).reason)).toEqual([
			'counter_read_failed',
			'counter_write_failed'
		]);
	});

	it.each([
		[undefined, DEFAULT_DAILY_MODEL_CALLS],
		['', DEFAULT_DAILY_MODEL_CALLS],
		['   ', DEFAULT_DAILY_MODEL_CALLS],
		['0', DEFAULT_DAILY_MODEL_CALLS],
		['-1', DEFAULT_DAILY_MODEL_CALLS],
		['2.5', DEFAULT_DAILY_MODEL_CALLS],
		['lots', DEFAULT_DAILY_MODEL_CALLS],
		[' 250 ', 250],
		['1', 1]
	])('reads the cap setting %j as %d', (raw, cap) => {
		expect(dailyCap(raw)).toBe(cap);
	});

	it('counts by UTC day', () => {
		expect(budgetDay(new Date('2026-11-14T23:59:59Z'))).toBe('2026-11-14');
	});
});
