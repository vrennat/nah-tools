/** PUT /api/dynamic gates the URL the redirect worker will serve, stored UTM parameters included. */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { migratedDb } from '$server/sqlite-d1';
import { createLink } from '$server/db';
import { hashPassphrase } from '$server/auth';
import { NOUL_QUESTIONS } from '$server/link-gate/questions';

vi.mock('$server/creation-limits', () => ({ enforceCreationLimits: vi.fn(async () => {}) }));
const { PUT } = await import('./+server');

afterEach(() => vi.unstubAllGlobals());

describe('PUT /api/dynamic', () => {
	it('judges the destination with the short link’s stored UTM parameters', async () => {
		const { db, sqlite } = migratedDb();
		await createLink(db, 'utmlink1', 'https://old.example/', await hashPassphrase('correct horse'), {
			utm: { content: 'x' }
		});

		// A redirector that is clean without utm_content and a casino with it.
		const fetched: string[] = [];
		vi.stubGlobal(
			'fetch',
			vi.fn(async (input: RequestInfo | URL) => {
				const url = String(input);
				fetched.push(url);
				return new Response(`<title>Page</title><p>${'Normal text. '.repeat(50)}</p>`, {
					headers: { 'content-type': 'text/html' }
				});
			})
		);
		const ai = {
			run: vi.fn(async (_m: string, input: unknown) => {
				const casino = (input as { state: string }).state.includes('utm_content=x');
				const p = (id: string) => (casino && (id === 'scam' || id === 'gambling' || id === 'urgency') ? 0.95 : 0.02);
				return { answers: { ...Object.fromEntries(Object.keys(NOUL_QUESTIONS).map((id) => [id, { noul: p(id) }])) } };
			})
		};
		const kv = { delete: vi.fn(async () => {}) };
		const request = new Request('https://nah.tools/api/dynamic', {
			method: 'PUT',
			body: JSON.stringify({ short_code: 'utmlink1', passphrase: 'correct horse', url: 'https://new.example/' })
		});

		const res = PUT({
			request,
			platform: { env: { DB: db, KV: kv, AI: ai }, context: { waitUntil: () => {} } }
		} as never);
		await expect(res).rejects.toMatchObject({ status: 400 });
		expect(fetched).toEqual(['https://new.example/?utm_content=x']);
		const row = sqlite.prepare("SELECT destination_url FROM redirects WHERE short_code = 'utmlink1'").get() as {
			destination_url: string;
		};
		expect(row.destination_url).toBe('https://old.example/');
	});
});
