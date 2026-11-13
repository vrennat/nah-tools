/**
 * The background recheck (issue #54) and the daily model-call limit (issue
 * #56) together: rechecks count toward the limit, and a recheck stopped by
 * the limit leaves the link active and logged instead of disabling it.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import { NOUL_QUESTIONS } from '$server/link-gate/questions';
import { readUsage } from '$server/link-gate/budget';

vi.mock('$server/creation-limits', async (orig) => ({
	...(await orig<typeof import('$server/creation-limits')>()),
	enforceCreationLimits: vi.fn(async () => {})
}));
const links = await import('./+server');
const dynamic = await import('../dynamic/+server');
const { enforceCreationLimits } = await import('$server/creation-limits');
const { hashPassphrase } = await import('$server/auth');
const { createLink, createRedirect } = await import('$server/db');

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

describe('recheck within the network share', () => {
	it("refuses a pending recheck once its network's share is used, leaving the link active and logged", async () => {
		const kv = new Map<string, string>();
		const p = {
			env: {
				DB: db,
				AI: ai,
				LINK_GATE_NETWORK_DAILY_MODEL_CALLS: '1',
				KV: {
					get: async (k: string) => kv.get(k) ?? null,
					put: async (k: string, v: string) => void kv.set(k, v),
					delete: async (k: string) => void kv.delete(k)
				}
			},
			context: { waitUntil: (t: Promise<unknown>) => tasks.push(t) }
		};
		const req = new Request('https://nah.tools/api/links', {
			method: 'POST',
			headers: { 'cf-connecting-ip': '2001:db8:7:1::1' },
			body: JSON.stringify({ url: 'https://slow.example/' })
		});
		// The first check (the page is down, so the URL alone) uses the network's one call;
		// the recheck would see the phishing page but is refused by the share.
		const res = await links.POST({ request: req, platform: p } as never);
		expect(res.status).toBe(201);
		await Promise.all(tasks);
		expect(ai.run).toHaveBeenCalledTimes(1);
		expect(sqlite.prepare('SELECT is_active, disabled_reason FROM redirects').get()).toEqual({ is_active: 1, disabled_reason: null });
		expect(events(info).at(-1)).toMatchObject({
			event: 'link_gate_recheck_done',
			verdict: 'block',
			result_event: 'link_gate_network_budget_exhausted',
			reason: 'network_daily_model_cap',
			disabled: false
		});
	});
});

/** A platform with a working KV (for the daily salt) and the given network share. */
function sharePlatform(share: string) {
	const kv = new Map<string, string>();
	return {
		env: {
			DB: db,
			AI: ai,
			LINK_GATE_NETWORK_DAILY_MODEL_CALLS: share,
			KV: {
				get: async (k: string) => kv.get(k) ?? null,
				put: async (k: string, v: string) => void kv.set(k, v),
				delete: async (k: string) => void kv.delete(k)
			}
		},
		context: { waitUntil: (t: Promise<unknown>) => tasks.push(t) }
	};
}
const call = (method: string, body: Record<string, unknown>, ip = '2001:db8:7:1::1') =>
	new Request('https://nah.tools/api/links', { method, headers: { 'cf-connecting-ip': ip }, body: JSON.stringify(body) });

describe('every recheck call site charges the network share', () => {
	const routes: Array<[string, (p: ReturnType<typeof sharePlatform>) => Promise<Response>]> = [
		[
			'PUT /api/links',
			async (p) => {
				await createLink(db, 'code0001', 'https://ok.example/', await hashPassphrase('correct horse'));
				return links.PUT({ request: call('PUT', { short_code: 'code0001', passphrase: 'correct horse', url: 'https://slow.example/' }), platform: p } as never);
			}
		],
		[
			'POST /api/dynamic',
			async (p) => dynamic.POST({ request: call('POST', { url: 'https://slow.example/', passphrase: 'correct horse' }), platform: p } as never)
		],
		[
			'PUT /api/dynamic',
			async (p) => {
				await createRedirect(db, 'qrcode01', 'https://ok.example/', await hashPassphrase('correct horse'));
				return dynamic.PUT({ request: call('PUT', { short_code: 'qrcode01', passphrase: 'correct horse', url: 'https://slow.example/' }), platform: p } as never);
			}
		]
	];

	it.each(routes)('%s: a recheck refused by the share leaves the link active and logged', async (_name, run) => {
		const res = await run(sharePlatform('1'));
		expect([200, 201]).toContain(res.status);
		await Promise.all(tasks);
		// The first check (page down, URL alone) used the network's one call; the recheck is refused.
		expect(ai.run).toHaveBeenCalledTimes(1);
		expect(sqlite.prepare('SELECT is_active, disabled_reason FROM redirects').get()).toEqual({ is_active: 1, disabled_reason: null });
		expect(events(info).at(-1)).toMatchObject({
			event: 'link_gate_recheck_done',
			result_event: 'link_gate_network_budget_exhausted',
			disabled: false
		});
	});
});

describe("a flagged link's owner at an exhausted share", () => {
	it.each([
		['PUT /api/links', (p: ReturnType<typeof sharePlatform>, body: Record<string, unknown>) => links.PUT({ request: call('PUT', body), platform: p } as never)],
		['PUT /api/dynamic', (p: ReturnType<typeof sharePlatform>, body: Record<string, unknown>) => dynamic.PUT({ request: call('PUT', body), platform: p } as never)]
	])('%s: gets the 409 that explains the flag, not 429, and is not charged', async (_name, put) => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response('<p>ok</p>', { headers: { 'content-type': 'text/html' } })));
		const p = sharePlatform('1');
		// This network uses its one call on a link of its own.
		const first = await links.POST({ request: call('POST', { url: 'https://first.example/' }), platform: p } as never);
		expect(first.status).toBe(201);
		await createLink(db, 'flag0001', 'https://bad.example/', await hashPassphrase('correct horse'));
		sqlite.prepare("UPDATE redirects SET is_active = 0, disabled_reason = 'destination_flagged' WHERE short_code = 'flag0001'").run();
		vi.mocked(enforceCreationLimits).mockClear();
		await expect(
			Promise.resolve(put(p, { short_code: 'flag0001', passphrase: 'correct horse', url: 'https://new.example/' }))
		).rejects.toMatchObject({ status: 409, body: { message: expect.stringMatching(/flagged as harmful/) } });
		expect(enforceCreationLimits).not.toHaveBeenCalled();
		// A wrong passphrase stays on the normal path: the share's 429, before the passphrase is checked.
		await expect(
			Promise.resolve(put(p, { short_code: 'flag0001', passphrase: 'wrong passphrase', url: 'https://new.example/' }))
		).rejects.toMatchObject({ status: 429 });
	});
});

