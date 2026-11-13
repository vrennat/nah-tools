/**
 * Per-network daily share of spam-gate model calls: one network cannot use
 * up the global count and stop link creation for everyone.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import {
	budgetDay,
	networkCap,
	DEFAULT_NETWORK_DAILY_MODEL_CALLS,
	readNetworkUsage,
	readUsage,
	refundNetworkCall,
	reserveNetworkCall,
	blockCap
} from './budget';
import { ipv6BlockKey, judgeWithinBudget, NETWORK_BUDGET_EXHAUSTED_MESSAGE } from './route';
import { NOUL_QUESTIONS } from './questions';

vi.mock('$server/creation-limits', async (orig) => ({
	...(await orig<typeof import('$server/creation-limits')>()),
	enforceCreationLimits: vi.fn(async () => {})
}));
const links = await import('../../../routes/api/links/+server');
const { enforceCreationLimits } = await import('$server/creation-limits');

const PAGE = `<title>Shop</title><p>${'Shoes for sale. '.repeat(40)}</p>`;
let onFetch: () => void;
const fetchImpl = (async () => {
	onFetch();
	return new Response(PAGE, { headers: { 'content-type': 'text/html' } });
}) as typeof fetch;
const ai = () => ({
	run: vi.fn(async () => {
		await new Promise((r) => setTimeout(r, 1));
		return { answers: Object.fromEntries(Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: 0.02 }])) };
	})
});

let db: D1Database;
let sqlite: import('node:sqlite').DatabaseSync;
let info: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
	({ db, sqlite } = migratedDb());
	onFetch = () => {};
	info = vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

const platform = (env: Record<string, unknown> = {}) => ({ env: { DB: db, ...env } }) as never;

describe('per-network share (judgeWithinBudget)', () => {
	it('refuses a network with 429 once its share is used, while another network continues', async () => {
		const model = ai();
		const p = platform({ LINK_GATE_NETWORK_DAILY_MODEL_CALLS: '2' });
		const deps = { ai: model, fetchImpl };
		expect(await judgeWithinBudget(p, 'https://a1.example/', deps, { network: 'net-a' })).toEqual({ verdict: 'allow' });
		expect(await judgeWithinBudget(p, 'https://a2.example/', deps, { network: 'net-a' })).toEqual({ verdict: 'allow' });
		expect(await judgeWithinBudget(p, 'https://a3.example/', deps, { network: 'net-a' })).toMatchObject({
			verdict: 'block',
			httpStatus: 429,
			message: NETWORK_BUDGET_EXHAUSTED_MESSAGE,
			log: { event: 'link_gate_network_budget_exhausted', reason: 'network_daily_model_cap' }
		});
		expect(await judgeWithinBudget(p, 'https://b1.example/', deps, { network: 'net-b' })).toEqual({ verdict: 'allow' });
		expect(model.run).toHaveBeenCalledTimes(3);
		expect(await readNetworkUsage(db, 'net-a')).toBe(2);
		expect(await readUsage(db)).toBe(3);
	});

	it('never overshoots a network share under concurrency: share 3, 30 parallel requests', async () => {
		const model = ai();
		const p = platform({ LINK_GATE_NETWORK_DAILY_MODEL_CALLS: '3' });
		const results = await Promise.all(
			Array.from({ length: 30 }, (_, i) =>
				judgeWithinBudget(p, `https://p${i}.example/`, { ai: model, fetchImpl }, { network: 'net-a' })
			)
		);
		expect(model.run).toHaveBeenCalledTimes(3);
		expect(results.filter((r) => r.verdict === 'block' && r.httpStatus === 429)).toHaveLength(27);
		expect(await readNetworkUsage(db, 'net-a')).toBe(3);
		// The network unit is taken first, so refused calls take nothing from the global count.
		expect(await readUsage(db)).toBe(3);
	});

	it('gives the network unit back when the global count runs out between the early check and the call', async () => {
		const model = ai();
		// The early check sees room; by the time the model is called, another request took the last call.
		onFetch = () => sqlite.prepare('INSERT INTO link_gate_budget (day, calls) VALUES (?, 1)').run(budgetDay());
		const d = await judgeWithinBudget(
			platform({ LINK_GATE_DAILY_MODEL_CALLS: '1' }),
			'https://a.example/',
			{ ai: model, fetchImpl },
			{ network: 'net-a' }
		);
		expect(d).toMatchObject({ verdict: 'block', httpStatus: 503 });
		expect(model.run).not.toHaveBeenCalled();
		expect(await readNetworkUsage(db, 'net-a')).toBe(0);
	});

	it('takes nothing from the global count when the network share runs out between the early check and the call', async () => {
		const model = ai();
		onFetch = () =>
			sqlite.prepare("INSERT INTO link_gate_network_budget (day, network, calls) VALUES (?, 'net-a', 1)").run(budgetDay());
		const d = await judgeWithinBudget(
			platform({ LINK_GATE_NETWORK_DAILY_MODEL_CALLS: '1' }),
			'https://a.example/',
			{ ai: model, fetchImpl },
			{ network: 'net-a' }
		);
		expect(d).toMatchObject({ verdict: 'block', httpStatus: 429 });
		expect(model.run).not.toHaveBeenCalled();
		expect(await readUsage(db)).toBe(0);
	});

	it('never gives back below zero', async () => {
		sqlite.prepare("INSERT INTO link_gate_network_budget (day, network, calls) VALUES (?, 'net-a', 0)").run(budgetDay());
		await refundNetworkCall(db, 'net-a', { ok: true, day: budgetDay() });
		expect(await readNetworkUsage(db, 'net-a')).toBe(0);
	});

	it('gives nothing back when the network reservation failed in D1 and took no unit', async () => {
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});
		sqlite.prepare("INSERT INTO link_gate_network_budget (day, network, calls) VALUES (?, 'net-a', 2)").run(budgetDay());
		// D1 fails the network reservation; the global count is already at its cap of 1 when the call comes.
		const failing = {
			prepare: (sql: string) =>
				/INSERT INTO link_gate_network_budget/.test(sql)
					? { bind: () => ({ first: async () => Promise.reject(new Error('D1 down')) }) }
					: db.prepare(sql)
		} as unknown as D1Database;
		onFetch = () => sqlite.prepare('INSERT INTO link_gate_budget (day, calls) VALUES (?, 1)').run(budgetDay());
		const d = await judgeWithinBudget(
			{ env: { DB: failing, LINK_GATE_DAILY_MODEL_CALLS: '1' } } as never,
			'https://a.example/',
			{ ai: ai(), fetchImpl },
			{ network: 'net-a' }
		);
		expect(d).toMatchObject({ verdict: 'block', httpStatus: 503 });
		expect(await readNetworkUsage(db, 'net-a')).toBe(2);
		expect(err.mock.calls.map((c: unknown[]) => JSON.parse(c[0] as string).reason)).toEqual(['network_counter_write_failed']);
	});

	it('gives back on the day the unit was taken, not the current day', async () => {
		// A unit taken on an earlier day (here a fixed past date), given back after midnight.
		const taken = '2001-01-01';
		const today = budgetDay();
		sqlite.prepare("INSERT INTO link_gate_network_budget (day, network, calls) VALUES (?, 'net-a', 3)").run(taken);
		sqlite.prepare("INSERT INTO link_gate_network_budget (day, network, calls) VALUES (?, 'net-a', 1)").run(today);
		await refundNetworkCall(db, 'net-a', { ok: true, day: taken });
		expect(sqlite.prepare('SELECT day, calls FROM link_gate_network_budget ORDER BY day').all()).toEqual([
			{ day: taken, calls: 2 },
			{ day: today, calls: 1 }
		]);
	});

	it('logs a failed delete of old rows on its own and keeps the reservation', async () => {
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});
		const failing = {
			prepare: (sql: string) =>
				/^DELETE/.test(sql) ? { bind: () => ({ run: async () => Promise.reject(new Error('D1 down')) }) } : db.prepare(sql)
		} as unknown as D1Database;
		expect(await reserveNetworkCall(failing, 'net-a', 60)).toEqual({ ok: true, day: budgetDay() });
		expect(err.mock.calls.map((c: unknown[]) => JSON.parse(c[0] as string).reason)).toEqual(['network_counter_cleanup_failed']);
	});

	it("deletes earlier days' rows on a network's first call of the day", async () => {
		sqlite.prepare("INSERT INTO link_gate_network_budget (day, network, calls) VALUES ('2026-11-01', 'old', 5)").run();
		expect(await reserveNetworkCall(db, 'net-a', 60)).toEqual({ ok: true, day: budgetDay() });
		expect(sqlite.prepare('SELECT day, network, calls FROM link_gate_network_budget').all()).toEqual([
			{ day: budgetDay(), network: 'net-a', calls: 1 }
		]);
	});

	it.each([
		[undefined, DEFAULT_NETWORK_DAILY_MODEL_CALLS],
		['', DEFAULT_NETWORK_DAILY_MODEL_CALLS],
		['0', DEFAULT_NETWORK_DAILY_MODEL_CALLS],
		[' 10 ', 10]
	])('reads the share setting %j as %d', (raw, cap) => {
		expect(networkCap(raw)).toBe(cap);
	});
});

describe('per-network share (POST /api/links)', () => {
	const kv = new Map<string, string>();
	const routePlatform = () => ({
		env: {
			DB: db,
			AI: ai(),
			LINK_GATE_NETWORK_DAILY_MODEL_CALLS: '1',
			KV: {
				get: async (k: string) => kv.get(k) ?? null,
				put: async (k: string, v: string) => void kv.set(k, v),
				delete: async (k: string) => void kv.delete(k)
			}
		},
		context: { waitUntil: () => {} }
	});
	const post = (ip: string, url: string) =>
		links.POST({
			request: new Request('https://nah.tools/api/links', {
				method: 'POST',
				headers: { 'cf-connecting-ip': ip },
				body: JSON.stringify({ url })
			}),
			platform: routePlatform()
		} as never);

	beforeEach(() => {
		kv.clear();
		vi.mocked(enforceCreationLimits).mockClear();
		vi.stubGlobal('fetch', vi.fn(fetchImpl));
	});

	it('refuses a second link from the same network before charging its allowance, and serves another network', async () => {
		expect((await post('203.0.113.7', 'https://one.example/')).status).toBe(201);
		vi.mocked(enforceCreationLimits).mockClear();
		await expect(post('203.0.113.7', 'https://two.example/')).rejects.toMatchObject({
			status: 429,
			body: { message: NETWORK_BUDGET_EXHAUSTED_MESSAGE }
		});
		expect(enforceCreationLimits).not.toHaveBeenCalled();
		// Same IPv6 /64, different address: the same network.
		expect((await post('2001:db8:1:2::1', 'https://three.example/')).status).toBe(201);
		await expect(post('2001:db8:1:2::ffff', 'https://four.example/')).rejects.toMatchObject({ status: 429 });
		expect((await post('198.51.100.9', 'https://five.example/')).status).toBe(201);
		// No address or hash is logged.
		const lines: string[] = info.mock.calls.map((c: unknown[]) => String(c[0]));
		expect(lines.filter((l: string) => /203\.0\.113|2001:db8|198\.51/.test(l))).toEqual([]);
		// Only hashes are stored.
		const stored = sqlite.prepare('SELECT network FROM link_gate_network_budget').all() as { network: string }[];
		// Two IPv4 networks, one IPv6 /64 and its /48 block.
		expect(stored).toHaveLength(4);
		for (const { network } of stored) expect(network).toMatch(/^[0-9a-f]{32}$/);
	});
});

describe('IPv6 /48 block share', () => {
	const usage = (id: string) => readNetworkUsage(db, id);
	const env = (network: string, block: string, extra: Record<string, string> = {}) =>
		platform({ LINK_GATE_NETWORK_DAILY_MODEL_CALLS: network, LINK_GATE_BLOCK_DAILY_MODEL_CALLS: block, ...extra });

	it('keys a /64 network to its /48 and leaves IPv4 without a block', () => {
		expect(ipv6BlockKey('2001:0db8:0001:0002::/64')).toBe('2001:0db8:0001::/48');
		expect(ipv6BlockKey('203.0.113.7')).toBeUndefined();
	});

	it('defaults the block share to 10 times the network share', () => {
		expect(blockCap(undefined, 60)).toBe(600);
		expect(blockCap('', 7)).toBe(70);
		expect(blockCap('250', 60)).toBe(250);
	});

	it('limits many /64 networks inside one /48 together: block share 5, 40 networks in parallel', async () => {
		const model = ai();
		const p = env('3', '5');
		const results = await Promise.all(
			Array.from({ length: 40 }, (_, i) =>
				judgeWithinBudget(p, `https://p${i}.example/`, { ai: model, fetchImpl }, { network: `net-${i}`, block: 'blk-a' })
			)
		);
		expect(model.run).toHaveBeenCalledTimes(5);
		expect(results.filter((r) => r.verdict === 'block' && r.httpStatus === 429)).toHaveLength(35);
		expect(results.find((r) => r.verdict === 'block')).toMatchObject({
			log: { event: 'link_gate_network_budget_exhausted', reason: 'block_daily_model_cap' }
		});
		expect(await usage('blk-a')).toBe(5);
		expect(await readUsage(db)).toBe(5);
		// Refused calls gave back their network units: the 40 networks hold exactly the 5 calls that ran.
		let networks = 0;
		for (let i = 0; i < 40; i++) networks += (await usage(`net-${i}`)) ?? 0;
		expect(networks).toBe(5);
		// Another /48 is unaffected.
		expect(
			await judgeWithinBudget(p, 'https://other.example/', { ai: model, fetchImpl }, { network: 'net-x', block: 'blk-b' })
		).toEqual({ verdict: 'allow' });
	});

	it('gives back the network unit when the block share refuses', async () => {
		// The early check sees room; the block fills up before the model call.
		onFetch = () =>
			sqlite.prepare("INSERT INTO link_gate_network_budget (day, network, calls) VALUES (?, 'blk-a', 5)").run(budgetDay());
		const d = await judgeWithinBudget(env('3', '5'), 'https://a.example/', { ai: ai(), fetchImpl }, { network: 'net-a', block: 'blk-a' });
		expect(d).toMatchObject({ httpStatus: 429, log: { reason: 'block_daily_model_cap' } });
		expect(await usage('net-a')).toBe(0);
		expect(await usage('blk-a')).toBe(5);
		expect(await readUsage(db)).toBe(0);
	});

	it('gives back both the network and the block unit when the global count refuses', async () => {
		onFetch = () => sqlite.prepare('INSERT INTO link_gate_budget (day, calls) VALUES (?, 1)').run(budgetDay());
		const d = await judgeWithinBudget(
			env('3', '5', { LINK_GATE_DAILY_MODEL_CALLS: '1' }),
			'https://a.example/',
			{ ai: ai(), fetchImpl },
			{ network: 'net-a', block: 'blk-a' }
		);
		expect(d).toMatchObject({ httpStatus: 503 });
		expect(await usage('net-a')).toBe(0);
		expect(await usage('blk-a')).toBe(0);
	});

	it('takes nothing from the block or the global count when the network share refuses', async () => {
		onFetch = () =>
			sqlite.prepare("INSERT INTO link_gate_network_budget (day, network, calls) VALUES (?, 'net-a', 3)").run(budgetDay());
		const d = await judgeWithinBudget(env('3', '5'), 'https://a.example/', { ai: ai(), fetchImpl }, { network: 'net-a', block: 'blk-a' });
		expect(d).toMatchObject({ httpStatus: 429, log: { reason: 'network_daily_model_cap' } });
		expect(await usage('blk-a')).toBe(0);
		expect(await readUsage(db)).toBe(0);
	});

	it('reserves the network before the block: with both full mid-check, the network share is reported', async () => {
		onFetch = () => {
			sqlite.prepare("INSERT INTO link_gate_network_budget (day, network, calls) VALUES (?, 'net-a', 3)").run(budgetDay());
			sqlite.prepare("INSERT INTO link_gate_network_budget (day, network, calls) VALUES (?, 'blk-a', 5)").run(budgetDay());
		};
		const d = await judgeWithinBudget(env('3', '5'), 'https://a.example/', { ai: ai(), fetchImpl }, { network: 'net-a', block: 'blk-a' });
		expect(d).toMatchObject({ log: { reason: 'network_daily_model_cap' } });
	});

	it('refuses a /48 over its share with 429 before charging the allowance (POST /api/links)', async () => {
		const kv = new Map<string, string>();
		const p = {
			env: {
				DB: db,
				AI: ai(),
				LINK_GATE_NETWORK_DAILY_MODEL_CALLS: '5',
				LINK_GATE_BLOCK_DAILY_MODEL_CALLS: '2',
				KV: { get: async (k: string) => kv.get(k) ?? null, put: async (k: string, v: string) => void kv.set(k, v) }
			},
			context: { waitUntil: () => {} }
		};
		vi.stubGlobal('fetch', vi.fn(fetchImpl));
		const post = (ip: string, url: string) =>
			links.POST({
				request: new Request('https://nah.tools/api/links', { method: 'POST', headers: { 'cf-connecting-ip': ip }, body: JSON.stringify({ url }) }),
				platform: p
			} as never);
		// Two different /64s in 2001:db8:1::/48 use the block's two calls.
		expect((await post('2001:db8:1:1::1', 'https://one.example/')).status).toBe(201);
		expect((await post('2001:db8:1:2::1', 'https://two.example/')).status).toBe(201);
		vi.mocked(enforceCreationLimits).mockClear();
		await expect(post('2001:db8:1:3::1', 'https://three.example/')).rejects.toMatchObject({
			status: 429,
			body: { message: NETWORK_BUDGET_EXHAUSTED_MESSAGE }
		});
		expect(enforceCreationLimits).not.toHaveBeenCalled();
		// Another /48 and IPv4 are unaffected.
		expect((await post('2001:db8:2:1::1', 'https://four.example/')).status).toBe(201);
		expect((await post('203.0.113.7', 'https://five.example/')).status).toBe(201);
	});
});

