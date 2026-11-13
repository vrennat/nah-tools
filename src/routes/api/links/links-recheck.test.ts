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
/** When set, the recheck's model call (the second one) waits for this, so a test can change the row mid-recheck. */
let modelGate: Promise<void> | null;
let modelCalls: number;

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
	modelGate = null;
	modelCalls = 0;
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
