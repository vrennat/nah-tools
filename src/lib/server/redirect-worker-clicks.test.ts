/** The link spam gate's own fetch of a short link is not counted as a click. */
import { describe, it, expect, vi } from 'vitest';
import worker, { LINK_CHECK_UA_MARKER } from '../../../redirect-worker/src/index';
import { followChain } from './link-gate/fetch-chain';

const row = {
	short_code: 'code0001',
	destination_url: 'https://ok.example/',
	is_active: 1,
	expires_at: null,
	passphrase_hash: 'hash',
	utm_source: null,
	utm_medium: null,
	utm_campaign: null,
	utm_term: null,
	utm_content: null
};

async function visit(userAgent: string) {
	const writeDataPoint = vi.fn();
	const env = {
		KV: { get: async () => null, put: async () => {} },
		DB: { prepare: () => ({ bind: () => ({ first: async () => row }) }) },
		CLICKS: { writeDataPoint }
	};
	const res = await worker.fetch(
		new Request('https://go.nah.tools/code0001', { headers: { 'user-agent': userAgent } }),
		env as never,
		{ waitUntil: () => {}, passThroughOnException: () => {} } as never
	);
	expect(res.status).toBe(302);
	return writeDataPoint;
}

describe('click counting', () => {
	it('counts a visitor', async () => {
		expect(await visit('Mozilla/5.0 (iPhone)')).toHaveBeenCalledTimes(1);
	});

	it("does not count the spam gate's own request", async () => {
		let ua = '';
		await followChain('https://go.nah.tools/code0001', {
			fetchImpl: (async (_u: string, init?: RequestInit) => {
				ua = new Headers(init?.headers).get('user-agent') ?? '';
				return new Response('<p>x</p>', { headers: { 'content-type': 'text/html' } });
			}) as typeof fetch,
			forRedirect: false
		});
		expect(ua).toContain(LINK_CHECK_UA_MARKER);
		expect(await visit(ua)).not.toHaveBeenCalled();
	});
});
