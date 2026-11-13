import { describe, it, expect, vi } from 'vitest';
import { followChain, findClientRedirect, MAX_HOPS } from './fetch-chain';

type Route = { status?: number; headers?: Record<string, string>; body?: string };

/** Fake fetch over a URL -> response map; records every URL requested. */
function fakeFetch(routes: Record<string, Route>) {
	const calls: string[] = [];
	const impl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = String(input);
		calls.push(url);
		expect(init?.redirect).toBe('manual');
		const r = routes[url];
		if (!r) throw new TypeError(`network error: ${url}`);
		return new Response(r.body ?? '', {
			status: r.status ?? 200,
			headers: { 'content-type': 'text/html', ...r.headers }
		});
	});
	return { impl: impl as unknown as typeof fetch, calls };
}

const html = (title: string, text = 'Welcome to a normal page with plenty of words. '.repeat(20)) =>
	`<html><head><title>${title}</title></head><body><p>${text}</p></body></html>`;

describe('followChain', () => {
	it('returns the page when there is no redirect', async () => {
		const { impl } = fakeFetch({ 'https://a.example/': { body: html('A') } });
		const r = await followChain('https://a.example/', { fetchImpl: impl });
		expect(r.outcome).toBe('page');
		expect(r.finalUrl).toBe('https://a.example/');
		expect(r.body).toContain('<title>A</title>');
	});

	it('follows HTTP redirects to the final page, resolving relative Location', async () => {
		const { impl, calls } = fakeFetch({
			'https://short.example/x': { status: 301, headers: { location: 'https://hop.example/y' } },
			'https://hop.example/y': { status: 302, headers: { location: '/final' } },
			'https://hop.example/final': { body: html('Casino') }
		});
		const r = await followChain('https://short.example/x', { fetchImpl: impl });
		expect(r.outcome).toBe('page');
		expect(r.finalUrl).toBe('https://hop.example/final');
		expect(r.hops.map((h) => h.via)).toEqual(['http', 'http', undefined]);
		expect(calls).toHaveLength(3);
	});

	it('follows a meta refresh on a loader page', async () => {
		const { impl } = fakeFetch({
			'https://loader.example/': {
				body: '<html><head><meta http-equiv="refresh" content="0; url=https://land.example/"></head><body>Loading</body></html>'
			},
			'https://land.example/': { body: html('Landing') }
		});
		const r = await followChain('https://loader.example/', { fetchImpl: impl });
		expect(r.finalUrl).toBe('https://land.example/');
		expect(r.hops[0].via).toBe('meta-refresh');
	});

	it('follows a location script on a loader page', async () => {
		const { impl } = fakeFetch({
			'https://loader.example/': {
				body: '<html><body><script>window.location.replace("https://land.example/p")</script></body></html>'
			},
			'https://land.example/p': { body: html('Landing') }
		});
		const r = await followChain('https://loader.example/', { fetchImpl: impl });
		expect(r.finalUrl).toBe('https://land.example/p');
		expect(r.hops[0].via).toBe('script');
	});

	it('does not follow a conditional redirect script on a page with real content', async () => {
		const page = html('Bank', 'Checking accounts, savings, mortgages and more. '.repeat(30)).replace(
			'</body>',
			'<script>if (lang === "es") { location.href = "/espanol"; }</script></body>'
		);
		const { impl, calls } = fakeFetch({ 'https://bank.example/': { body: page } });
		const r = await followChain('https://bank.example/', { fetchImpl: impl });
		expect(r.outcome).toBe('page');
		expect(calls).toEqual(['https://bank.example/']);
	});

	it('ignores a meta refresh inside <noscript>', async () => {
		expect(
			findClientRedirect('<noscript><meta http-equiv="refresh" content="0; url=/?nojs=1"></noscript><p>app</p>')
		).toBeNull();
	});

	it('stops on a client redirect loop and judges the current page', async () => {
		const { impl } = fakeFetch({
			'https://a.example/': { body: '<script>location.href="https://a.example/b"</script>' },
			'https://a.example/b': { body: '<script>location.href="https://a.example/"</script>' }
		});
		const r = await followChain('https://a.example/', { fetchImpl: impl });
		expect(r.outcome).toBe('page');
		expect(r.finalUrl).toBe('https://a.example/b');
	});

	it(`gives up after ${MAX_HOPS} redirects`, async () => {
		const routes: Record<string, Route> = {};
		for (let i = 0; i < 10; i++) {
			routes[`https://r${i}.example/`] = { status: 302, headers: { location: `https://r${i + 1}.example/` } };
		}
		const { impl, calls } = fakeFetch(routes);
		const r = await followChain('https://r0.example/', { fetchImpl: impl });
		expect(r.outcome).toBe('too-many-hops');
		expect(calls).toHaveLength(MAX_HOPS + 1);
	});

	it.each([
		['IPv4 literal', 'http://127.0.0.1/admin'],
		['decimal IP', 'http://2130706433/'],
		['IPv6 literal', 'http://[::1]/'],
		['localhost', 'http://localhost:8080/'],
		['metadata host by IP', 'http://169.254.169.254/latest/meta-data/'],
		['blocked campaign domain', 'https://bgp09.icu/'],
		['another shortener', 'https://bit.ly/abc'],
		['non-http scheme', 'file:///etc/passwd']
	])('refuses to fetch a hop to %s', async (_name, target) => {
		const { impl, calls } = fakeFetch({
			'https://start.example/': { status: 302, headers: { location: target } }
		});
		const r = await followChain('https://start.example/', { fetchImpl: impl });
		expect(r.outcome).toBe('policy-blocked');
		expect(calls).toEqual(['https://start.example/']);
	});

	it('refuses a meta-refresh hop to a private address', async () => {
		const { impl, calls } = fakeFetch({
			'https://start.example/': { body: '<meta http-equiv="refresh" content="0;url=http://10.0.0.1/">' }
		});
		const r = await followChain('https://start.example/', { fetchImpl: impl });
		expect(r.outcome).toBe('policy-blocked');
		expect(calls).toHaveLength(1);
	});

	it('runs checkHop on later hops only, and stops when it objects', async () => {
		const { impl, calls } = fakeFetch({
			'https://start.example/': { status: 302, headers: { location: 'https://listed.example/' } }
		});
		const checkHop = vi.fn(async (u: string) => (u.includes('listed') ? 'This domain has been blocked.' : null));
		const r = await followChain('https://start.example/', { fetchImpl: impl, checkHop });
		expect(r.outcome).toBe('policy-blocked');
		expect(r.reason).toBe('This domain has been blocked.');
		expect(checkHop).toHaveBeenCalledTimes(1);
		expect(checkHop).toHaveBeenCalledWith('https://listed.example/');
		expect(calls).toEqual(['https://start.example/']);
	});

	it('reports a network error as fetch-failed', async () => {
		const { impl } = fakeFetch({});
		const r = await followChain('https://down.example/', { fetchImpl: impl });
		expect(r.outcome).toBe('fetch-failed');
	});

	it('times out a slow server', async () => {
		const slow = ((_: RequestInfo | URL, init?: RequestInit) =>
			new Promise<Response>((_resolve, reject) => {
				init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
			})) as typeof fetch;
		const r = await followChain('https://slow.example/', { fetchImpl: slow, timeoutMs: 50 });
		expect(r.outcome).toBe('fetch-failed');
		expect(r.reason).toBe('timeout');
	});

	it('reads at most maxBytes of the body', async () => {
		const big = 'x'.repeat(50_000);
		const { impl } = fakeFetch({ 'https://big.example/': { body: big } });
		const r = await followChain('https://big.example/', { fetchImpl: impl, maxBytes: 1000 });
		expect(r.outcome).toBe('page');
		expect(r.body!.length).toBe(1000);
	});

	it('does not read non-text bodies', async () => {
		const { impl } = fakeFetch({
			'https://dl.example/app.apk': { body: 'PK\u0003\u0004binary', headers: { 'content-type': 'application/octet-stream' } }
		});
		const r = await followChain('https://dl.example/app.apk', { fetchImpl: impl });
		expect(r.outcome).toBe('page');
		expect(r.contentType).toBe('application/octet-stream');
		expect(r.body).toBe('');
	});
});
