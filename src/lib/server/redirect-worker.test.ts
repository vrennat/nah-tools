/** The redirect worker's answer for a link the spam-gate recheck disabled (issue #54). */
import { describe, it, expect } from 'vitest';
import worker from '../../../redirect-worker/src/index';

function env(row: Record<string, unknown> | null) {
	return {
		KV: { get: async () => null, put: async () => {} },
		DB: { prepare: () => ({ bind: () => ({ first: async () => row }) }) },
		CLICKS: { writeDataPoint: () => {} }
	};
}
const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };
const base = {
	short_code: 'code0001',
	destination_url: 'https://ok.example/',
	expires_at: null,
	passphrase_hash: '',
	utm_source: null,
	utm_medium: null,
	utm_campaign: null,
	utm_term: null,
	utm_content: null
};

describe('redirect worker', () => {
	it('answers 410 with a true reason and a report link for a flagged link', async () => {
		const res = await worker.fetch(
			new Request('https://go.nah.tools/code0001'),
			env({ ...base, is_active: 0, disabled_reason: 'destination_flagged' }) as never,
			ctx as never
		);
		expect(res.status).toBe(410);
		const text = await res.text();
		expect(text).toMatch(/destination was flagged as harmful/);
		expect(text).toMatch(/github\.com\/vrennat\/nah-tools\/issues/);
		expect(text).not.toMatch(/by its owner/);
	});

	it('still says "deactivated by its owner" for an owner-deactivated link, and works without the new column', async () => {
		const res = await worker.fetch(new Request('https://go.nah.tools/code0001'), env({ ...base, is_active: 0 }) as never, ctx as never);
		expect(res.status).toBe(410);
		expect(await res.text()).toMatch(/deactivated by its owner/);
	});

	it('redirects an active link', async () => {
		const res = await worker.fetch(new Request('https://go.nah.tools/code0001'), env({ ...base, is_active: 1 }) as never, ctx as never);
		expect(res.status).toBe(302);
		expect(res.headers.get('location')).toBe('https://ok.example/');
	});
});
