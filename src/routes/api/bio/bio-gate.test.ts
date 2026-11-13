/** Bio page links go through the spam gate on create, add and edit (issue #57). */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import { NOUL_QUESTIONS, type NoulId } from '$server/link-gate/questions';

vi.mock('$server/creation-limits', async (orig) => ({
	...(await orig<typeof import('$server/creation-limits')>()),
	enforceCreationLimits: vi.fn(async () => {})
}));
const { enforceCreationLimits } = await import('$server/creation-limits');
const profiles = await import('./+server');
const bioLinks = await import('./links/+server');

const PAGE = `<title>Page</title><p>${'Normal text. '.repeat(50)}</p>`;
const PHISH = { scam: 0.95, impersonation: 0.9 };
const SCORES: Record<string, Partial<Record<NoulId, number>>> = {
	'phish.example': PHISH,
	'nah.tools.evil.example': PHISH,
	'evilnah.tools': PHISH
};

let db: D1Database;
let sqlite: import('node:sqlite').DatabaseSync;
let fetched: string[];
let ai: { run: ReturnType<typeof vi.fn> };
let inFlight: number;
let maxInFlight: number;
let modelFails: boolean;

function platform() {
	return { env: { DB: db, KV: { delete: vi.fn(async () => {}) }, AI: ai }, context: { waitUntil: () => {} } };
}
const req = (method: string, body: unknown) =>
	new Request('https://nah.tools/api/bio', {
		method,
		headers: { 'cf-connecting-ip': `203.0.113.${Math.floor(Math.random() * 250)}` },
		body: JSON.stringify(body)
	});
const linkUrls = () =>
	(sqlite.prepare('SELECT url FROM bio_links ORDER BY order_index').all() as { url: string }[]).map((r) => r.url);

beforeEach(() => {
	({ db, sqlite } = migratedDb());
	fetched = [];
	inFlight = 0;
	maxInFlight = 0;
	modelFails = false;
	vi.stubGlobal(
		'fetch',
		vi.fn(async (input: RequestInfo | URL) => {
			const url = String(input);
			fetched.push(url);
			// go.nah.tools short links redirect to their stored destination.
			if (new URL(url).hostname === 'go.nah.tools') {
				return new Response(null, { status: 302, headers: { location: 'https://phish.example/' } });
			}
			// hop.example/<x> redirects to a nah.tools URL given in its path.
			if (new URL(url).hostname === 'hop.example') {
				const to = { '/to-site': 'https://nah.tools/qr', '/to-short': 'https://go.nah.tools/abc123' }[new URL(url).pathname];
				return new Response(null, { status: 302, headers: { location: to! } });
			}
			inFlight++;
			maxInFlight = Math.max(maxInFlight, inFlight);
			await new Promise((r) => setTimeout(r, 5));
			inFlight--;
			return new Response(PAGE, { headers: { 'content-type': 'text/html' } });
		})
	);
	ai = {
		run: vi.fn(async (_m: string, input: unknown) => {
			if (modelFails) throw new Error('model unavailable');
			const host = /Final domain: (\S+)/.exec((input as { state: string }).state)?.[1] ?? '';
			const p = SCORES[host] ?? {};
			return { answers: Object.fromEntries(Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: p[id as NoulId] ?? 0.02 }])) };
		})
	};
	vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

const create = (handle: string, links: { url: string; title: string }[]) =>
	profiles.POST({
		request: req('POST', { handle, display_name: 'Test', passphrase: 'correct horse', links }),
		platform: platform()
	} as never);

describe('POST /api/bio (create with initial links)', () => {
	it('creates the profile and its links when every link is allowed', async () => {
		const res = await create('alice', [
			{ url: 'https://ok.example/', title: 'Site' },
			{ url: 'https://nah.tools/qr', title: 'My QR tool' }
		]);
		expect(res.status).toBe(201);
		expect(linkUrls()).toEqual(['https://ok.example/', 'https://nah.tools/qr']);
		// Links to nah.tools itself are not fetched or judged.
		expect(fetched).toEqual(['https://ok.example/']);
	});

	it('charges the initial links against the shared link-creation budget, before any check', async () => {
		vi.mocked(enforceCreationLimits).mockClear();
		await create('erin', [
			{ url: 'https://ok.example/a', title: 'A' },
			{ url: 'https://ok.example/b', title: 'B' }
		]);
		expect(enforceCreationLimits).toHaveBeenCalledTimes(1);
		expect(vi.mocked(enforceCreationLimits).mock.calls[0][3]).toBe(2);
	});

	it('creates nothing and checks nothing when the budget is spent', async () => {
		vi.mocked(enforceCreationLimits).mockRejectedValueOnce(Object.assign(new Error('limit'), { status: 429 }));
		await expect(create('fred', [{ url: 'https://ok.example/', title: 'Site' }])).rejects.toMatchObject({ status: 429 });
		expect(fetched).toEqual([]);
		expect(sqlite.prepare('SELECT COUNT(*) AS n FROM bio_profiles').get()).toEqual({ n: 0 });
	});

	it('rejects the whole request, storing nothing, when one link is blocked', async () => {
		await expect(
			create('bob', [
				{ url: 'https://ok.example/', title: 'Site' },
				{ url: 'https://phish.example/', title: 'Prize' }
			])
		).rejects.toMatchObject({ status: 400, body: { message: expect.stringMatching(/phishing or a scam/) } });
		expect(sqlite.prepare('SELECT COUNT(*) AS n FROM bio_profiles').get()).toEqual({ n: 0 });
		expect(linkUrls()).toEqual([]);
	});

	it('judges look-alike hosts instead of trusting them as nah.tools', async () => {
		for (const url of ['https://nah.tools.evil.example/login', 'https://evilnah.tools/']) {
			await expect(create(`look${fetched.length}`, [{ url, title: 'X' }])).rejects.toMatchObject({ status: 400 });
		}
		expect(fetched).toEqual(['https://nah.tools.evil.example/login', 'https://evilnah.tools/']);
	});

	it('follows a go.nah.tools short link to its destination and judges that', async () => {
		await expect(create('gina', [{ url: 'https://go.nah.tools/abc123', title: 'Short' }])).rejects.toMatchObject({
			status: 400
		});
		expect(fetched).toEqual(['https://go.nah.tools/abc123', 'https://phish.example/']);
	});

	it('allows a chain that ends on nah.tools itself in bio mode', async () => {
		const res = await create('lena', [{ url: 'https://hop.example/to-site', title: 'Hop' }]);
		expect(res.status).toBe(201);
		expect(fetched).toEqual(['https://hop.example/to-site', 'https://nah.tools/qr']);
		expect(linkUrls()).toEqual(['https://hop.example/to-site']);
	});

	it('judges where a chain through a go.nah.tools short link ends in bio mode', async () => {
		await expect(create('mona', [{ url: 'https://hop.example/to-short', title: 'Hop' }])).rejects.toMatchObject({
			status: 400
		});
		expect(fetched).toEqual(['https://hop.example/to-short', 'https://go.nah.tools/abc123', 'https://phish.example/']);
		expect(linkUrls()).toEqual([]);
	});

	it('creates the links and logs them as unchecked when the model fails', async () => {
		modelFails = true;
		const res = await create('hank', [{ url: 'https://ok.example/', title: 'Site' }]);
		expect(res.status).toBe(201);
		expect(linkUrls()).toEqual(['https://ok.example/']);
		const info = vi.mocked(console.info).mock.calls.map((c) => JSON.parse(c[0] as string));
		expect(info).toContainEqual(expect.objectContaining({ event: 'link_gate_allow_unchecked', reason: 'model_error' }));
	});

	it('checks initial links in parallel', async () => {
		const res = await create('ivy', [
			{ url: 'https://ok.example/1', title: '1' },
			{ url: 'https://ok.example/2', title: '2' },
			{ url: 'https://ok.example/3', title: '3' }
		]);
		expect(res.status).toBe(201);
		expect(maxInFlight).toBe(3);
	});

	it('checks at most 5 initial links at a time', async () => {
		const res = await create(
			'iris',
			Array.from({ length: 8 }, (_, i) => ({ url: `https://ok.example/${i}`, title: String(i) }))
		);
		expect(res.status).toBe(201);
		expect(linkUrls()).toHaveLength(8);
		expect(maxInFlight).toBe(5);
	});

	it('still rejects a phishing link listed after six slow ones, under a six-connection limit', async () => {
		// Models a Worker invocation: six fetches may wait for headers at once,
		// a seventh is queued, and each check's 3 s fetch budget runs meanwhile.
		// Checking all seven at once let the phishing link time out in the
		// queue and be stored unchecked (review of #62).
		vi.useFakeTimers();
		try {
			let slots = 6;
			const queue: (() => void)[] = [];
			const acquire = (signal: AbortSignal) =>
				new Promise<void>((resolve, reject) => {
					if (slots > 0) return (slots--, resolve());
					const go = () => (slots--, resolve());
					queue.push(go);
					signal.addEventListener('abort', () => {
						const i = queue.indexOf(go);
						if (i >= 0) queue.splice(i, 1);
						reject(new Error('aborted'));
					});
				});
			const release = () => {
				slots++;
				queue.shift()?.();
			};
			const wait = (ms: number, signal: AbortSignal) =>
				new Promise<void>((resolve, reject) => {
					const t = setTimeout(resolve, ms);
					signal.addEventListener('abort', () => (clearTimeout(t), reject(new Error('aborted'))));
				});
			vi.stubGlobal(
				'fetch',
				vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
					const url = new URL(String(input));
					const signal = init!.signal!;
					await acquire(signal);
					try {
						if (signal.aborted) throw new Error('aborted');
						await wait(url.hostname === 'slow.example' ? 3_500 : 50, signal);
						const body =
							url.hostname === 'phish.example' ? '<title>Prize</title><p>' + 'Claim your prize now. '.repeat(30) + '</p>' : PAGE;
						return new Response(body, { headers: { 'content-type': 'text/html' } });
					} finally {
						release();
					}
				})
			);
			// Score the page, not the host: a check that never read the page must not block it.
			ai.run.mockImplementation(async (_m: string, input: unknown) => {
				const phish = (input as { state: string }).state.includes('Claim your prize');
				return {
					answers: Object.fromEntries(
						Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: phish ? (PHISH[id as keyof typeof PHISH] ?? 0.02) : 0.02 }])
					)
				};
			});
			const links = [
				...Array.from({ length: 6 }, (_, i) => ({ url: `https://slow.example/${i}`, title: 'S' })),
				{ url: 'https://phish.example/', title: 'P' }
			];
			const res = Promise.resolve(create('zed', links)).then(
				() => 'stored',
				(e: { status?: number }) => e.status
			);
			await vi.advanceTimersByTimeAsync(20_000);
			expect(await res).toBe(400);
			expect(linkUrls()).toEqual([]);
		} finally {
			vi.useRealTimers();
		}
	});

	it.each([
		['a string', 'https://ok.example/'],
		['an object', { url: 'https://ok.example/', title: 'X' }],
		['a number', 7]
	])('refuses links given as %s', async (_n, links) => {
		await expect(
			profiles.POST({
				request: req('POST', { handle: 'jack', display_name: 'J', passphrase: 'correct horse', links }),
				platform: platform()
			} as never)
		).rejects.toMatchObject({ status: 400, body: { message: 'links must be an array' } });
		expect(fetched).toEqual([]);
	});

	it('skips malformed link entries instead of failing', async () => {
		const res = await profiles.POST({
			request: req('POST', {
				handle: 'kate',
				display_name: 'K',
				passphrase: 'correct horse',
				links: [null, { url: 5, title: 'x' }, { url: 'https://ok.example/', title: 'Good' }]
			}),
			platform: platform()
		} as never);
		expect(res.status).toBe(201);
		expect(linkUrls()).toEqual(['https://ok.example/']);
	});

	it('refuses more than 20 initial links', async () => {
		const many = Array.from({ length: 21 }, (_, i) => ({ url: `https://ok.example/${i}`, title: `L${i}` }));
		await expect(create('carol', many)).rejects.toMatchObject({ status: 400 });
		expect(fetched).toEqual([]);
	});
});

describe('POST and PUT /api/bio/links', () => {
	beforeEach(async () => {
		await create('dana', [{ url: 'https://ok.example/', title: 'Site' }]);
		fetched = [];
	});
	const add = (url: string) =>
		bioLinks.POST({
			request: req('POST', { handle: 'dana', passphrase: 'correct horse', url, title: 'New' }),
			platform: platform()
		} as never);
	const edit = (url: string) => {
		const id = (sqlite.prepare('SELECT id FROM bio_links LIMIT 1').get() as { id: number }).id;
		return bioLinks.PUT({
			request: req('PUT', { handle: 'dana', passphrase: 'correct horse', link_id: id, url }),
			platform: platform()
		} as never);
	};

	it('adds an allowed link', async () => {
		expect((await add('https://ok.example/blog')).status).toBe(201);
		expect(linkUrls()).toContain('https://ok.example/blog');
	});

	it('refuses to add a phishing link', async () => {
		await expect(add('https://phish.example/')).rejects.toMatchObject({ status: 400 });
		expect(linkUrls()).toEqual(['https://ok.example/']);
	});

	it('refuses to change a link to a phishing destination, keeping the old one', async () => {
		await expect(edit('https://phish.example/')).rejects.toMatchObject({ status: 400 });
		expect(linkUrls()).toEqual(['https://ok.example/']);
	});

	it('does not re-check or charge a title-only edit that resends the same URL', async () => {
		vi.mocked(enforceCreationLimits).mockClear();
		const id = (sqlite.prepare('SELECT id FROM bio_links LIMIT 1').get() as { id: number }).id;
		const res = await bioLinks.PUT({
			request: req('PUT', { handle: 'dana', passphrase: 'correct horse', link_id: id, url: 'https://ok.example/', title: 'Renamed' }),
			platform: platform()
		} as never);
		expect(res.status).toBe(200);
		expect(fetched).toEqual([]);
		expect(enforceCreationLimits).not.toHaveBeenCalled();
		expect(sqlite.prepare('SELECT title FROM bio_links').get()).toEqual({ title: 'Renamed' });
	});

	it('changes a link to an allowed destination', async () => {
		expect((await edit('https://ok.example/new')).status).toBe(200);
		expect(linkUrls()).toEqual(['https://ok.example/new']);
	});
});

describe('bio links and the daily model-call limit', () => {
	const today = () => new Date().toISOString().slice(0, 10);
	const atLimit = (calls = 5000) =>
		sqlite.prepare('INSERT INTO link_gate_budget (day, calls) VALUES (?, ?)').run(today(), calls);
	const used = () =>
		(sqlite.prepare('SELECT calls FROM link_gate_budget WHERE day = ?').get(today()) as { calls: number } | undefined)?.calls ?? 0;
	const createWith = (handle: string, links: { url: string; title: string }[], env: Record<string, unknown> = {}) => {
		const p = platform();
		return profiles.POST({
			request: req('POST', { handle, display_name: 'Test', passphrase: 'correct horse', links }),
			platform: { ...p, env: { ...p.env, ...env } }
		} as never);
	};
	const profileCount = () => (sqlite.prepare('SELECT COUNT(*) AS n FROM bio_profiles').get() as { n: number }).n;
	beforeEach(() => vi.mocked(enforceCreationLimits).mockClear());

	it('refuses a new profile with links with 503 at the limit, before charging the allowance or fetching', async () => {
		atLimit();
		await expect(createWith('lim1', [{ url: 'https://ok.example/', title: 'Site' }])).rejects.toMatchObject({
			status: 503,
			body: { message: expect.stringMatching(/paused for today/) }
		});
		expect(enforceCreationLimits).not.toHaveBeenCalled();
		expect(fetched).toEqual([]);
		expect(profileCount()).toBe(0);
	});

	it('counts each initial link check and refuses the whole profile when the limit is reached partway', async () => {
		// Limit 2, four links checked up to five at a time: two model calls get a unit, the
		// others are refused, the request fails with 503 and nothing is written.
		const links = Array.from({ length: 4 }, (_, i) => ({ url: `https://ok.example/${i}`, title: String(i) }));
		await expect(createWith('lim2', links, { LINK_GATE_DAILY_MODEL_CALLS: '2' })).rejects.toMatchObject({ status: 503 });
		expect(ai.run).toHaveBeenCalledTimes(2);
		expect(used()).toBe(2);
		expect(profileCount()).toBe(0);
		expect(linkUrls()).toEqual([]);
	});

	it('creates a profile whose links all point at nah.tools at the limit, since no model call is needed', async () => {
		atLimit();
		const res = await createWith('lim3', [{ url: 'https://nah.tools/qr', title: 'QR' }]);
		expect(res.status).toBe(201);
	});

	it('refuses adding a link at the limit with 503 before charging the allowance', async () => {
		await create('lim4', []);
		atLimit();
		await expect(
			bioLinks.POST({
				request: req('POST', { handle: 'lim4', passphrase: 'correct horse', url: 'https://ok.example/new', title: 'New' }),
				platform: platform()
			} as never)
		).rejects.toMatchObject({ status: 503 });
		expect(enforceCreationLimits).not.toHaveBeenCalled();
	});
});

describe('bio links and the per-network share of model calls', () => {
	const kvStore = new Map<string, string>();
	const shareEnv = (env: Record<string, string>) => {
		const p = platform();
		return {
			...p,
			env: {
				...p.env,
				...env,
				KV: {
					...p.env.KV,
					get: async (k: string) => kvStore.get(k) ?? null,
					put: async (k: string, v: string) => void kvStore.set(k, v)
				}
			}
		};
	};
	const from = (ip: string, method: string, body: unknown) =>
		new Request('https://nah.tools/api/bio', { method, headers: { 'cf-connecting-ip': ip }, body: JSON.stringify(body) });
	const profileCount = () => (sqlite.prepare('SELECT COUNT(*) AS n FROM bio_profiles').get() as { n: number }).n;
	beforeEach(() => {
		kvStore.clear();
		vi.mocked(enforceCreationLimits).mockClear();
	});

	it("charges a new profile's link checks to its network and refuses the profile when the share runs out", async () => {
		const links = Array.from({ length: 3 }, (_, i) => ({ url: `https://ok.example/${i}`, title: String(i) }));
		await expect(
			profiles.POST({
				request: from('198.51.100.7', 'POST', { handle: 'sh1', display_name: 'S', passphrase: 'correct horse', links }),
				platform: shareEnv({ LINK_GATE_NETWORK_DAILY_MODEL_CALLS: '2' })
			} as never)
		).rejects.toMatchObject({ status: 429 });
		expect(ai.run).toHaveBeenCalledTimes(2);
		expect(profileCount()).toBe(0);
	});

	it('refuses adding a bio link from a network over its share before charging the allowance', async () => {
		const env = shareEnv({ LINK_GATE_NETWORK_DAILY_MODEL_CALLS: '1' });
		const created = await profiles.POST({
			request: from('2001:db8:5:1::1', 'POST', {
				handle: 'sh2',
				display_name: 'S',
				passphrase: 'correct horse',
				links: [{ url: 'https://ok.example/', title: 'Site' }]
			}),
			platform: env
		} as never);
		expect(created.status).toBe(201);
		vi.mocked(enforceCreationLimits).mockClear();
		const add = (ip: string) =>
			bioLinks.POST({
				request: from(ip, 'POST', { handle: 'sh2', passphrase: 'correct horse', url: 'https://ok.example/new', title: 'New' }),
				platform: env
			} as never);
		await expect(add('2001:db8:5:1::2')).rejects.toMatchObject({ status: 429 });
		expect(enforceCreationLimits).not.toHaveBeenCalled();
		// Another network has its own share.
		expect((await add('2001:db8:6:1::1')).status).toBe(201);
	});
});
