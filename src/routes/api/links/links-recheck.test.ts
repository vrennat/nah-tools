/**
 * Background recheck of links allowed because the check could not finish
 * (issue #54): real handlers and SQLite, a fake network and a stubbed model.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import { NOUL_QUESTIONS, type NoulId } from '$server/link-gate/questions';

vi.mock('$server/creation-limits', () => ({ enforceCreationLimits: vi.fn(async () => {}) }));
const { enforceCreationLimits } = await import('$server/creation-limits');
const links = await import('./+server');
const lookup = await import('./lookup/+server');
const dynamic = await import('../dynamic/+server');
const bulk = await import('./bulk/+server');
const { hashPassphrase } = await import('$server/auth');
const { createLink: storeLink, createRedirect } = await import('$server/db');
const { recheckDeps } = await import('$server/link-gate/route');

const PAGE = `<title>Page</title><p>${'Normal text. '.repeat(50)}</p>`;

let db: D1Database;
let sqlite: import('node:sqlite').DatabaseSync;
let tasks: Promise<unknown>[];
/** What the destination does on each successive fetch: 'down', 'ok' or 'phish'. */
let behaviour: ('down' | 'ok' | 'phish')[];
let info: { mock: { calls: unknown[][] } };
/** When set, the recheck's model call (the second one) waits for this, so a test can change the row mid-recheck. */
let modelGate: Promise<void> | null;
let modelCalls: number;
let kvStore: Map<string, string>;

function platform() {
	const ai = {
		run: vi.fn(async (_m: string, input: unknown) => {
			if (++modelCalls > 1 && modelGate) await modelGate;
			const phish = (input as { state: string }).state.includes('Claim your prize');
			const p: Partial<Record<NoulId, number>> = phish ? { scam: 0.95, impersonation: 0.9 } : {};
			return { answers: Object.fromEntries(Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: p[id as NoulId] ?? 0.02 }])) };
		})
	};
	return {
		env: {
			DB: db,
			KV: {
				delete: vi.fn(async (k: string) => void kvStore.delete(k)),
				put: vi.fn(async (k: string, v: string) => void kvStore.set(k, v)),
				get: vi.fn(async (k: string) => kvStore.get(k) ?? null)
			},
			AI: ai
		},
		context: { waitUntil: (p: Promise<unknown>) => tasks.push(p) }
	};
}
const req = (method: string, body: unknown) => new Request('https://nah.tools/api/links', { method, body: JSON.stringify(body) });
const row = () =>
	sqlite.prepare('SELECT short_code, destination_url, is_active, disabled_reason FROM redirects').get() as {
		short_code: string;
		destination_url: string;
		is_active: number;
		disabled_reason: string | null;
	};
const events = () =>
	info.mock.calls.map(
		(c) => JSON.parse(c[0] as string) as { event: string; reason: string; verdict?: string; disabled?: boolean; result_event?: string }
	);

beforeEach(() => {
	({ db, sqlite } = migratedDb());
	tasks = [];
	modelGate = null;
	modelCalls = 0;
	kvStore = new Map();
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => {
			const b = behaviour.shift() ?? 'ok';
			if (b === 'down') throw new TypeError('network error');
			const body = b === 'phish' ? '<title>Prize</title><p>Claim your prize now. ' + 'Enter your card. '.repeat(30) + '</p>' : PAGE;
			return new Response(body, { headers: { 'content-type': 'text/html' } });
		})
	);
	info = vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

async function createLink(url = 'https://slow.example/', passphrase?: string) {
	const res = await links.POST({ request: req('POST', { url, passphrase }), platform: platform() } as never);
	expect(res.status).toBe(201);
	await Promise.all(tasks);
}

describe('recheck of a link the first check could not finish', () => {
	it('disables the link when the recheck finds phishing, and the owner sees why', async () => {
		behaviour = ['down', 'phish'];
		await createLink('https://slow.example/', 'correct horse');
		expect(row()).toMatchObject({ is_active: 0, disabled_reason: 'destination_flagged' });
		expect(events()).toEqual([
			expect.objectContaining({ event: 'link_gate_allow_unchecked' }),
			{ event: 'link_gate_recheck_started', host: 'slow.example' },
			expect.objectContaining({ event: 'link_gate_recheck_done', verdict: 'block', result_event: 'link_gate_block', disabled: true })
		]);
		// The disabled row is written to the redirect worker's cache, not just deleted.
		expect(JSON.parse(kvStore.get(`redirect:${row().short_code}`)!)).toMatchObject({
			is_active: 0,
			disabled_reason: 'destination_flagged'
		});
		const res = await lookup.POST({
			request: req('POST', { short_code: row().short_code, passphrase: 'correct horse' }),
			platform: platform()
		} as never);
		expect(await res.json()).toMatchObject({ is_active: 0, disabled_reason: 'destination_flagged' });
	});

	it('leaves the link active when the recheck allows it', async () => {
		behaviour = ['down', 'ok'];
		await createLink();
		expect(row()).toMatchObject({ is_active: 1, disabled_reason: null });
	});

	it('leaves the link active and logs it when the recheck cannot finish either: no waiting state', async () => {
		behaviour = ['down', 'down'];
		await createLink();
		expect(row()).toMatchObject({ is_active: 1, disabled_reason: null });
		expect(events().at(-1)).toMatchObject({
			event: 'link_gate_recheck_done',
			verdict: 'allow',
			result_event: 'link_gate_allow_unchecked',
			disabled: false
		});
	});

	it('does not recheck a link whose first check finished', async () => {
		behaviour = ['ok'];
		await createLink();
		expect(tasks).toHaveLength(0);
	});

	it('does not disable a link whose destination changed before the recheck finished', async () => {
		behaviour = ['down', 'phish'];
		let release!: () => void;
		modelGate = new Promise((r) => (release = r));
		const res = await links.POST({
			request: req('POST', { url: 'https://slow.example/', passphrase: 'correct horse' }),
			platform: platform()
		} as never);
		expect(res.status).toBe(201);
		// The recheck's model call is waiting; the owner re-points the link meanwhile.
		sqlite.prepare("UPDATE redirects SET destination_url = 'https://new.example/'").run();
		release();
		await Promise.all(tasks);
		expect(row()).toMatchObject({ destination_url: 'https://new.example/', is_active: 1, disabled_reason: null });
	});

	it('does not disable a link whose UTM fields changed before the recheck finished', async () => {
		behaviour = ['down', 'phish'];
		let release!: () => void;
		modelGate = new Promise((r) => (release = r));
		const res = await links.POST({
			request: req('POST', { url: 'https://slow.example/', passphrase: 'correct horse', utm: { content: 'a' } }),
			platform: platform()
		} as never);
		expect(res.status).toBe(201);
		// Same destination, new UTM: the served URL the recheck judged is no longer what is stored.
		sqlite.prepare("UPDATE redirects SET utm_content = 'b'").run();
		release();
		await Promise.all(tasks);
		expect(row()).toMatchObject({ is_active: 1, disabled_reason: null });
	});

	it('still disables when the UTM fields are unchanged', async () => {
		behaviour = ['down', 'phish'];
		const res = await links.POST({
			request: req('POST', { url: 'https://slow.example/', utm: { content: 'a' } }),
			platform: platform()
		} as never);
		expect(res.status).toBe(201);
		await Promise.all(tasks);
		expect(row()).toMatchObject({ is_active: 0, disabled_reason: 'destination_flagged' });
	});
});

describe('recheck on the other routes', () => {
	it('rechecks after PUT /api/links and disables a flagged destination', async () => {
		await storeLink(db, 'code0001', 'https://ok.example/', await hashPassphrase('correct horse'));
		behaviour = ['down', 'phish'];
		const res = await links.PUT({
			request: req('PUT', { short_code: 'code0001', passphrase: 'correct horse', url: 'https://slow.example/' }),
			platform: platform()
		} as never);
		expect(res.status).toBe(200);
		await Promise.all(tasks);
		expect(row()).toMatchObject({ destination_url: 'https://slow.example/', is_active: 0, disabled_reason: 'destination_flagged' });
	});

	it('rechecks after POST /api/dynamic', async () => {
		behaviour = ['down', 'phish'];
		const res = await dynamic.POST({
			request: req('POST', { url: 'https://slow.example/', passphrase: 'correct horse' }),
			platform: platform()
		} as never);
		expect(res.status).toBe(201);
		await Promise.all(tasks);
		expect(row()).toMatchObject({ is_active: 0, disabled_reason: 'destination_flagged' });
	});

	it('rechecks after PUT /api/dynamic', async () => {
		await createRedirect(db, 'qrcode01', 'https://ok.example/', await hashPassphrase('correct horse'));
		behaviour = ['down', 'phish'];
		const res = await dynamic.PUT({
			request: req('PUT', { short_code: 'qrcode01', passphrase: 'correct horse', url: 'https://slow.example/' }),
			platform: platform()
		} as never);
		expect(res.status).toBe(200);
		await Promise.all(tasks);
		expect(row()).toMatchObject({ is_active: 0, disabled_reason: 'destination_flagged' });
	});

	it('does not create a bulk link whose check could not finish, and says to create it on its own', async () => {
		behaviour = ['down', 'ok'];
		const res = await bulk.POST({
			request: req('POST', { links: [{ url: 'https://slow.example/' }, { url: 'https://ok.example/' }] }),
			platform: platform()
		} as never);
		const { results } = (await res.json()) as { results: { error?: string }[] };
		expect(results[0].error).toMatch(/Create this link on its own/);
		expect(results[1].error).toBeUndefined();
		expect(sqlite.prepare('SELECT destination_url FROM redirects').all()).toEqual([{ destination_url: 'https://ok.example/' }]);
		expect(tasks).toHaveLength(0);
		// The refused link logged link_gate_allow_unchecked but no recheck started.
		expect(events().filter((e) => e.event === 'link_gate_recheck_started')).toEqual([]);
	});

	it('logs a fixed error code when a recheck fails', async () => {
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});
		behaviour = ['down', 'phish'];
		await links.POST({ request: req('POST', { url: 'https://slow.example/' }), platform: platform() } as never);
		sqlite.exec('DROP TABLE click_logs; DROP TABLE reported_links; ALTER TABLE redirects RENAME TO gone');
		await Promise.all(tasks);
		expect(err.mock.calls.map((c) => JSON.parse(c[0] as string))).toContainEqual({
			event: 'link_gate_recheck_error',
			reason: 'disable_failed'
		});
	});
});

describe('destination changes on a link the recheck disabled', () => {
	beforeEach(async () => {
		await storeLink(db, 'code0001', 'https://ok.example/', await hashPassphrase('correct horse'));
		sqlite.prepare("UPDATE redirects SET is_active = 0, disabled_reason = 'destination_flagged'").run();
	});

	it('refuses the owner before charging the creation allowance', async () => {
		vi.mocked(enforceCreationLimits).mockClear();
		await expect(
			links.PUT({
				request: req('PUT', { short_code: 'code0001', passphrase: 'correct horse', url: 'https://new.example/' }),
				platform: platform()
			} as never)
		).rejects.toMatchObject({ status: 409 });
		expect(enforceCreationLimits).not.toHaveBeenCalled();
	});

	it('gives a wrong passphrase the usual 403, after the creation limits, without saying the link is flagged', async () => {
		vi.mocked(enforceCreationLimits).mockClear();
		for (const route of [links.PUT, dynamic.PUT]) {
			const err = await Promise.resolve(
				route({
					request: req('PUT', { short_code: 'code0001', passphrase: 'wrong passphrase', url: 'https://new.example/' }),
					platform: platform()
				} as never)
			).catch((e: unknown) => e);
			expect(err).toMatchObject({ status: 403, body: { message: 'Invalid passphrase' } });
		}
		expect(enforceCreationLimits).toHaveBeenCalledTimes(2);
	});

	it('refuses PUT /api/links with 409, without checking or storing the new destination', async () => {
		behaviour = [];
		await expect(
			links.PUT({
				request: req('PUT', { short_code: 'code0001', passphrase: 'correct horse', url: 'https://new.example/' }),
				platform: platform()
			} as never)
		).rejects.toMatchObject({ status: 409, body: { message: expect.stringMatching(/flagged as harmful/) } });
		expect(row()).toMatchObject({ destination_url: 'https://ok.example/', is_active: 0 });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('refuses PUT /api/dynamic with 409', async () => {
		await expect(
			dynamic.PUT({
				request: req('PUT', { short_code: 'code0001', passphrase: 'correct horse', url: 'https://new.example/' }),
				platform: platform()
			} as never)
		).rejects.toMatchObject({ status: 409 });
		expect(row()).toMatchObject({ destination_url: 'https://ok.example/', is_active: 0 });
	});
});

describe('recheck budgets', () => {
	it('gives the recheck 10 s for the fetch and 8 s for the model', async () => {
		expect(recheckDeps(undefined, db)).toMatchObject({ fetchTimeoutMs: 10_000, clefTimeoutMs: 8_000 });
	});

	/** POST a link with fake timers, advancing time until the response and then the recheck settle. */
	async function createWithFakeTime(p: ReturnType<typeof platform>) {
		const res = links.POST({ request: req('POST', { url: 'https://slow.example/' }), platform: p } as never);
		await vi.advanceTimersByTimeAsync(5_000);
		expect((await res).status).toBe(201);
		expect(tasks).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(11_000);
		await Promise.all(tasks);
	}

	it('a model answer that takes 6 s times out on the first check but counts in the recheck', async () => {
		vi.useFakeTimers();
		try {
			behaviour = ['phish', 'phish'];
			const p = platform();
			const inner = p.env.AI.run.getMockImplementation()!;
			p.env.AI.run.mockImplementation(async (m: string, input: unknown) => {
				await new Promise((r) => setTimeout(r, 6_000));
				return inner(m, input);
			});
			await createWithFakeTime(p);
			expect(events()[0]).toMatchObject({ event: 'link_gate_allow_unchecked', reason: 'model_timeout' });
			expect(row()).toMatchObject({ is_active: 0, disabled_reason: 'destination_flagged' });
		} finally {
			vi.useRealTimers();
		}
	});

	it('a page that takes 5 s times out on the first check but is read in the recheck', async () => {
		vi.useFakeTimers();
		try {
			vi.stubGlobal(
				'fetch',
				vi.fn(
					(_u: string, init?: RequestInit) =>
						new Promise<Response>((resolve, reject) => {
							const t = setTimeout(() => {
								const body = '<title>Prize</title><p>Claim your prize now. ' + 'Enter your card. '.repeat(30) + '</p>';
								resolve(new Response(body, { headers: { 'content-type': 'text/html' } }));
							}, 5_000);
							init?.signal?.addEventListener('abort', () => {
								clearTimeout(t);
								reject(new DOMException('aborted', 'AbortError'));
							});
						})
				)
			);
			await createWithFakeTime(platform());
			expect(events()[0]).toMatchObject({ event: 'link_gate_allow_unchecked' });
			expect(row()).toMatchObject({ is_active: 0, disabled_reason: 'destination_flagged' });
		} finally {
			vi.useRealTimers();
		}
	});
});
