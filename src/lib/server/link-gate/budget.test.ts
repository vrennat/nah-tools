import { describe, it, expect, vi, afterEach } from 'vitest';
import { budgetKey, dailyCap, DEFAULT_DAILY_MODEL_CALLS } from './budget';
import { judgeWithinBudget } from './route';
import { NOUL_QUESTIONS } from './questions';

const PAGE = `<title>Shop</title><p>${'Shoes for sale. '.repeat(40)}</p>`;
const fetchImpl = (async () => new Response(PAGE, { headers: { 'content-type': 'text/html' } })) as typeof fetch;

function memoryKv() {
	const m = new Map<string, string>();
	return {
		store: m,
		kv: {
			get: vi.fn(async (k: string) => m.get(k) ?? null),
			put: vi.fn(async (k: string, v: string) => void m.set(k, v))
		} as unknown as KVNamespace
	};
}
const ai = () => ({
	run: vi.fn(async () => ({
		answers: Object.fromEntries(Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: 0.02 }]))
	}))
});

afterEach(() => vi.restoreAllMocks());

describe('daily model-call budget', () => {
	it('counts calls and withholds the model once the cap is reached', async () => {
		const { kv, store } = memoryKv();
		const model = ai();
		const platform = { env: { KV: kv, LINK_GATE_DAILY_MODEL_CALLS: '2' } } as never;
		const deps = { ai: model, fetchImpl };
		expect(await judgeWithinBudget(platform, 'https://a.example/', deps)).toEqual({ verdict: 'allow' });
		expect(await judgeWithinBudget(platform, 'https://b.example/', deps)).toEqual({ verdict: 'allow' });
		expect(store.get(budgetKey())).toBe('2');
		const third = await judgeWithinBudget(platform, 'https://c.example/', deps);
		expect(third).toMatchObject({ verdict: 'allow', log: { event: 'link_gate_allow_unchecked', reason: 'daily_model_cap' } });
		expect(model.run).toHaveBeenCalledTimes(2);
	});

	it('still blocks on checks that need no model when the cap is reached', async () => {
		const { kv, store } = memoryKv();
		store.set(budgetKey(), '9999');
		const warning = (async () =>
			new Response('<title>Suspected Phishing | Cloudflare</title>', { headers: { 'content-type': 'text/html' } })) as typeof fetch;
		const d = await judgeWithinBudget({ env: { KV: kv } } as never, 'https://x.example/', { ai: ai(), fetchImpl: warning });
		expect(d.verdict).toBe('block');
	});

	it('calls the model when the counter cannot be read', async () => {
		const model = ai();
		const kv = { get: vi.fn(async () => Promise.reject(new Error('KV down'))), put: vi.fn() } as unknown as KVNamespace;
		await judgeWithinBudget({ env: { KV: kv, LINK_GATE_DAILY_MODEL_CALLS: '0' } } as never, 'https://a.example/', {
			ai: model,
			fetchImpl
		});
		expect(model.run).toHaveBeenCalledTimes(1);
	});

	it('uses the default cap for a missing or malformed setting', () => {
		expect(dailyCap(undefined)).toBe(DEFAULT_DAILY_MODEL_CALLS);
		expect(dailyCap('lots')).toBe(DEFAULT_DAILY_MODEL_CALLS);
		expect(dailyCap('-1')).toBe(DEFAULT_DAILY_MODEL_CALLS);
		expect(dailyCap('250')).toBe(250);
	});

	it('keys the counter by UTC day', () => {
		expect(budgetKey(new Date('2026-11-14T23:59:59Z'))).toBe('link-gate:model-calls:2026-11-14');
	});
});
