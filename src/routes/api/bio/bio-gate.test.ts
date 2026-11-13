/** Bio page links go through the spam gate on create, add and edit (issue #57). */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import { NOUL_QUESTIONS, type NoulId } from '$server/link-gate/questions';

vi.mock('$server/creation-limits', () => ({ enforceCreationLimits: vi.fn(async () => {}) }));
const { enforceCreationLimits } = await import('$server/creation-limits');
const profiles = await import('./+server');
const bioLinks = await import('./links/+server');

const PAGE = `<title>Page</title><p>${'Normal text. '.repeat(50)}</p>`;
const SCORES: Record<string, Partial<Record<NoulId, number>>> = {
	'phish.example': { scam: 0.95, impersonation: 0.9 }
};

let db: D1Database;
let sqlite: import('node:sqlite').DatabaseSync;
let fetched: string[];
let ai: { run: ReturnType<typeof vi.fn> };

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
	vi.stubGlobal(
		'fetch',
		vi.fn(async (input: RequestInfo | URL) => {
			fetched.push(String(input));
			return new Response(PAGE, { headers: { 'content-type': 'text/html' } });
		})
	);
	ai = {
		run: vi.fn(async (_m: string, input: unknown) => {
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
