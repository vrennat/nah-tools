/**
 * The spam gate on the short-link routes, end to end through the handlers:
 * real handlers and SQLite with migrations, fake destination fetches and a
 * stubbed model. Only a block stops a link; weaker signals are allowed and logged.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import { createLink } from '$server/db';
import { hashPassphrase } from '$server/auth';
import { NOUL_QUESTIONS, type NoulId } from '$server/link-gate/questions';

vi.mock('$server/creation-limits', () => ({ enforceCreationLimits: vi.fn(async () => {}) }));
const links = await import('./+server');
const bulk = await import('./bulk/+server');

const PAGE = `<title>Page</title><p>${'Normal text. '.repeat(50)}</p>`;

/** Destinations by host: a normal page, a suspicious one, a phishing page, an installer. */
const SITES: Record<string, { body: string; headers?: Record<string, string> }> = {
	'ok.example': { body: PAGE },
	'odd.example': { body: PAGE },
	'phish.example': { body: PAGE },
	'files.example': { body: 'MZ', headers: { 'content-type': 'application/vnd.android.package-archive' } }
};
const SCORES: Record<string, Partial<Record<NoulId, number>>> = {
	'odd.example': { scam: 0.6 },
	'phish.example': { scam: 0.95, impersonation: 0.9 }
};

let db: D1Database;
let sqlite: import('node:sqlite').DatabaseSync;
let info: { mock: { calls: unknown[][] } };

function platform() {
	const ai = {
		run: vi.fn(async (_m: string, input: unknown) => {
			const state = (input as { state: string }).state;
			const host = /Final domain: (\S+)/.exec(state)?.[1] ?? '';
			const p = SCORES[host] ?? {};
			return {
				answers: Object.fromEntries(
					Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: p[id as NoulId] ?? 0.02 }])
				)
			};
		})
	};
	return { env: { DB: db, KV: { delete: vi.fn(async () => {}) }, AI: ai }, context: { waitUntil: () => {} } };
}

const req = (method: string, body: unknown) =>
	new Request('https://nah.tools/api/links', { method, body: JSON.stringify(body) });
const rows = () => sqlite.prepare('SELECT destination_url, is_active FROM redirects ORDER BY id').all();
const logged = (): { event: string }[] => info.mock.calls.map((c) => JSON.parse(c[0] as string));

beforeEach(() => {
	({ db, sqlite } = migratedDb());
	vi.stubGlobal(
		'fetch',
		vi.fn(async (input: RequestInfo | URL) => {
			const site = SITES[new URL(String(input)).hostname];
			if (!site) throw new TypeError('network error');
			return new Response(site.body, { headers: { 'content-type': 'text/html', ...site.headers } });
		})
	);
	info = vi.spyOn(console, 'info').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('POST /api/links', () => {
	it('creates an active link for a normal destination, with nothing logged', async () => {
		const res = await links.POST({ request: req('POST', { url: 'https://ok.example/' }), platform: platform() } as never);
		expect(res.status).toBe(201);
		expect(rows()).toEqual([{ destination_url: 'https://ok.example/', is_active: 1 }]);
		expect(logged()).toEqual([]);
	});

	it('creates an active link for a suspicious destination and logs it', async () => {
		const res = await links.POST({ request: req('POST', { url: 'https://odd.example/a?b=c' }), platform: platform() } as never);
		expect(res.status).toBe(201);
		expect(rows()).toEqual([{ destination_url: 'https://odd.example/a?b=c', is_active: 1 }]);
		expect(logged()).toEqual([
			expect.objectContaining({ event: 'link_gate_allow_suspicious', reason: 'model_suspicious', host: 'odd.example' })
		]);
		expect(info.mock.calls[0][0]).not.toContain('b=c');
	});

	it('refuses a phishing destination with a message that says what to do, storing nothing', async () => {
		await expect(
			links.POST({ request: req('POST', { url: 'https://phish.example/' }), platform: platform() } as never)
		).rejects.toMatchObject({ status: 400, body: { message: expect.stringMatching(/report it at/) } });
		expect(rows()).toEqual([]);
		expect(logged()).toEqual([expect.objectContaining({ event: 'link_gate_block', reason: 'model_scam' })]);
	});

	it('refuses a direct link to an app installer', async () => {
		await expect(
			links.POST({ request: req('POST', { url: 'https://files.example/app' }), platform: platform() } as never)
		).rejects.toMatchObject({ status: 400, body: { message: expect.stringMatching(/Link to the page that offers the download/) } });
		expect(rows()).toEqual([]);
		expect(logged()).toEqual([expect.objectContaining({ event: 'link_gate_block_download' })]);
	});

	it('creates the link and logs it as unchecked when the destination cannot be fetched', async () => {
		const res = await links.POST({ request: req('POST', { url: 'https://down.example/' }), platform: platform() } as never);
		expect(res.status).toBe(201);
		expect(rows()).toEqual([{ destination_url: 'https://down.example/', is_active: 1 }]);
		expect(logged()).toEqual([
			expect.objectContaining({ event: 'link_gate_allow_unchecked', reason: 'network_error' }),
			{ event: 'link_gate_recheck_started', host: 'down.example' }
		]);
	});
});

describe('PUT /api/links', () => {
	beforeEach(async () => {
		await createLink(db, 'code0001', 'https://ok.example/', await hashPassphrase('correct horse'));
	});
	const put = (url: string) =>
		links.PUT({
			request: req('PUT', { short_code: 'code0001', passphrase: 'correct horse', url }),
			platform: platform()
		} as never);

	it('changes the destination when it is allowed, and logs a suspicious one', async () => {
		expect((await put('https://odd.example/')).status).toBe(200);
		expect(rows()).toEqual([{ destination_url: 'https://odd.example/', is_active: 1 }]);
		expect(logged()).toEqual([expect.objectContaining({ event: 'link_gate_allow_suspicious' })]);
	});

	it('keeps the old destination when the new one is blocked', async () => {
		await expect(put('https://phish.example/')).rejects.toMatchObject({ status: 400 });
		await expect(put('https://files.example/app')).rejects.toMatchObject({ status: 400 });
		expect(rows()).toEqual([{ destination_url: 'https://ok.example/', is_active: 1 }]);
	});
});

describe('POST /api/links/bulk', () => {
	it('creates allowed links, logs suspicious ones and reports blocked ones per row', async () => {
		const res = await bulk.POST({
			request: req('POST', {
				links: [
					{ url: 'https://ok.example/' },
					{ url: 'https://odd.example/' },
					{ url: 'https://phish.example/' },
					{ url: 'https://files.example/app' }
				]
			}),
			platform: platform()
		} as never);
		const { results } = (await res.json()) as { results: { short_url: string; error?: string }[] };
		expect(results.map((r) => !!r.error)).toEqual([false, false, true, true]);
		expect(results[2].error).toMatch(/phishing or a scam/);
		expect(results[3].error).toMatch(/app installers/);
		expect(rows()).toEqual([
			{ destination_url: 'https://ok.example/', is_active: 1 },
			{ destination_url: 'https://odd.example/', is_active: 1 }
		]);
		expect(logged().map((l) => l.event)).toEqual([
			'link_gate_allow_suspicious',
			'link_gate_block',
			'link_gate_block_download'
		]);
	});

	it('refuses more than 20 links in one request', async () => {
		const many = Array.from({ length: 21 }, (_, i) => ({ url: `https://ok.example/${i}` }));
		await expect(
			bulk.POST({ request: req('POST', { links: many }), platform: platform() } as never)
		).rejects.toMatchObject({ status: 400 });
	});
});
