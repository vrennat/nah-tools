/**
 * Background recheck of links allowed because the check could not finish
 * (issue #54): real handlers and SQLite, a fake network and a stubbed model.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import { NOUL_QUESTIONS, type NoulId } from '$server/link-gate/questions';

vi.mock('$server/creation-limits', () => ({ enforceCreationLimits: vi.fn(async () => {}) }));
const links = await import('./+server');
const lookup = await import('./lookup/+server');

const PAGE = `<title>Page</title><p>${'Normal text. '.repeat(50)}</p>`;

let db: D1Database;
let sqlite: import('node:sqlite').DatabaseSync;
let tasks: Promise<unknown>[];
/** What the destination does on each successive fetch: 'down', 'ok' or 'phish'. */
let behaviour: ('down' | 'ok' | 'phish')[];
let info: { mock: { calls: unknown[][] } };

function platform() {
	const ai = {
		run: vi.fn(async (_m: string, input: unknown) => {
			const phish = (input as { state: string }).state.includes('Claim your prize');
			const p: Partial<Record<NoulId, number>> = phish ? { scam: 0.95, impersonation: 0.9 } : {};
			return { answers: Object.fromEntries(Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: p[id as NoulId] ?? 0.02 }])) };
		})
	};
	return {
		env: { DB: db, KV: { delete: vi.fn(async () => {}) }, AI: ai },
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
const events = () => info.mock.calls.map((c) => JSON.parse(c[0] as string) as { event: string; reason: string; recheck?: true });

beforeEach(() => {
	({ db, sqlite } = migratedDb());
	tasks = [];
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
		expect(events().map((e) => [e.event, e.recheck ?? false])).toEqual([
			['link_gate_allow_unchecked', false],
			['link_gate_block', true]
		]);
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
		expect(events().at(-1)).toMatchObject({ event: 'link_gate_allow_unchecked', recheck: true });
	});

	it('does not recheck a link whose first check finished', async () => {
		behaviour = ['ok'];
		await createLink();
		expect(tasks).toHaveLength(0);
	});

	it('does not disable a link whose destination changed before the recheck finished', async () => {
		behaviour = ['down'];
		const res = await links.POST({
			request: req('POST', { url: 'https://slow.example/', passphrase: 'correct horse' }),
			platform: platform()
		} as never);
		expect(res.status).toBe(201);
		// The owner re-points the link before the recheck lands.
		sqlite.prepare("UPDATE redirects SET destination_url = 'https://new.example/'").run();
		behaviour = ['phish'];
		await Promise.all(tasks);
		expect(row()).toMatchObject({ destination_url: 'https://new.example/', is_active: 1, disabled_reason: null });
	});
});
