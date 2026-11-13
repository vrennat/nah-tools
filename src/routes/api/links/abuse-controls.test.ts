/**
 * Route-level checks that every redirect create/update path applies the
 * destination policy and the creation limits.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NOUL_QUESTIONS } from '$server/link-gate/questions';
import * as links from './+server';
import * as bulk from './bulk/+server';
import * as dynamic from '../dynamic/+server';

type Handler = (event: unknown) => Promise<Response>;

// No real network: every destination the gate fetches is a plain page.
beforeEach(() => {
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => new Response(`<title>Page</title><p>${'Text. '.repeat(80)}</p>`, { headers: { 'content-type': 'text/html' } }))
	);
	vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

function fakePlatform(opts: { limiterAllows: boolean }) {
	const inserts: unknown[][] = [];
	const store = new Map<string, string>();
	const stmt = (sql: string) => {
		let params: unknown[] = [];
		const s = {
			bind: (...p: unknown[]) => {
				params = p;
				return s;
			},
			first: async () => {
				// The daily model-call counter: always room for one more call.
				if (/link_gate_budget/.test(sql)) return /^\s*SELECT/i.test(sql) ? { calls: 0 } : { calls: 1 };
				if (/^\s*INSERT/i.test(sql)) {
					inserts.push(params);
					return { short_code: params[0], destination_url: params[1] };
				}
				return null;
			},
			all: async () => ({ results: [] }),
			run: async () => {
				if (/^\s*INSERT/i.test(sql) && !/link_gate_budget/.test(sql)) inserts.push(params);
				return { success: true, meta: { changes: 1 } };
			}
		};
		return s;
	};
	const platform = {
		env: {
			DB: { prepare: stmt },
			KV: {
				get: async (k: string) => store.get(k) ?? null,
				put: async (k: string, v: string) => void store.set(k, v),
				delete: async (k: string) => void store.delete(k)
			},
			CREATE_LIMITER: { limit: async () => ({ success: opts.limiterAllows }) },
			// The spam gate is not under test here: a model that allows everything.
			AI: {
				run: async () => ({
					answers: Object.fromEntries(Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: 0.02 }]))
				})
			}
		},
		context: { waitUntil: () => {} }
	};
	return { platform, inserts };
}

function req(method: string, body: unknown): Request {
	return new Request('https://nah.tools/api/links', {
		method,
		headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7' },
		body: JSON.stringify(body)
	});
}

async function status(handler: Handler, request: Request, platform: unknown): Promise<number> {
	try {
		return (await handler({ request, platform })).status;
	} catch (e) {
		return (e as { status: number }).status;
	}
}

const BLOCKED = 'https://gwmlzgd.sccjlej.com/wqamhcsom?r=y4V3sb';
const GOOD = 'https://example.com/page';
const PASS = 'correct horse battery';

describe('redirect routes apply abuse controls', () => {
	it('POST /api/links creates a link for a good destination', async () => {
		const { platform, inserts } = fakePlatform({ limiterAllows: true });
		expect(await status(links.POST as Handler, req('POST', { url: GOOD }), platform)).toBe(201);
		expect(inserts).toHaveLength(1);
	});

	it('POST /api/links refuses a blocked destination without inserting', async () => {
		const { platform, inserts } = fakePlatform({ limiterAllows: true });
		expect(await status(links.POST as Handler, req('POST', { url: BLOCKED }), platform)).toBe(400);
		expect(inserts).toHaveLength(0);
	});

	it('POST /api/links returns 429 when the limiter refuses', async () => {
		const { platform, inserts } = fakePlatform({ limiterAllows: false });
		expect(await status(links.POST as Handler, req('POST', { url: GOOD }), platform)).toBe(429);
		expect(inserts).toHaveLength(0);
	});

	it('POST /api/links/bulk returns 429 when the limiter refuses', async () => {
		const { platform, inserts } = fakePlatform({ limiterAllows: false });
		const r = req('POST', { links: [{ url: GOOD }, { url: GOOD }] });
		expect(await status(bulk.POST as Handler, r, platform)).toBe(429);
		expect(inserts).toHaveLength(0);
	});

	it('POST /api/links/bulk skips blocked destinations', async () => {
		const { platform, inserts } = fakePlatform({ limiterAllows: true });
		const res = await (bulk.POST as Handler)({
			request: req('POST', { links: [{ url: GOOD }, { url: BLOCKED }] }),
			platform
		});
		const { results } = (await res.json()) as { results: Array<{ error?: string }> };
		expect(results[0].error).toBeUndefined();
		expect(results[1].error).toMatch(/blocked/);
		expect(inserts).toHaveLength(1);
	});

	it('PUT /api/links refuses a blocked destination', async () => {
		const { platform } = fakePlatform({ limiterAllows: true });
		const r = req('PUT', { short_code: 'abc12345', passphrase: PASS, url: BLOCKED });
		expect(await status(links.PUT as Handler, r, platform)).toBe(400);
	});

	it('PUT /api/links is rate limited', async () => {
		const { platform } = fakePlatform({ limiterAllows: false });
		const r = req('PUT', { short_code: 'abc12345', passphrase: PASS, url: GOOD });
		expect(await status(links.PUT as Handler, r, platform)).toBe(429);
	});

	it('POST /api/dynamic refuses a blocked destination', async () => {
		const { platform, inserts } = fakePlatform({ limiterAllows: true });
		const r = req('POST', { url: BLOCKED, passphrase: PASS });
		expect(await status(dynamic.POST as Handler, r, platform)).toBe(400);
		expect(inserts).toHaveLength(0);
	});

	it('POST /api/dynamic is rate limited', async () => {
		const { platform, inserts } = fakePlatform({ limiterAllows: false });
		const r = req('POST', { url: GOOD, passphrase: PASS });
		expect(await status(dynamic.POST as Handler, r, platform)).toBe(429);
		expect(inserts).toHaveLength(0);
	});

	it('PUT /api/dynamic refuses a blocked destination', async () => {
		const { platform } = fakePlatform({ limiterAllows: true });
		const r = req('PUT', { short_code: 'abc12345', passphrase: PASS, url: BLOCKED });
		expect(await status(dynamic.PUT as Handler, r, platform)).toBe(400);
	});

	it('PUT /api/dynamic is rate limited', async () => {
		const { platform } = fakePlatform({ limiterAllows: false });
		const r = req('PUT', { short_code: 'abc12345', passphrase: PASS, url: GOOD });
		expect(await status(dynamic.PUT as Handler, r, platform)).toBe(429);
	});
});
