import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isHttpError } from '@sveltejs/kit';

import { requireTurnstile } from '$server/turnstile';

const platform = (secret?: string) =>
	({ env: { TURNSTILE_SECRET_KEY: secret } }) as unknown as App.Platform;
const request = () => new Request('http://x/', { headers: { 'cf-connecting-ip': '1.2.3.4' } });

const fetchMock = vi.fn();

beforeEach(() => {
	fetchMock.mockReset();
	vi.stubGlobal('fetch', fetchMock);
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('requireTurnstile', () => {
	it('skips verification and warns when the secret is missing', async () => {
		await expect(requireTurnstile(platform(), request(), undefined)).resolves.toBeUndefined();
		expect(fetchMock).not.toHaveBeenCalled();
		expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('TURNSTILE_SECRET_KEY'));
	});

	it('returns 400 when the token is missing', async () => {
		const e = await requireTurnstile(platform('s'), request(), undefined).catch((x) => x);
		expect(isHttpError(e, 400)).toBe(true);
	});

	it('returns 403 when Cloudflare rejects the token', async () => {
		fetchMock.mockResolvedValue(Response.json({ success: false }));
		const e = await requireTurnstile(platform('s'), request(), 'tok').catch((x) => x);
		expect(isHttpError(e, 403)).toBe(true);
	});

	it('passes when Cloudflare accepts the token, forwarding the client IP', async () => {
		fetchMock.mockResolvedValue(Response.json({ success: true }));
		await expect(requireTurnstile(platform('s'), request(), 'tok')).resolves.toBeUndefined();
		const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
		expect(sent).toEqual({ secret: 's', response: 'tok', remoteip: '1.2.3.4' });
	});
});
