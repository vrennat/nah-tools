import { describe, it, expect, vi, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import { budgetDay, dailyCap, DEFAULT_DAILY_MODEL_CALLS, readUsage } from './budget';
import { judgeWithinBudget } from './route';
import { NOUL_QUESTIONS } from './questions';

const PAGE = `<title>Shop</title><p>${'Shoes for sale. '.repeat(40)}</p>`;
const fetchImpl = (async () => new Response(PAGE, { headers: { 'content-type': 'text/html' } })) as typeof fetch;
const ai = () => ({
	run: vi.fn(async () => ({
		answers: Object.fromEntries(Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: 0.02 }]))
	}))
});

afterEach(() => vi.restoreAllMocks());

describe('daily model-call budget (D1)', () => {
	it('counts calls and withholds the model once the cap is reached', async () => {
		const { db } = migratedDb();
		const model = ai();
		const platform = { env: { DB: db, LINK_GATE_DAILY_MODEL_CALLS: '2' } } as never;
		const deps = { ai: model, fetchImpl };
		expect(await judgeWithinBudget(platform, 'https://a.example/', deps)).toEqual({ verdict: 'allow' });
		expect(await judgeWithinBudget(platform, 'https://b.example/', deps)).toEqual({ verdict: 'allow' });
		expect(await readUsage(db)).toBe(2);
		const third = await judgeWithinBudget(platform, 'https://c.example/', deps);
		expect(third).toMatchObject({ verdict: 'allow', log: { event: 'link_gate_allow_unchecked', reason: 'daily_model_cap' } });
		expect(model.run).toHaveBeenCalledTimes(2);
	});

	it('counts every call when checks finish back to back (no lost increments)', async () => {
		const { db } = migratedDb();
		const platform = { env: { DB: db } } as never;
		const deps = { ai: ai(), fetchImpl };
		for (let i = 0; i < 20; i++) await judgeWithinBudget(platform, `https://s${i}.example/`, deps);
		await Promise.all(
			Array.from({ length: 20 }, (_, i) => judgeWithinBudget(platform, `https://p${i}.example/`, deps))
		);
		expect(await readUsage(db)).toBe(40);
	});

	it('still blocks on checks that need no model when the cap is reached', async () => {
		const { db, sqlite } = migratedDb();
		sqlite.prepare('INSERT INTO link_gate_budget (day, calls) VALUES (?, 9999)').run(budgetDay());
		const warning = (async () =>
			new Response('<title>Suspected Phishing | Cloudflare</title>', { headers: { 'content-type': 'text/html' } })) as typeof fetch;
		const d = await judgeWithinBudget({ env: { DB: db } } as never, 'https://x.example/', { ai: ai(), fetchImpl: warning });
		expect(d.verdict).toBe('block');
	});

	it('calls the model when the counter cannot be read (for example before the migration)', async () => {
		const model = ai();
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});
		const db = {
			prepare: () => ({
				bind: () => ({
					first: async () => Promise.reject(new Error('no such table: link_gate_budget')),
					run: async () => Promise.reject(new Error('no such table: link_gate_budget'))
				})
			})
		} as unknown as D1Database;
		await judgeWithinBudget({ env: { DB: db, LINK_GATE_DAILY_MODEL_CALLS: '0' } } as never, 'https://a.example/', {
			ai: model,
			fetchImpl
		});
		expect(model.run).toHaveBeenCalledTimes(1);
		expect(JSON.parse(err.mock.calls[0][0] as string)).toEqual({
			event: 'link_gate_budget_error',
			reason: 'counter_write_failed'
		});
	});

	it('uses the default cap for a missing or malformed setting', () => {
		expect(dailyCap(undefined)).toBe(DEFAULT_DAILY_MODEL_CALLS);
		expect(dailyCap('lots')).toBe(DEFAULT_DAILY_MODEL_CALLS);
		expect(dailyCap('-1')).toBe(DEFAULT_DAILY_MODEL_CALLS);
		expect(dailyCap('250')).toBe(250);
	});

	it('counts by UTC day', () => {
		expect(budgetDay(new Date('2026-11-14T23:59:59Z'))).toBe('2026-11-14');
	});
});
